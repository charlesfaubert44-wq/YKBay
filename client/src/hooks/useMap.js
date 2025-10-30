import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { trackAPI, hazardAPI, routeAPI } from '../services/api';

// Configure Mapbox
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

export const useMap = (containerRef, initialOptions = {}) => {
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const markersRef = useRef([]);
  const layersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || !mapboxgl.accessToken) return;

    try {
      const mapInstance = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: initialOptions.center || [-114.37, 62.45], // Yellowknife
        zoom: initialOptions.zoom || 10,
        ...initialOptions
      });

      mapInstance.on('load', () => {
        setMap(mapInstance);
        setLoading(false);

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapInstance.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

        // Add geolocate control
        const geolocate = new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        });
        mapInstance.addControl(geolocate, 'top-right');
      });

      mapInstance.on('error', (e) => {
        console.error('Map error:', e);
        setError(e.message);
      });

      return () => {
        mapInstance.remove();
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [containerRef, initialOptions]);

  // Load tracks in viewport
  const loadTracksInView = useCallback(async (filters = {}) => {
    if (!map) return;

    try {
      const bounds = map.getBounds();
      const params = {
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
        ...filters
      };

      const response = await trackAPI.search(params);

      if (response.success && response.data) {
        // Remove existing track layers
        layersRef.current
          .filter(id => id.startsWith('track-'))
          .forEach(id => {
            if (map.getLayer(id)) map.removeLayer(id);
            if (map.getSource(id)) map.removeSource(id);
          });

        // Add new track layers
        response.data.forEach((track, index) => {
          const layerId = `track-${track.id}`;

          map.addSource(layerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                id: track.id,
                username: track.username,
                verified: track.verified,
                vesselType: track.vessel_type
              },
              geometry: track.geometry
            }
          });

          map.addLayer({
            id: layerId,
            type: 'line',
            source: layerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': track.verified ? '#22c55e' : '#3b82f6',
              'line-width': track.verified ? 3 : 2,
              'line-opacity': 0.7
            }
          });

          layersRef.current.push(layerId);

          // Add click handler
          map.on('click', layerId, (e) => {
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold">${track.username}'s Track</h3>
                  <p>Vessel: ${track.vessel_type || 'Unknown'}</p>
                  <p>Distance: ${track.distance_km?.toFixed(1)} km</p>
                  <p>Status: ${track.verified ? 'Verified ✓' : 'Unverified'}</p>
                </div>
              `)
              .addTo(map);
          });

          // Change cursor on hover
          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
          });
        });
      }
    } catch (err) {
      console.error('Error loading tracks:', err);
      setError(err.message);
    }
  }, [map]);

  // Load hazards in viewport
  const loadHazardsInView = useCallback(async (filters = {}) => {
    if (!map) return;

    try {
      const bounds = map.getBounds();
      const params = {
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
        ...filters
      };

      const response = await hazardAPI.search(params);

      if (response.success && response.data) {
        // Clear existing hazard markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add hazard markers
        response.data.forEach(hazard => {
          const el = document.createElement('div');
          el.className = 'hazard-marker';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundImage = `url('/icons/hazard-${hazard.severity}.svg')`;
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';

          const marker = new mapboxgl.Marker(el)
            .setLngLat(hazard.location.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-3">
                  <h3 class="font-bold text-lg">${hazard.type}</h3>
                  <p class="text-sm">Severity: <span class="font-semibold">${hazard.severity}</span></p>
                  <p class="text-sm mt-1">${hazard.description || 'No description'}</p>
                  <p class="text-xs mt-2 text-gray-500">
                    Reports: ${hazard.report_count} |
                    ${hazard.verified ? 'Verified ✓' : 'Unverified'}
                  </p>
                </div>
              `))
            .addTo(map);

          markersRef.current.push(marker);
        });
      }
    } catch (err) {
      console.error('Error loading hazards:', err);
      setError(err.message);
    }
  }, [map]);

  // Draw a route on the map
  const drawRoute = useCallback((routeGeometry, options = {}) => {
    if (!map) return;

    const {
      id = 'route',
      color = '#ff6b6b',
      width = 4,
      opacity = 0.8
    } = options;

    // Remove existing route if present
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);

    // Add route source and layer
    map.addSource(id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: routeGeometry
      }
    });

    map.addLayer({
      id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': width,
        'line-opacity': opacity
      }
    });

    // Fit bounds to route
    const bounds = turf.bbox(routeGeometry);
    map.fitBounds(bounds, { padding: 50 });
  }, [map]);

  // Find optimal route between points
  const findOptimalRoute = useCallback(async (startPoint, endPoint, preferences = {}) => {
    if (!map) return null;

    try {
      setLoading(true);
      const response = await routeAPI.findOptimal(startPoint, endPoint, preferences);

      if (response.success && response.data) {
        drawRoute(response.data.geometry, {
          id: 'optimal-route',
          color: response.data.confidence > 70 ? '#22c55e' : '#fbbf24',
          width: 4
        });

        return response.data;
      }
    } catch (err) {
      console.error('Error finding route:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [map, drawRoute]);

  // Load safety heatmap
  const loadSafetyHeatmap = useCallback(async () => {
    if (!map) return;

    try {
      const bounds = map.getBounds();
      const response = await routeAPI.getSafetyHeatmap({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast()
      });

      if (response.success && response.data) {
        // Convert heatmap data to GeoJSON
        const features = response.data.map(point => ({
          type: 'Feature',
          properties: {
            safetyScore: point.safety_score,
            trackCount: point.track_count
          },
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat]
          }
        }));

        // Remove existing heatmap if present
        if (map.getLayer('safety-heatmap')) map.removeLayer('safety-heatmap');
        if (map.getSource('safety-heatmap')) map.removeSource('safety-heatmap');

        // Add heatmap layer
        map.addSource('safety-heatmap', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        });

        map.addLayer({
          id: 'safety-heatmap',
          type: 'heatmap',
          source: 'safety-heatmap',
          maxzoom: 15,
          paint: {
            'heatmap-weight': ['get', 'safetyScore'],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': 30,
            'heatmap-opacity': 0.6
          }
        });
      }
    } catch (err) {
      console.error('Error loading heatmap:', err);
      setError(err.message);
    }
  }, [map]);

  // Add drawing controls
  const enableDrawing = useCallback((onComplete) => {
    if (!map) return;

    // Implementation would use MapboxDraw library
    // This is a placeholder for the drawing functionality
    console.log('Drawing mode enabled');
  }, [map]);

  // Clear all layers and markers
  const clearMap = useCallback(() => {
    if (!map) return;

    // Remove all custom layers
    layersRef.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    layersRef.current = [];

    // Remove all markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, [map]);

  // Get current viewport bounds
  const getBounds = useCallback(() => {
    if (!map) return null;

    const bounds = map.getBounds();
    return {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast()
    };
  }, [map]);

  // Fly to location
  const flyTo = useCallback((center, zoom = 14) => {
    if (!map) return;

    map.flyTo({
      center,
      zoom,
      duration: 2000
    });
  }, [map]);

  return {
    map,
    loading,
    error,
    loadTracksInView,
    loadHazardsInView,
    drawRoute,
    findOptimalRoute,
    loadSafetyHeatmap,
    enableDrawing,
    clearMap,
    getBounds,
    flyTo
  };
};