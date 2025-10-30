// GPS Tracking Service with adaptive sampling and battery optimization
import * as turf from '@turf/turf';
import { addItem, updateItem, getItem, getAllItems } from './db';
import { registerBackgroundSync } from './serviceWorkerRegistration';

class GPSTracker {
  constructor() {
    this.watchId = null;
    this.currentTrack = null;
    this.isTracking = false;
    this.isPaused = false;
    this.positions = [];
    this.lastPosition = null;
    this.lastMovementTime = Date.now();
    this.trackStartTime = null;
    this.samplingInterval = 1000; // Start with 1 second
    this.batteryLevel = 1;
    this.listeners = new Set();

    // Configuration
    this.config = {
      movingSamplingInterval: 1000, // 1 second when moving
      stationarySamplingInterval: 30000, // 30 seconds when stationary
      batterySaverInterval: 5000, // 5 seconds in battery saver mode
      batterySaverThreshold: 0.15, // Activate at 15% battery
      pauseThreshold: 300000, // 5 minutes stationary = pause
      movementThreshold: 0.01, // 10 meters minimum movement
      speedThreshold: 0.5, // 0.5 km/h minimum speed
      accuracyThreshold: 50, // 50 meters max acceptable accuracy
      maxPositions: 10000, // Maximum positions per track
      autoSaveInterval: 300000 // Auto-save every 5 minutes
    };

    // Statistics
    this.stats = {
      distance: 0,
      duration: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      pointCount: 0
    };

    // Initialize battery monitoring
    this.initBatteryMonitoring();

    // Auto-save timer
    this.autoSaveTimer = null;
  }

