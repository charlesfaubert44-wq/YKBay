import { useState, useRef, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl';
import { Layers, AlertTriangle, Info, Navigation as NavIcon } from 'lucide-react';

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

  const mapRef = useRef();

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

      {/* Quick Action Button */}
      <button className="absolute bottom-20 right-4 btn-primary flex items-center space-x-2 shadow-2xl">
        <NavIcon size={20} />
        <span>Start Navigation</span>
      </button>
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
