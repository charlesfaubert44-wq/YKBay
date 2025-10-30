// Offline Map Manager - Download and cache map tiles for offline use
import { addItem, updateItem, getItem, getAllItems, deleteItem } from './db';
import { getStorageEstimate } from './db';

class OfflineMapManager {
  constructor() {
    this.regions = [];
    this.activeDownloads = new Map();
    this.listeners = new Set();

    // Mapbox configuration
    this.mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    this.mapboxStyles = {
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12'
    };

    // Configuration
    this.config = {
      minZoom: 8,
      maxZoom: 16,
      tileSize: 512,
      maxRegions: 10,
      maxStorageMB: 2000, // 2GB max
      compressionQuality: 0.85,
      retryAttempts: 3,
      retryDelay: 1000
    };

    // Predefined regions (Great Slave Lake areas)
    this.predefinedRegions = [
      {
        id: 'yellowknife-bay',
        name: 'Yellowknife Bay',
        bounds: [
          [-114.5, 62.35], // Southwest
          [-114.2, 62.55]  // Northeast
        ],
        estimatedSize: 180 // MB
      },
      {
        id: 'east-arm',
        name: 'East Arm',
        bounds: [
          [-110.5, 62.2],
          [-109.0, 62.8]
        ],
        estimatedSize: 520
      },
      {
        id: 'north-arm',
        name: 'North Arm',
        bounds: [
          [-113.0, 62.8],
          [-111.5, 63.3]
        ],
        estimatedSize: 450
      },
      {
        id: 'mcleod-bay',
        name: 'McLeod Bay',
        bounds: [
          [-111.5, 62.3],
          [-110.5, 62.7]
        ],
        estimatedSize: 280
      }
    ];
  }

  // Initialize - load saved regions
  async initialize() {
    try {
      this.regions = await getAllItems('offlineMaps');
      console.log(`Loaded ${this.regions.length} offline map regions`);
      return true;
    } catch (error) {
      console.error('Failed to initialize offline maps:', error);
      return false;
    }
  }

  // Get predefined regions
  getPredefinedRegions() {
    return this.predefinedRegions;
  }

  // Estimate download size for region
  estimateRegionSize(bounds, layers = ['satellite'], zoomRange = [8, 16]) {
    const [minZoom, maxZoom] = zoomRange;
    const [sw, ne] = bounds;

    // Calculate number of tiles
    let totalTiles = 0;

    for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
      const tilesX = this.getTileCount(sw[0], ne[0], zoom);
      const tilesY = this.getTileCount(sw[1], ne[1], zoom);
      totalTiles += tilesX * tilesY;
    }

    // Estimate size per tile (varies by zoom and layer type)
    const avgTileSizeKB = layers.includes('satellite') ? 50 : 20; // Satellite larger than vector
    const estimatedSizeMB = (totalTiles * avgTileSizeKB * layers.length) / 1024;

