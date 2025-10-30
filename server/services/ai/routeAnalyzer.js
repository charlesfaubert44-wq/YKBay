const turf = require('@turf/turf');

/**
 * AI-powered route analysis service
 * Analyzes crowdsourced GPS tracks to identify safe navigation corridors
 */
class RouteAnalyzer {
  /**
   * Analyze tracks to generate recommended safe routes
   * @param {Array} tracks - Array of track geometries (GeoJSON LineStrings)
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis results with recommended routes and confidence scores
   */
  static analyzeTracks(tracks, options = {}) {
    const {
      gridSize = 0.001, // Grid cell size in degrees (~100m)
      minDensity = 3,    // Minimum tracks through a cell to be considered safe
      bufferDistance = 0.0005 // Buffer distance around tracks
    } = options;

    if (!tracks || tracks.length === 0) {
      return {
        recommendedRoute: null,
        confidence: 0,
        heatmap: null,
        warnings: []
      };
    }

    // Step 1: Create density grid
    const densityGrid = this.createDensityGrid(tracks, gridSize);

    // Step 2: Identify high-density corridors
    const corridors = this.identifyCorridors(densityGrid, minDensity);

    // Step 3: Generate recommended route from corridors
    const recommendedRoute = this.generateRecommendedRoute(corridors, tracks);

    // Step 4: Calculate confidence score
    const confidence = this.calculateConfidence(tracks, recommendedRoute);

    // Step 5: Identify warning zones (areas with diverging tracks)
    const warnings = this.identifyWarningZones(tracks, corridors);

    return {
      recommendedRoute,
      confidence,
      corridors,
      warnings,
      statistics: {
        totalTracks: tracks.length,
        averageTrackLength: this.getAverageTrackLength(tracks),
        coverageArea: this.getCoverageArea(tracks)
      }
    };
  }

  /**
   * Create a density grid showing track frequency
   */
  static createDensityGrid(tracks, gridSize) {
    const grid = new Map();

    tracks.forEach(track => {
      if (!track.geometry || track.geometry.type !== 'LineString') return;

      const coordinates = track.geometry.coordinates;

      coordinates.forEach(([lon, lat]) => {
        // Round to grid cell
        const gridLon = Math.round(lon / gridSize) * gridSize;
        const gridLat = Math.round(lat / gridSize) * gridSize;
        const key = `${gridLon},${gridLat}`;

        grid.set(key, (grid.get(key) || 0) + 1);
      });
    });

    return grid;
  }

  /**
   * Identify high-density navigation corridors
   */
  static identifyCorridors(densityGrid, minDensity) {
    const corridors = [];

    for (const [key, density] of densityGrid.entries()) {
      if (density >= minDensity) {
        const [lon, lat] = key.split(',').map(parseFloat);
        corridors.push({
          coordinates: [lon, lat],
          density: density,
          confidence: Math.min(density / 10, 1) // Normalize to 0-1
        });
      }
    }

    // Sort by density
    return corridors.sort((a, b) => b.density - a.density);
  }

