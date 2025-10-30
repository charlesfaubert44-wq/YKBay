import { useState, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl';
import { Layers, AlertTriangle, Info, Download, MapPin, Shield } from 'lucide-react';
import GPSTrackingControl from '../components/GPSTrackingControl';
import HazardAlertBanner from '../components/HazardAlertBanner';
import OfflineMapManagerComponent from '../components/OfflineMapManager';
import QuickHazardReport from '../components/QuickHazardReport';
import gpsTracker from '../services/gpsTracker';
import hazardAlert from '../services/hazardAlert';
import { requestNotificationPermission } from '../services/serviceWorkerRegistration';

// Great Slave Lake coordinates (Yellowknife Bay area)
const INITIAL_VIEW_STATE = {
  longitude: -114.3718,
  latitude: 62.4540,
  zoom: 10
};

const MapView = () => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showOfficialRoutes, setShowOfficialRoutes] = useState(true);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');
  const [showOfflineMapManager, setShowOfflineMapManager] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [reportPosition, setReportPosition] = useState(null);
  const [currentTrackLine, setCurrentTrackLine] = useState(null);
  const [hazardAlertActive, setHazardAlertActive] = useState(false);

  const mapRef = useRef();

  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission();

    // Start hazard alert service
    hazardAlert.start({
      verifiedOnly: false,
      minConfidence: 0.5
    });

    setHazardAlertActive(true);

    // Listen for GPS tracker position updates to draw track
    const handleTrackerEvent = (event) => {
      if (event.type === 'POSITION_UPDATE') {
        const track = gpsTracker.getCurrentTrack();
        if (track && track.positions.length > 1) {
          // Create GeoJSON line from positions
          const coordinates = track.positions.map(p => [p.longitude, p.latitude]);
          setCurrentTrackLine({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates
            }
          });
        }
      } else if (event.type === 'TRACKING_STOPPED') {
        setCurrentTrackLine(null);
      }
    };

    gpsTracker.addEventListener(handleTrackerEvent);

    // Listen for hazard view requests
    const handleViewHazard = (event) => {
      const { lat, lng } = event.detail;
      setViewState(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        zoom: 14
      }));
    };

    window.addEventListener('viewHazard', handleViewHazard);

    return () => {
      gpsTracker.removeEventListener(handleTrackerEvent);
      window.removeEventListener('viewHazard', handleViewHazard);
      hazardAlert.stop();
    };
  }, []);

  // Sample track data (replace with actual data from API)
  const sampleTracks = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { weight: 10 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [-114.3718, 62.4540],
            [-114.3500, 62.4600],
            [-114.3300, 62.4650]
          ]
        }
      }
    ]
  };

  // Sample hazard data
  const sampleHazards = [
    { id: 1, lng: -114.3600, lat: 62.4570, type: 'reef', severity: 'high' },
    { id: 2, lng: -114.3400, lat: 62.4620, type: 'rock', severity: 'medium' }
  ];

  const handleMapClick = (event) => {
    // Long press or right-click to report hazard
    if (event.originalEvent.button === 2 || event.originalEvent.type === 'contextmenu') {
      event.preventDefault();
      const { lngLat } = event;
      setReportPosition({ lat: lngLat.lat, lng: lngLat.lng });
      setShowQuickReport(true);
    }
  };

  const handleHazardReported = () => {
    // Reload hazards after reporting
    hazardAlert.loadHazards();
  };

  const heatmapLayer = {
    id: 'track-heatmap',
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['get', 'weight'],
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(74, 144, 164, 0)',
        0.2, 'rgba(26, 77, 46, 0.4)',
        0.4, 'rgba(122, 45, 142, 0.6)',
        0.6, 'rgba(212, 165, 116, 0.8)',
        1, 'rgba(212, 165, 116, 1)'
      ],
      'heatmap-radius': 30,
      'heatmap-opacity': 0.7
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleMapClick}
        onContextMenu={handleMapClick}
        mapStyle={mapStyle}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN_HERE'}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Track Heatmap */}
        {showHeatmap && (
          <Source id="tracks" type="geojson" data={sampleTracks}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {/* Current GPS Track (Live Recording) */}
        {currentTrackLine && (
          <Source id="current-track" type="geojson" data={currentTrackLine}>
            <Layer
              id="current-track-line"
              type="line"
              paint={{
                'line-color': '#1a4d2e',
                'line-width': 4,
                'line-opacity': 0.9
              }}
            />
          </Source>
        )}

        {/* Hazard Markers */}
        {showHazards && sampleHazards.map(hazard => (
          <Marker
            key={hazard.id}
            longitude={hazard.lng}
            latitude={hazard.lat}
          >
            <div className="relative">
              <div className="hazard-marker"></div>
              <AlertTriangle
                size={32}
                className={`relative z-10 ${
                  hazard.severity === 'high' ? 'text-safety-red' :
                  hazard.severity === 'medium' ? 'text-safety-orange' :
                  'text-safety-yellow'
                }`}
                fill="currentColor"
              />
            </div>
          </Marker>
        ))}
      </Map>

      {/* Map Controls Panel */}
      <div className="absolute top-20 left-4 card-glass max-w-xs">
        <h3 className="text-lg font-display font-bold text-ice-white mb-4 flex items-center">
          <Layers size={20} className="mr-2" />
          Map Layers
        </h3>

        <div className="space-y-3">
          <LayerToggle
            label="Community Tracks Heatmap"
            checked={showHeatmap}
            onChange={setShowHeatmap}
          />
          <LayerToggle
            label="Hazard Markers"
            checked={showHazards}
            onChange={setShowHazards}
          />
          <LayerToggle
            label="Official Routes"
            checked={showOfficialRoutes}
            onChange={setShowOfficialRoutes}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-ice-blue/20">
          <label className="text-sm text-ice-blue mb-2 block">Map Style</label>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="input-northern text-sm py-2"
          >
            <option value="mapbox://styles/mapbox/satellite-streets-v12">Satellite</option>
            <option value="mapbox://styles/mapbox/dark-v11">Dark</option>
            <option value="mapbox://styles/mapbox/outdoors-v12">Outdoors</option>
          </select>
        </div>
      </div>

      {/* Current Conditions Panel */}
      <div className="absolute bottom-20 left-4 card-glass max-w-xs">
        <h3 className="text-sm font-semibold text-ice-white mb-2 flex items-center">
          <Info size={16} className="mr-2" />
          Current Conditions
        </h3>
        <div className="space-y-1 text-sm text-ice-blue">
          <div className="flex justify-between">
            <span>Water Level:</span>
            <span className="text-ice-white font-semibold">156.2m</span>
          </div>
          <div className="flex justify-between">
            <span>Wind:</span>
            <span className="text-ice-white font-semibold">15 km/h NW</span>
          </div>
          <div className="flex justify-between">
            <span>Wave Height:</span>
            <span className="text-ice-white font-semibold">0.3m</span>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      {showHeatmap && (
        <div className="heatmap-legend">
          <h4 className="text-xs font-semibold text-ice-white mb-2">Track Frequency</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-ice-blue">Low</span>
            <div className="flex-1 h-4 rounded" style={{
              background: 'linear-gradient(to right, rgba(74,144,164,0.4), rgba(26,77,46,0.6), rgba(122,45,142,0.8), rgba(212,165,116,1))'
            }}></div>
            <span className="text-xs text-ice-blue">High</span>
          </div>
        </div>
      )}

      {/* Hazard Alert Banner */}
      <HazardAlertBanner />

      {/* GPS Tracking Control */}
      <GPSTrackingControl />

      {/* Mobile Action Buttons */}
      <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
        {/* Quick Report Hazard */}
        <button
          onClick={() => {
            const status = hazardAlert.getStatus();
            if (status.currentPosition) {
              setReportPosition(status.currentPosition);
              setShowQuickReport(true);
            } else {
              alert('Waiting for GPS location...');
            }
          }}
          className="btn-secondary flex items-center justify-center space-x-2 shadow-lg px-4 py-3"
          title="Report Hazard"
        >
          <AlertTriangle size={20} />
          <span className="hidden sm:inline">Report</span>
        </button>

        {/* Offline Maps */}
        <button
          onClick={() => setShowOfflineMapManager(true)}
          className="btn-secondary flex items-center justify-center space-x-2 shadow-lg px-4 py-3"
          title="Offline Maps"
        >
          <Download size={20} />
          <span className="hidden sm:inline">Offline</span>
        </button>

        {/* Hazard Alert Toggle */}
        <button
          onClick={() => {
            if (hazardAlertActive) {
              hazardAlert.stop();
              setHazardAlertActive(false);
            } else {
              hazardAlert.start();
              setHazardAlertActive(true);
            }
          }}
          className={`flex items-center justify-center space-x-2 shadow-lg px-4 py-3 rounded-lg transition-all ${
            hazardAlertActive
              ? 'bg-aurora-green text-white hover:bg-aurora-green/80'
              : 'btn-secondary'
          }`}
          title="Toggle Hazard Alerts"
        >
          <Shield size={20} />
          <span className="hidden sm:inline">
            {hazardAlertActive ? 'Alerts On' : 'Alerts Off'}
          </span>
        </button>
      </div>

      {/* Offline Map Manager Modal */}
      {showOfflineMapManager && (
        <OfflineMapManagerComponent onClose={() => setShowOfflineMapManager(false)} />
      )}

      {/* Quick Hazard Report Modal */}
      {showQuickReport && reportPosition && (
        <QuickHazardReport
          position={reportPosition}
          onClose={() => setShowQuickReport(false)}
          onReported={handleHazardReported}
        />
      )}
    </div>
  );
};

const LayerToggle = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-ice-blue">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-midnight-dark rounded-full peer peer-checked:bg-aurora-green transition-colors"></div>
        <div className="absolute left-1 top-1 w-4 h-4 bg-ice-white rounded-full transition-transform peer-checked:translate-x-5"></div>
      </div>
    </label>
  );
};

export default MapView;
