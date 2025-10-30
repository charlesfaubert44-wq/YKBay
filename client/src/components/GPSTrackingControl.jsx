import { useState, useEffect } from 'react';
import { Play, Square, Pause, MapPin, Save, Wifi, WifiOff, Battery, BatteryWarning } from 'lucide-react';
import gpsTracker from '../services/gpsTracker';

const GPSTrackingControl = () => {
  const [trackingStatus, setTrackingStatus] = useState({
    isTracking: false,
    isPaused: false,
    stats: {
      distance: 0,
      duration: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      pointCount: 0
    },
    batteryLevel: 1,
    samplingInterval: 1000
  });

  const [gpsAccuracy, setGpsAccuracy] = useState('good');
  const [syncStatus, setSyncStatus] = useState('synced');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [trackName, setTrackName] = useState('');

  useEffect(() => {
    // Listen to GPS tracker events
    const handleTrackerEvent = (event) => {
      switch (event.type) {
        case 'TRACKING_STARTED':
          setTrackingStatus(gpsTracker.getStatus());
          break;

        case 'TRACKING_STOPPED':
          setTrackingStatus(gpsTracker.getStatus());
          if (event.saved) {
            setSyncStatus('queued');
          }
          break;

        case 'TRACKING_PAUSED':
          setTrackingStatus(gpsTracker.getStatus());
          break;

        case 'TRACKING_RESUMED':
          setTrackingStatus(gpsTracker.getStatus());
          break;

        case 'POSITION_UPDATE':
          setTrackingStatus(gpsTracker.getStatus());
          break;

        case 'GPS_ACCURACY_WARNING':
          setGpsAccuracy('poor');
          setTimeout(() => setGpsAccuracy('good'), 5000);
          break;

        case 'BATTERY_SAVER_MODE':
          alert(`Battery Saver Mode activated (${Math.round(event.batteryLevel * 100)}% battery)`);
          break;

        case 'GPS_ERROR':
          alert(`GPS Error: ${event.error}`);
          break;

        default:
          break;
      }
    };

    gpsTracker.addEventListener(handleTrackerEvent);

    // Initial status
    setTrackingStatus(gpsTracker.getStatus());

    // Listen for sync events
    const handleTrackSynced = () => {
      setSyncStatus('synced');
    };

    window.addEventListener('trackSynced', handleTrackSynced);

    return () => {
      gpsTracker.removeEventListener(handleTrackerEvent);
      window.removeEventListener('trackSynced', handleTrackSynced);
    };
  }, []);

  const handleStartTracking = async () => {
    try {
      // Request notification permission
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Start tracking
      await gpsTracker.startTracking({
        vesselType: localStorage.getItem('vesselType') || 'unknown'
      });
    } catch (error) {
      alert(`Failed to start tracking: ${error.message}`);
    }
  };

  const handleStopTracking = () => {
    setShowSaveDialog(true);
  };

  const handleSaveTrack = async (saveName) => {
    const trackId = await gpsTracker.stopTracking(true);

    if (trackId && saveName) {
      // Queue for sync
      await gpsTracker.queueTrackForSync(trackId);
      setSyncStatus('syncing');
    }

    setShowSaveDialog(false);
    setTrackName('');
  };

  const handleDiscardTrack = async () => {
    await gpsTracker.stopTracking(false);
    setShowSaveDialog(false);
    setTrackName('');
  };

  const handleAddWaypoint = async () => {
    const note = prompt('Waypoint note (optional):');
    await gpsTracker.addWaypoint(note || '');
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatSpeed = (speed) => {
    return speed.toFixed(1);
  };

  const { isTracking, isPaused, stats, batteryLevel } = trackingStatus;

  return (
    <>
      {/* Main Tracking Control */}
      <div className={`absolute bottom-24 right-4 card-glass ${isTracking ? 'w-80' : 'w-auto'} transition-all`}>
        {!isTracking ? (
          // Start Button
          <button
            onClick={handleStartTracking}
            className="btn-primary flex items-center space-x-2 w-full text-lg py-4"
          >
            <Play size={24} fill="currentColor" />
            <span>Start GPS Tracking</span>
          </button>
        ) : (
          // Tracking Interface
          <div className="space-y-3">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-safety-orange' : 'bg-aurora-green'} animate-pulse`}></div>
                <span className="text-sm font-semibold text-ice-white">
                  {isPaused ? 'Paused' : 'Recording'}
                </span>
              </div>

              {/* Indicators */}
              <div className="flex items-center space-x-2">
                {/* GPS Accuracy */}
                <div className={`${gpsAccuracy === 'poor' ? 'text-safety-red' : 'text-ice-blue'}`}>
                  {gpsAccuracy === 'poor' && (
                    <span className="text-xs mr-1">Low GPS</span>
                  )}
                </div>

                {/* Sync Status */}
                {syncStatus === 'syncing' ? (
                  <Wifi size={16} className="text-aurora-green animate-pulse" />
                ) : syncStatus === 'queued' ? (
                  <WifiOff size={16} className="text-safety-orange" />
                ) : (
                  <Wifi size={16} className="text-ice-blue" />
                )}

                {/* Battery */}
                {batteryLevel < 0.2 ? (
                  <BatteryWarning size={16} className="text-safety-red" />
                ) : (
                  <Battery size={16} className="text-ice-blue" />
                )}
              </div>
            </div>

            {/* Stats Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-midnight-dark/50 rounded-lg p-3">
                <div className="text-xs text-ice-blue mb-1">Distance</div>
                <div className="text-2xl font-bold text-ice-white">{stats.distance.toFixed(2)}</div>
                <div className="text-xs text-ice-blue">km</div>
              </div>

              <div className="bg-midnight-dark/50 rounded-lg p-3">
                <div className="text-xs text-ice-blue mb-1">Duration</div>
                <div className="text-2xl font-bold text-ice-white">{formatDuration(stats.duration)}</div>
                <div className="text-xs text-ice-blue">&nbsp;</div>
              </div>

              <div className="bg-midnight-dark/50 rounded-lg p-3">
                <div className="text-xs text-ice-blue mb-1">Avg Speed</div>
                <div className="text-xl font-bold text-ice-white">{formatSpeed(stats.avgSpeed)}</div>
                <div className="text-xs text-ice-blue">km/h</div>
              </div>

              <div className="bg-midnight-dark/50 rounded-lg p-3">
                <div className="text-xs text-ice-blue mb-1">Points</div>
                <div className="text-xl font-bold text-ice-white">{stats.pointCount}</div>
                <div className="text-xs text-ice-blue">&nbsp;</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddWaypoint}
                className="btn-secondary flex items-center justify-center space-x-1 py-2 text-sm"
              >
                <MapPin size={16} />
                <span>Waypoint</span>
              </button>

              <button
                onClick={handleStopTracking}
                className="bg-safety-red hover:bg-safety-red/80 text-white flex items-center justify-center space-x-1 py-2 text-sm rounded-lg transition-all"
              >
                <Square size={16} />
                <span>Stop & Save</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card-glass max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-display font-bold text-ice-white">Save Track</h3>

            <div className="space-y-2">
              <p className="text-sm text-ice-blue">
                Track recorded: {stats.distance.toFixed(2)} km, {formatDuration(stats.duration)}
              </p>

              <input
                type="text"
                placeholder="Track name (optional)"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                className="input-northern w-full"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDiscardTrack}
                className="btn-secondary"
              >
                Discard
              </button>

              <button
                onClick={() => handleSaveTrack(trackName)}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GPSTrackingControl;