  /**
   * Generate recommended route from high-density corridors
   */
  static generateRecommendedRoute(corridors, originalTracks) {
    if (corridors.length === 0) return null;

    // Find the track that passes through the most high-density corridors
    let bestTrack = null;
    let bestScore = 0;

    originalTracks.forEach(track => {
      if (!track.geometry || track.geometry.type !== 'LineString') return;

      let score = 0;
      const coordinates = track.geometry.coordinates;

      coordinates.forEach(([lon, lat]) => {
        // Check if this point is near a corridor
        const nearCorridor = corridors.find(c => {
          const distance = Math.sqrt(
            Math.pow(c.coordinates[0] - lon, 2) +
            Math.pow(c.coordinates[1] - lat, 2)
          );
          return distance < 0.001; // Within ~100m
        });

        if (nearCorridor) {
          score += nearCorridor.density;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestTrack = track;
      }
    });

    return bestTrack ? bestTrack.geometry : null;
  }

  /**
   * Calculate confidence score for recommended route
   */
  static calculateConfidence(tracks, recommendedRoute) {
    if (!recommendedRoute || tracks.length === 0) return 0;

    // Factors:
    // 1. Number of tracks (more = higher confidence)
    const frequencyScore = Math.min(tracks.length / 20, 1) * 0.4;

    // 2. Diversity of vessel types (more variety = higher confidence)
    const diversityScore = 0.2; // Simplified for now

    // 3. Recency of tracks (recent tracks weighted higher)
    const recentScore = 0.2; // Simplified for now

    // 4. Verification by high-reputation users
    const verificationScore = 0.2; // Simplified for now

    return Math.min(frequencyScore + diversityScore + recentScore + verificationScore, 1);
  }

  /**
   * Identify warning zones where tracks diverge significantly
   */
  static identifyWarningZones(tracks, corridors) {
    const warnings = [];

    // Look for areas with low corridor density
    // These are potential hazard areas where boats spread out

    const allCoordinates = [];
    tracks.forEach(track => {
      if (track.geometry && track.geometry.type === 'LineString') {
        allCoordinates.push(...track.geometry.coordinates);
      }
    });

    // Group coordinates and find areas with high variance
    const clusters = this.clusterCoordinates(allCoordinates);

    clusters.forEach(cluster => {
      const variance = this.calculateVariance(cluster.points);

      if (variance > 0.0001) { // High spread = potential hazard
        warnings.push({
          location: {
            type: 'Point',
            coordinates: cluster.center
          },
          type: 'divergence',
          severity: variance > 0.0005 ? 'high' : 'medium',
          description: 'Tracks diverge significantly in this area - possible hazard or multiple routes'
        });
      }
    });

    return warnings;
  }

  /**
   * Simple clustering algorithm
   */
  static clusterCoordinates(coordinates, clusterSize = 0.005) {
    const clusters = [];

    coordinates.forEach(coord => {
      let foundCluster = false;

      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(cluster.center[0] - coord[0], 2) +
          Math.pow(cluster.center[1] - coord[1], 2)
        );

        if (distance < clusterSize) {
          cluster.points.push(coord);
          // Update center
          cluster.center = [
            cluster.points.reduce((sum, p) => sum + p[0], 0) / cluster.points.length,
            cluster.points.reduce((sum, p) => sum + p[1], 0) / cluster.points.length
          ];
          foundCluster = true;
          break;
        }
      }

      if (!foundCluster) {
        clusters.push({
          center: [coord[0], coord[1]],
          points: [coord]
        });
      }
    });

    return clusters;
  }

  /**
   * Calculate variance of cluster points
   */
  static calculateVariance(points) {
    if (points.length < 2) return 0;

    const center = [
      points.reduce((sum, p) => sum + p[0], 0) / points.length,
      points.reduce((sum, p) => sum + p[1], 0) / points.length
    ];

    const variance = points.reduce((sum, p) => {
      return sum + Math.pow(p[0] - center[0], 2) + Math.pow(p[1] - center[1], 2);
    }, 0) / points.length;

    return variance;
  }

  /**
   * Get average track length
   */
  static getAverageTrackLength(tracks) {
    if (tracks.length === 0) return 0;

    const totalLength = tracks.reduce((sum, track) => {
      if (track.geometry && track.geometry.type === 'LineString') {
        const line = turf.lineString(track.geometry.coordinates);
        return sum + turf.length(line, { units: 'kilometers' });
      }
      return sum;
    }, 0);

    return totalLength / tracks.length;
  }

  /**
   * Get total coverage area
   */
  static getCoverageArea(tracks) {
    if (tracks.length === 0) return 0;

    const allCoordinates = [];
    tracks.forEach(track => {
      if (track.geometry && track.geometry.type === 'LineString') {
        allCoordinates.push(...track.geometry.coordinates);
      }
    });

    if (allCoordinates.length < 3) return 0;

    try {
      const points = allCoordinates.map(coord => turf.point(coord));
      const hull = turf.convex(turf.featureCollection(points));
      return hull ? turf.area(hull) / 1000000 : 0; // Convert to km²
    } catch (error) {
      return 0;
    }
  }
}

module.exports = RouteAnalyzer;
