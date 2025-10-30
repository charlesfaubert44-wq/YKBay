import { useState, useEffect } from 'react';
import { Download, Trash2, HardDrive, MapIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import offlineMapManager from '../services/offlineMapManager';

const OfflineMapManagerComponent = ({ onClose }) => {
  const [regions, setRegions] = useState([]);
  const [predefinedRegions, setPredefinedRegions] = useState([]);
  const [activeDownloads, setActiveDownloads] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    loadData();

    // Listen for download events
    const handleDownloadEvent = (event) => {
      switch (event.type) {
        case 'DOWNLOAD_STARTED':
        case 'DOWNLOAD_PROGRESS':
        case 'DOWNLOAD_COMPLETED':
        case 'DOWNLOAD_PAUSED':
        case 'DOWNLOAD_RESUMED':
        case 'DOWNLOAD_CANCELLED':
        case 'REGION_DELETED':
          loadData();
          break;
        default:
          break;
      }
    };

    offlineMapManager.addEventListener(handleDownloadEvent);

    return () => {
      offlineMapManager.removeEventListener(handleDownloadEvent);
    };
  }, []);

  const loadData = async () => {
    await offlineMapManager.initialize();
    setRegions(offlineMapManager.getDownloadedRegions());
    setPredefinedRegions(offlineMapManager.getPredefinedRegions());
    setActiveDownloads(offlineMapManager.getActiveDownloads());

    const stats = await offlineMapManager.getStorageStats();
    setStorageStats(stats);
  };

  const handleDownloadRegion = async (region) => {
    try {
      await offlineMapManager.downloadRegion({
        id: region.id,
        name: region.name,
        bounds: region.bounds,
        layers: ['satellite']
      });

      setSelectedRegion(null);
    } catch (error) {
      alert(`Download failed: ${error.message}`);
    }
  };

  const handleDeleteRegion = async (regionId) => {
    if (confirm('Delete this offline region? This cannot be undone.')) {
      await offlineMapManager.deleteRegion(regionId);
    }
  };

  const handlePauseDownload = (regionId) => {
    offlineMapManager.pauseDownload(regionId);
  };

  const handleResumeDownload = (regionId) => {
    offlineMapManager.resumeDownload(regionId);
  };

  const handleCancelDownload = (regionId) => {
    if (confirm('Cancel this download?')) {
      offlineMapManager.cancelDownload(regionId);
    }
  };

  const formatSize = (mb) => {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-glass max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-ice-blue/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold text-ice-white flex items-center space-x-2">
              <MapIcon size={28} />
              <span>Offline Maps</span>
            </h2>

            <button
              onClick={onClose}
              className="text-ice-blue hover:text-ice-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          {/* Storage Stats */}
          {storageStats && (
            <div className="bg-midnight-dark/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ice-blue">Storage Used</span>
                <span className="text-sm font-semibold text-ice-white">
                  {formatSize(storageStats.totalSizeMB)} / {formatSize(storageStats.availableMB + storageStats.totalSizeMB)}
                </span>
              </div>

              <div className="w-full bg-midnight-dark rounded-full h-2">
                <div
                  className="bg-aurora-green h-2 rounded-full transition-all"
                  style={{ width: `${storageStats.usagePercent || 0}%` }}
                ></div>
              </div>

              <div className="mt-2 text-xs text-ice-blue">
                {regions.length} regions downloaded
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Downloads */}
          {activeDownloads.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-ice-white mb-3 flex items-center space-x-2">
                <Loader size={18} className="animate-spin" />
                <span>Active Downloads</span>
              </h3>

              <div className="space-y-3">
                {activeDownloads.map(download => (
                  <div key={download.id} className="bg-midnight-dark/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-ice-white">{download.region.name}</span>
                      <span className="text-sm text-ice-blue">{download.progress.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-midnight-dark rounded-full h-2 mb-2">
                      <div
                        className="bg-aurora-green h-2 rounded-full transition-all"
                        style={{ width: `${download.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-ice-blue">
                      <span>{download.tilesDownloaded} / {download.totalTiles} tiles</span>

                      <div className="space-x-2">
                        {download.paused ? (
                          <button
                            onClick={() => handleResumeDownload(download.id)}
                            className="text-aurora-green hover:underline"
                          >
                            Resume
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePauseDownload(download.id)}
                            className="text-safety-orange hover:underline"
                          >
                            Pause
                          </button>
                        )}

                        <button
                          onClick={() => handleCancelDownload(download.id)}
                          className="text-safety-red hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downloaded Regions */}
          {regions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-ice-white mb-3 flex items-center space-x-2">
                <CheckCircle size={18} className="text-aurora-green" />
                <span>Downloaded Regions</span>
              </h3>

              <div className="space-y-2">
                {regions.map(region => (
                  <div key={region.regionId} className="bg-midnight-dark/50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-ice-white">{region.name}</div>
                      <div className="text-sm text-ice-blue mt-1">
                        {formatSize(region.sizeMB)} • {region.tilesDownloaded?.toLocaleString()} tiles
                      </div>
                      <div className="text-xs text-ice-blue/70 mt-1">
                        Downloaded {new Date(region.downloadDate).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRegion(region.regionId)}
                      className="text-safety-red hover:bg-safety-red/20 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Regions */}
          <div>
            <h3 className="text-lg font-semibold text-ice-white mb-3 flex items-center space-x-2">
              <Download size={18} />
              <span>Available Regions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predefinedRegions.map(region => {
                const isDownloaded = regions.some(r => r.regionId === region.id);
                const isDownloading = activeDownloads.some(d => d.id === region.id);

                return (
                  <div
                    key={region.id}
                    className={`bg-midnight-dark/50 rounded-lg p-4 border-2 transition-all ${
                      selectedRegion?.id === region.id
                        ? 'border-aurora-green'
                        : 'border-transparent hover:border-ice-blue/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-ice-white">{region.name}</div>
                        <div className="text-sm text-ice-blue mt-1">~{formatSize(region.estimatedSize)}</div>
                      </div>

                      {isDownloaded && (
                        <CheckCircle size={20} className="text-aurora-green" />
                      )}
                    </div>

                    {!isDownloaded && !isDownloading && (
                      <button
                        onClick={() => handleDownloadRegion(region)}
                        className="btn-primary w-full text-sm py-2 mt-2"
                      >
                        <Download size={16} className="inline mr-1" />
                        Download
                      </button>
                    )}

                    {isDownloading && (
                      <div className="text-center text-sm text-aurora-green mt-2">
                        Downloading...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineMapManagerComponent;