  // Initialize battery monitoring
  async initBatteryMonitoring() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        this.batteryLevel = battery.level;

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
          this.adjustSamplingRate();
        });
      } catch (error) {
        console.warn('Battery API not available:', error);
      }
    }
  }

  // Start tracking
  async startTracking(metadata = {}) {
    if (this.isTracking) {
      console.warn('Tracking already active');
      return false;
    }

    // Request location permission
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    // Check permission
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        throw new Error('Location permission denied');
      }
    }

    // Initialize new track
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentTrack = {
      id: trackId,
      recording: true,
      synced: false,
      startTime: Date.now(),
      endTime: null,
      metadata: {
        vesselType: metadata.vesselType || 'unknown',
        vesselDraft: metadata.vesselDraft || null,
        waterLevel: metadata.waterLevel || null,
        windSpeed: metadata.windSpeed || null,
        waveHeight: metadata.waveHeight || null,
        visibility: metadata.visibility || null,
        notes: metadata.notes || ''
      },
      positions: [],
      statistics: {
        distance: 0,
        duration: 0,
        maxSpeed: 0,
        avgSpeed: 0,
        pointCount: 0
      }
    };

    this.positions = [];
    this.stats = { ...this.currentTrack.statistics };
    this.trackStartTime = Date.now();
    this.isTracking = true;
    this.isPaused = false;

    // Start GPS watch
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Save initial track to IndexedDB
    await addItem('tracks', this.currentTrack);

    // Start auto-save timer
    this.startAutoSave();

    // Notify listeners
    this.notifyListeners({ type: 'TRACKING_STARTED', track: this.currentTrack });

    console.log('GPS Tracking started:', trackId);
    return trackId;
  }

  // Handle GPS position update
  async handlePosition(position) {
    if (!this.isTracking || this.isPaused) return;

    const { latitude, longitude, altitude, accuracy, speed, heading } = position.coords;
    const timestamp = position.timestamp;

    // Check accuracy
    if (accuracy > this.config.accuracyThreshold) {
      console.warn('Low GPS accuracy:', accuracy);
      this.notifyListeners({
        type: 'GPS_ACCURACY_WARNING',
        accuracy,
        threshold: this.config.accuracyThreshold
      });
      return;
    }

    // Check if movement significant
    const currentPoint = turf.point([longitude, latitude]);
    let shouldRecord = true;

    if (this.lastPosition) {
      const lastPoint = turf.point([this.lastPosition.longitude, this.lastPosition.latitude]);
      const distance = turf.distance(lastPoint, currentPoint, { units: 'kilometers' });

      // Check if moved enough
      if (distance < this.config.movementThreshold) {
        shouldRecord = false;

        // Check if stationary for too long
        const timeSinceMovement = Date.now() - this.lastMovementTime;
        if (timeSinceMovement > this.config.pauseThreshold && !this.isPaused) {
          this.pauseTracking();
          return;
        }
      } else {
        this.lastMovementTime = Date.now();

        // Resume if was paused
        if (this.isPaused) {
          this.resumeTracking();
        }
      }
    }

    if (!shouldRecord) return;

    // Create position entry
    const positionData = {
      timestamp,
      latitude,
      longitude,
      altitude: altitude || null,
      accuracy,
      speed: speed !== null ? speed * 3.6 : null, // Convert m/s to km/h
      heading: heading || null
    };

    // Add to positions array
    this.positions.push(positionData);
    this.currentTrack.positions = this.positions;

    // Update statistics
    if (this.lastPosition) {
      const lastPoint = turf.point([this.lastPosition.longitude, this.lastPosition.latitude]);
      const distance = turf.distance(lastPoint, currentPoint, { units: 'kilometers' });

      this.stats.distance += distance;
      this.stats.pointCount = this.positions.length;

      if (positionData.speed && positionData.speed > this.stats.maxSpeed) {
        this.stats.maxSpeed = positionData.speed;
      }

      // Calculate average speed
      const duration = (Date.now() - this.trackStartTime) / 1000 / 3600; // hours
      this.stats.avgSpeed = duration > 0 ? this.stats.distance / duration : 0;
      this.stats.duration = Date.now() - this.trackStartTime;
    }

    this.currentTrack.statistics = { ...this.stats };
    this.lastPosition = positionData;

    // Adjust sampling rate
    this.adjustSamplingRate();

    // Check max positions limit
    if (this.positions.length >= this.config.maxPositions) {
      console.warn('Maximum positions reached, stopping tracking');
      this.stopTracking();
      return;
    }

    // Notify listeners
    this.notifyListeners({
      type: 'POSITION_UPDATE',
      position: positionData,
      stats: this.stats
    });

    // Periodic save to IndexedDB
    if (this.positions.length % 10 === 0) {
      await this.saveTrack();
    }
  }

  // Handle GPS error
  handleError(error) {
    console.error('GPS error:', error);

    let message = 'GPS error';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location unavailable';
        break;
      case error.TIMEOUT:
        message = 'Location request timeout';
        break;
    }

    this.notifyListeners({
      type: 'GPS_ERROR',
      error: message,
      code: error.code
    });
  }

  // Adjust sampling rate based on conditions
  adjustSamplingRate() {
    let newInterval = this.config.movingSamplingInterval;

    // Battery saver mode
    if (this.batteryLevel < this.config.batterySaverThreshold) {
      newInterval = this.config.batterySaverInterval;

      if (this.samplingInterval !== newInterval) {
        this.notifyListeners({
          type: 'BATTERY_SAVER_MODE',
          batteryLevel: this.batteryLevel
        });
      }
    }
    // Stationary detection
    else if (this.lastPosition && this.lastPosition.speed < this.config.speedThreshold) {
      newInterval = this.config.stationarySamplingInterval;
    }

    // After 2 hours, reduce to battery saver
    const trackingDuration = Date.now() - this.trackStartTime;
    if (trackingDuration > 7200000) { // 2 hours
      newInterval = Math.max(newInterval, this.config.batterySaverInterval);
    }

    this.samplingInterval = newInterval;
  }

  // Pause tracking (auto-pause when stationary)
  pauseTracking() {
    if (this.isPaused) return;

    this.isPaused = true;
    console.log('Tracking paused (stationary)');

    this.notifyListeners({
      type: 'TRACKING_PAUSED',
      reason: 'stationary'
    });
  }

  // Resume tracking
  resumeTracking() {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.lastMovementTime = Date.now();
    console.log('Tracking resumed');

    this.notifyListeners({
      type: 'TRACKING_RESUMED'
    });
  }

  // Stop tracking
  async stopTracking(save = true) {
    if (!this.isTracking) {
      console.warn('Tracking not active');
      return null;
    }

    // Stop GPS watch
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // Stop auto-save timer
    this.stopAutoSave();

    this.isTracking = false;
    this.isPaused = false;

    // Finalize track
    this.currentTrack.endTime = Date.now();
    this.currentTrack.recording = false;
    this.currentTrack.statistics = { ...this.stats };

    if (save) {
      // Save final track
      await this.saveTrack();

      console.log('Tracking stopped:', {
        trackId: this.currentTrack.id,
        distance: this.stats.distance.toFixed(2) + ' km',
        duration: (this.stats.duration / 60000).toFixed(1) + ' min',
        points: this.stats.pointCount
      });
    }

    const completedTrack = { ...this.currentTrack };

    // Notify listeners
    this.notifyListeners({
      type: 'TRACKING_STOPPED',
      track: completedTrack,
      saved: save
    });

    // Reset
    const trackId = this.currentTrack.id;
    this.currentTrack = null;
    this.positions = [];
    this.lastPosition = null;

    return trackId;
  }

  // Save track to IndexedDB
  async saveTrack() {
    if (!this.currentTrack) return;

    try {
      await updateItem('tracks', this.currentTrack);
      console.log('Track saved:', this.currentTrack.id, this.positions.length, 'points');
    } catch (error) {
      console.error('Failed to save track:', error);
    }
  }

  // Start auto-save timer
  startAutoSave() {
    this.stopAutoSave();

    this.autoSaveTimer = setInterval(() => {
      this.saveTrack();
    }, this.config.autoSaveInterval);
  }

  // Stop auto-save timer
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Add manual waypoint
  async addWaypoint(note = '', voiceNote = null) {
    if (!this.isTracking || !this.lastPosition) {
      console.warn('Cannot add waypoint: not tracking');
      return false;
    }

    const waypoint = {
      ...this.lastPosition,
      type: 'waypoint',
      note,
      voiceNote
    };

    this.positions.push(waypoint);
    await this.saveTrack();

    this.notifyListeners({
      type: 'WAYPOINT_ADDED',
      waypoint
    });

    return true;
  }

  // Queue track for sync
  async queueTrackForSync(trackId) {
    const track = await getItem('tracks', trackId);

    if (!track) {
      console.error('Track not found:', trackId);
      return false;
    }

    // Get auth token
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token, cannot sync');
      return false;
    }

    // Add to pending queue
    const pendingItem = {
      id: trackId,
      token,
      data: track,
      timestamp: Date.now()
    };

    await addItem('pendingTracks', pendingItem);

    // Register background sync
    await registerBackgroundSync('track-sync');

    // Mark as queued
    track.syncQueued = true;
    await updateItem('tracks', track);

    console.log('Track queued for sync:', trackId);
    return true;
  }

  // Get current track
  getCurrentTrack() {
    return this.currentTrack;
  }

  // Get tracking status
  getStatus() {
    return {
      isTracking: this.isTracking,
      isPaused: this.isPaused,
      trackId: this.currentTrack?.id || null,
      stats: { ...this.stats },
      batteryLevel: this.batteryLevel,
      samplingInterval: this.samplingInterval,
      pointCount: this.positions.length
    };
  }

  // Get all saved tracks
  async getSavedTracks() {
    return await getAllItems('tracks');
  }

  // Get track by ID
  async getTrack(trackId) {
    return await getItem('tracks', trackId);
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
export const gpsTracker = new GPSTracker();
export default gpsTracker;