    return {
      tiles: totalTiles,
      sizeMB: Math.round(estimatedSizeMB),
      layers: layers.length
    };
  }

  // Calculate tile count for dimension
  getTileCount(min, max, zoom) {
    const scale = Math.pow(2, zoom);
    const minTile = Math.floor((min + 180) / 360 * scale);
    const maxTile = Math.floor((max + 180) / 360 * scale);
    return Math.abs(maxTile - minTile) + 1;
  }

  // Download region
  async downloadRegion(regionConfig) {
    const {
      id = `region_${Date.now()}`,
      name,
      bounds,
      layers = ['satellite'],
      zoomRange = [this.config.minZoom, this.config.maxZoom],
      priority = 'normal'
    } = regionConfig;

    // Check if already downloading
    if (this.activeDownloads.has(id)) {
      console.warn('Region already downloading:', id);
      return false;
    }

    // Check storage availability
    const storageInfo = await getStorageEstimate();
    if (storageInfo) {
      const availableMB = storageInfo.available / (1024 * 1024);
      const estimate = this.estimateRegionSize(bounds, layers, zoomRange);

      if (availableMB < estimate.sizeMB) {
        throw new Error(`Insufficient storage. Need ${estimate.sizeMB}MB, available ${Math.round(availableMB)}MB`);
      }
    }

    // Create region record
    const region = {
      id,
      regionId: id,
      name,
      bounds,
      layers,
      zoomRange,
      downloadDate: Date.now(),
      lastAccessed: Date.now(),
      status: 'downloading',
      progress: 0,
      tilesDownloaded: 0,
      totalTiles: 0,
      sizeMB: 0
    };

    // Save initial region
    await addItem('offlineMaps', region);
    this.regions.push(region);

    // Start download
    const download = {
      id,
      region,
      status: 'downloading',
      progress: 0,
      tilesDownloaded: 0,
      totalTiles: 0,
      errors: [],
      startTime: Date.now(),
      paused: false
    };

    this.activeDownloads.set(id, download);

    // Notify listeners
    this.notifyListeners({
      type: 'DOWNLOAD_STARTED',
      region
    });

    // Start downloading tiles
    this.downloadTiles(download);

    return id;
  }

  // Download tiles for region
  async downloadTiles(download) {
    const { region } = download;
    const [sw, ne] = region.bounds;
    const [minZoom, maxZoom] = region.zoomRange;

    // Calculate all tiles needed
    const tilesToDownload = [];

    for (const layer of region.layers) {
      for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
        const tiles = this.getTilesInBounds(sw, ne, zoom);

        tiles.forEach(tile => {
          tilesToDownload.push({
            ...tile,
            layer,
            url: this.getTileUrl(tile.x, tile.y, tile.z, layer)
          });
        });
      }
    }

    download.totalTiles = tilesToDownload.length;
    region.totalTiles = tilesToDownload.length;

    console.log(`Downloading ${tilesToDownload.length} tiles for region ${region.name}`);

    // Download tiles in batches
    const batchSize = 10; // Download 10 tiles concurrently
    let totalSize = 0;

    for (let i = 0; i < tilesToDownload.length; i += batchSize) {
      // Check if paused or cancelled
      if (download.paused) {
        console.log('Download paused:', region.id);
        return;
      }

      if (!this.activeDownloads.has(download.id)) {
        console.log('Download cancelled:', region.id);
        return;
      }

      // Get batch
      const batch = tilesToDownload.slice(i, i + batchSize);

      // Download batch
      const results = await Promise.allSettled(
        batch.map(tile => this.downloadTile(tile, region.id))
      );

      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          download.tilesDownloaded++;
          totalSize += result.value.size;
        } else {
          download.errors.push({
            tile: batch[index],
            error: result.reason
          });
        }
      });

      // Update progress
      download.progress = (download.tilesDownloaded / download.totalTiles) * 100;
      region.progress = download.progress;
      region.tilesDownloaded = download.tilesDownloaded;
      region.sizeMB = totalSize / (1024 * 1024);

      // Update region in DB
      await updateItem('offlineMaps', region);

      // Notify listeners
      this.notifyListeners({
        type: 'DOWNLOAD_PROGRESS',
        regionId: region.id,
        progress: download.progress,
        tilesDownloaded: download.tilesDownloaded,
        totalTiles: download.totalTiles
      });

      console.log(`Progress: ${download.progress.toFixed(1)}% (${download.tilesDownloaded}/${download.totalTiles})`);
    }

    // Complete download
    region.status = 'completed';
    region.downloadDate = Date.now();
    await updateItem('offlineMaps', region);

    this.activeDownloads.delete(download.id);

    console.log(`Download completed: ${region.name}`, {
      tiles: download.tilesDownloaded,
      errors: download.errors.length,
      duration: ((Date.now() - download.startTime) / 1000).toFixed(1) + 's'
    });

    this.notifyListeners({
      type: 'DOWNLOAD_COMPLETED',
      region,
      stats: {
        tilesDownloaded: download.tilesDownloaded,
        errors: download.errors.length,
        sizeMB: region.sizeMB
      }
    });
  }

  // Download single tile
  async downloadTile(tile, regionId, attempt = 1) {
    try {
      const response = await fetch(tile.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      // Store tile in IndexedDB
      const tileData = {
        tileId: `${tile.layer}_${tile.z}_${tile.x}_${tile.y}`,
        regionId,
        x: tile.x,
        y: tile.y,
        z: tile.z,
        layer: tile.layer,
        data: arrayBuffer,
        size: arrayBuffer.byteLength,
        downloadDate: Date.now()
      };

      await addItem('mapTiles', tileData);

      return {
        success: true,
        size: arrayBuffer.byteLength
      };
    } catch (error) {
      console.error(`Tile download failed (${tile.z}/${tile.x}/${tile.y}):`, error);

      // Retry
      if (attempt < this.config.retryAttempts) {
        await this.sleep(this.config.retryDelay * attempt);
        return this.downloadTile(tile, regionId, attempt + 1);
      }

      throw error;
    }
  }

  // Get tiles in bounds
  getTilesInBounds(sw, ne, zoom) {
    const tiles = [];
    const scale = Math.pow(2, zoom);

    const minX = Math.floor((sw[0] + 180) / 360 * scale);
    const maxX = Math.floor((ne[0] + 180) / 360 * scale);
    const minY = Math.floor((1 - Math.log(Math.tan(ne[1] * Math.PI / 180) + 1 / Math.cos(ne[1] * Math.PI / 180)) / Math.PI) / 2 * scale);
    const maxY = Math.floor((1 - Math.log(Math.tan(sw[1] * Math.PI / 180) + 1 / Math.cos(sw[1] * Math.PI / 180)) / Math.PI) / 2 * scale);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push({ x, y, z: zoom });
      }
    }

    return tiles;
  }

  // Get tile URL
  getTileUrl(x, y, z, layer) {
    // Mapbox raster tiles
    const styleId = layer === 'satellite' ? 'satellite-v9' : 'dark-v10';
    return `https://api.mapbox.com/styles/v1/mapbox/${styleId}/tiles/${z}/${x}/${y}?access_token=${this.mapboxToken}`;
  }

  // Pause download
  pauseDownload(regionId) {
    const download = this.activeDownloads.get(regionId);

    if (download) {
      download.paused = true;
      console.log('Download paused:', regionId);

      this.notifyListeners({
        type: 'DOWNLOAD_PAUSED',
        regionId
      });
    }
  }

  // Resume download
  async resumeDownload(regionId) {
    const download = this.activeDownloads.get(regionId);

    if (download && download.paused) {
      download.paused = false;
      console.log('Download resumed:', regionId);

      this.notifyListeners({
        type: 'DOWNLOAD_RESUMED',
        regionId
      });

      // Continue downloading
      this.downloadTiles(download);
    }
  }

  // Cancel download
  async cancelDownload(regionId) {
    const download = this.activeDownloads.get(regionId);

    if (download) {
      this.activeDownloads.delete(regionId);

      // Delete region and tiles
      await this.deleteRegion(regionId);

      console.log('Download cancelled:', regionId);

      this.notifyListeners({
        type: 'DOWNLOAD_CANCELLED',
        regionId
      });
    }
  }

  // Delete region
  async deleteRegion(regionId) {
    try {
      // Delete region record
      await deleteItem('offlineMaps', regionId);

      // Delete all tiles for region
      const db = await import('./db').then(m => m.openDB());
      const tx = db.transaction('mapTiles', 'readwrite');
      const store = tx.objectStore('mapTiles');
      const index = store.index('regionId');
      const tiles = await index.getAllKeys(regionId);

      for (const tileId of tiles) {
        await store.delete(tileId);
      }

      // Remove from regions array
      this.regions = this.regions.filter(r => r.regionId !== regionId);

      console.log('Region deleted:', regionId);

      this.notifyListeners({
        type: 'REGION_DELETED',
        regionId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete region:', error);
      return false;
    }
  }

  // Get offline tile (for map rendering)
  async getOfflineTile(x, y, z, layer = 'satellite') {
    const tileId = `${layer}_${z}_${x}_${y}`;

    try {
      const tile = await getItem('mapTiles', tileId);

      if (tile) {
        // Update last accessed
        const region = await getItem('offlineMaps', tile.regionId);
        if (region) {
          region.lastAccessed = Date.now();
          await updateItem('offlineMaps', region);
        }

        // Return tile as blob URL
        const blob = new Blob([tile.data]);
        return URL.createObjectURL(blob);
      }

      return null;
    } catch (error) {
      console.error('Failed to get offline tile:', error);
      return null;
    }
  }

  // Get downloaded regions
  getDownloadedRegions() {
    return this.regions.filter(r => r.status === 'completed');
  }

  // Get active downloads
  getActiveDownloads() {
    return Array.from(this.activeDownloads.values());
  }

  // Get storage stats
  async getStorageStats() {
    const estimate = await getStorageEstimate();
    const regions = await getAllItems('offlineMaps');

    const totalSizeMB = regions.reduce((sum, r) => sum + (r.sizeMB || 0), 0);

    return {
      regions: regions.length,
      totalSizeMB: Math.round(totalSizeMB),
      availableMB: estimate ? Math.round(estimate.available / (1024 * 1024)) : null,
      usagePercent: estimate ? parseFloat(estimate.usagePercent) : null
    };
  }

  // Clean up old regions
  async cleanupOldRegions(keepCount = 5) {
    const regions = await getAllItems('offlineMaps');

    // Sort by last accessed
    regions.sort((a, b) => a.lastAccessed - b.lastAccessed);

    // Delete oldest regions beyond keepCount
    const toDelete = regions.slice(0, Math.max(0, regions.length - keepCount));

    for (const region of toDelete) {
      await this.deleteRegion(region.regionId);
    }

    console.log(`Cleaned up ${toDelete.length} old regions`);

    return toDelete.length;
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add event listener
  addEventListener(callback) {
    this.listeners.add(callback);
  }

  // Remove event listener
  removeEventListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const offlineMapManager = new OfflineMapManager();
export default offlineMapManager;
