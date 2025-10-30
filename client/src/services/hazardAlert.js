// Hazard Alert Service with proximity detection and multi-modal notifications
import * as turf from '@turf/turf';
import { getAllItems, addItem, updateItem } from './db';
import { showNotification } from './serviceWorkerRegistration';

class HazardAlertService {
  constructor() {
    this.hazards = [];
    this.watchId = null;
    this.currentPosition = null;
    this.currentHeading = null;
    this.currentSpeed = 0;
    this.isActive = false;
    this.alertHistory = new Map(); // Track recent alerts to prevent spam
    this.listeners = new Set();

    // Configuration
    this.config = {
      criticalDistance: 0.1, // 100 meters
      warningDistance: 0.3, // 300 meters
      advisoryDistance: 0.5, // 500 meters
      alertCooldown: 120000, // 2 minutes before re-alerting same hazard
      headingTolerance: 45, // ±45 degrees from heading
      checkInterval: 5000, // Check every 5 seconds
      speedAdjustmentFactor: 1.5, // Increase alert distance by 1.5x for each 10 km/h
      verifiedOnly: false, // Alert on all hazards or verified only
      minConfidence: 0.5 // Minimum confidence score for unverified hazards
    };

    // Alert sounds (frequency, duration pairs for beep generation)
    this.alertSounds = {
      critical: [[800, 200], [800, 200], [800, 200]], // 3 urgent beeps
      warning: [[600, 150], [600, 150]], // 2 caution beeps
      advisory: [[400, 100]] // 1 info beep
    };

    // Check timer
    this.checkTimer = null;
  }

  // Start hazard monitoring
  async start(options = {}) {
    if (this.isActive) {
      console.warn('Hazard alert service already active');
      return;
    }

    // Merge options with config
    this.config = { ...this.config, ...options };

    // Load hazards from cache
    await this.loadHazards();

    // Start position monitoring
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: true,
        maximumAge: 10000
      }
    );

    // Start periodic hazard checking
    this.startPeriodicCheck();

    // Monitor device orientation for heading
    this.startOrientationMonitoring();

    this.isActive = true;
    console.log('Hazard alert service started');

    this.notifyListeners({ type: 'SERVICE_STARTED' });
  }

  // Stop hazard monitoring
  stop() {
    if (!this.isActive) {
      console.warn('Hazard alert service not active');
      return;
    }

    // Stop position watching
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // Stop periodic check
    this.stopPeriodicCheck();

    // Stop orientation monitoring
    this.stopOrientationMonitoring();

    this.isActive = false;
    this.currentPosition = null;
    this.currentHeading = null;

    console.log('Hazard alert service stopped');

    this.notifyListeners({ type: 'SERVICE_STOPPED' });
  }

  // Load hazards from IndexedDB and API
  async loadHazards() {
    try {
      // Load from local cache
      const cachedHazards = await getAllItems('hazards');
      this.hazards = cachedHazards;

      console.log(`Loaded ${this.hazards.length} hazards from cache`);

      // Fetch updates from API (if online)
      this.fetchHazardsFromAPI();
    } catch (error) {
      console.error('Failed to load hazards:', error);
    }
  }

  // Fetch hazards from API
  async fetchHazardsFromAPI() {
    try {
      const response = await fetch('/api/hazards');

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const hazards = await response.json();

      // Update cache
      for (const hazard of hazards) {
        await updateItem('hazards', hazard);
      }

      this.hazards = hazards;

      console.log(`Fetched ${hazards.length} hazards from API`);

      this.notifyListeners({
        type: 'HAZARDS_UPDATED',
        count: hazards.length
      });
    } catch (error) {
      console.warn('Failed to fetch hazards from API:', error);
      // Continue with cached data
    }
  }

  // Handle position update
  handlePositionUpdate(position) {
    const { latitude, longitude, speed, heading } = position.coords;

    this.currentPosition = {
      lat: latitude,
      lng: longitude,
      accuracy: position.coords.accuracy
    };

    this.currentSpeed = speed ? speed * 3.6 : 0; // Convert m/s to km/h

    if (heading !== null) {
      this.currentHeading = heading;
    }

    // Immediate check on position update
    this.checkHazards();
  }

  // Handle geolocation error
  handleError(error) {
    console.error('Geolocation error:', error);

    this.notifyListeners({
      type: 'LOCATION_ERROR',
      error: error.message
    });
  }

  // Start periodic hazard checking
  startPeriodicCheck() {
    this.stopPeriodicCheck();

    this.checkTimer = setInterval(() => {
      this.checkHazards();
    }, this.config.checkInterval);
  }

  // Stop periodic checking
  stopPeriodicCheck() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }

  // Check for nearby hazards
  checkHazards() {
    if (!this.currentPosition) return;

    const currentPoint = turf.point([this.currentPosition.lng, this.currentPosition.lat]);
    const nearbyHazards = [];

    for (const hazard of this.hazards) {
      // Skip if not verified and verifiedOnly is true
      if (this.config.verifiedOnly && !hazard.verified) {
        continue;
      }

      // Skip low confidence unverified hazards
      if (!hazard.verified && (hazard.confidence || 0) < this.config.minConfidence) {
        continue;
      }

      // Calculate distance
      const hazardPoint = turf.point([hazard.lng, hazard.lat]);
      const distance = turf.distance(currentPoint, hazardPoint, { units: 'kilometers' });

      // Calculate bearing to hazard
      const bearing = turf.bearing(currentPoint, hazardPoint);

      // Adjust alert distance based on speed
      const speedFactor = 1 + (this.currentSpeed / 10) * this.config.speedAdjustmentFactor;
      const criticalDistance = this.config.criticalDistance * speedFactor;
      const warningDistance = this.config.warningDistance * speedFactor;
      const advisoryDistance = this.config.advisoryDistance * speedFactor;

      // Determine severity level
      let severityLevel = null;
      if (distance <= criticalDistance) {
        severityLevel = 'critical';
      } else if (distance <= warningDistance) {
        severityLevel = 'warning';
      } else if (distance <= advisoryDistance) {
        severityLevel = 'advisory';
      }

      if (!severityLevel) continue;

      // Check if hazard is in direction of travel
      if (this.currentHeading !== null) {
        const headingDiff = Math.abs(this.normalizeHeading(bearing - this.currentHeading));

        if (headingDiff > this.config.headingTolerance) {
          // Hazard not in direction of travel, skip
          continue;
        }
      }

      // Check alert cooldown
      const lastAlertTime = this.alertHistory.get(hazard.id);
      if (lastAlertTime && (Date.now() - lastAlertTime) < this.config.alertCooldown) {
        continue; // Skip, recently alerted
      }

      // Add to nearby hazards
      nearbyHazards.push({
        hazard,
        distance: distance * 1000, // Convert to meters
        bearing,
        severityLevel
      });
    }

    // Trigger alerts for nearby hazards
    nearbyHazards.forEach(item => {
      this.triggerAlert(item);
    });
  }

  // Trigger alert for hazard
  triggerAlert(item) {
    const { hazard, distance, bearing, severityLevel } = item;

    // Record alert time
    this.alertHistory.set(hazard.id, Date.now());

    // Create alert message
    const bearingText = this.bearingToCompass(bearing);
    const distanceText = Math.round(distance);
    const message = `${this.capitalize(hazard.type || 'hazard')} reported ${distanceText} meters ahead, bearing ${bearingText}`;

    // Show notification
    this.showAlert(severityLevel, hazard.type, message, hazard);

    // Play audio
    this.playAlertSound(severityLevel);

    // Trigger haptic feedback
    this.triggerHaptic(severityLevel);

    // Notify listeners
    this.notifyListeners({
      type: 'HAZARD_ALERT',
      hazard,
      distance,
      bearing,
      severityLevel,
      message
    });

    console.log(`[ALERT ${severityLevel.toUpperCase()}]`, message);
  }

  // Show visual alert
  showAlert(severityLevel, type, message, hazard) {
    // Browser notification
    showNotification(`Hazard Alert: ${this.capitalize(type || 'Warning')}`, {
      body: message,
      tag: `hazard-${hazard.id}`,
      requireInteraction: severityLevel === 'critical',
      vibrate: this.getVibratePattern(severityLevel),
      data: {
        hazardId: hazard.id,
        severityLevel
      }
    });
  }

  // Play alert sound
  playAlertSound(severityLevel) {
    const soundPattern = this.alertSounds[severityLevel];

    if (!soundPattern || !window.AudioContext) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let startTime = audioContext.currentTime;

    soundPattern.forEach(([frequency, duration], index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration / 1000);

      startTime += (duration + 100) / 1000; // Add 100ms gap
    });
  }

  // Trigger haptic feedback
  triggerHaptic(severityLevel) {
    if (!('vibrate' in navigator)) return;

    const pattern = this.getVibratePattern(severityLevel);
    navigator.vibrate(pattern);
  }

  // Get vibrate pattern for severity level
  getVibratePattern(severityLevel) {
    const patterns = {
      critical: [200, 100, 200, 100, 200], // 3 strong pulses
      warning: [150, 100, 150], // 2 medium pulses
      advisory: [100] // 1 light pulse
    };

    return patterns[severityLevel] || [100];
  }

  // Start orientation monitoring for heading
  startOrientationMonitoring() {
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', this.handleOrientation.bind(this));
    } else if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
    }
  }

  // Stop orientation monitoring
  stopOrientationMonitoring() {
    window.removeEventListener('deviceorientationabsolute', this.handleOrientation.bind(this));
    window.removeEventListener('deviceorientation', this.handleOrientation.bind(this));
  }

  // Handle device orientation
  handleOrientation(event) {
    if (event.absolute && event.alpha !== null) {
      // Use compass heading (0 = North)
      this.currentHeading = 360 - event.alpha;
    } else if (event.webkitCompassHeading !== undefined) {
      // iOS webkit
      this.currentHeading = event.webkitCompassHeading;
    }
  }

  // Normalize heading to 0-360 range
  normalizeHeading(heading) {
    let normalized = heading % 360;
    if (normalized < 0) normalized += 360;

    // Handle wrap-around (e.g., 350° and 10° are only 20° apart)
    if (normalized > 180) {
      normalized = 360 - normalized;
    }

    return normalized;
  }

  // Convert bearing to compass direction
  bearingToCompass(bearing) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(((bearing + 360) % 360) / 22.5) % 16;
    return directions[index];
  }

  // Capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Report new hazard
  async reportHazard(hazardData) {
    const hazard = {
      id: `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lat: hazardData.lat || this.currentPosition?.lat,
      lng: hazardData.lng || this.currentPosition?.lng,
      type: hazardData.type,
      severity: hazardData.severity || 'medium',
      description: hazardData.description || '',
      photo: hazardData.photo || null,
      timestamp: Date.now(),
      reportedBy: hazardData.userId,
      verified: false,
      confidence: 0.5,
      heading: this.currentHeading,
      speed: this.currentSpeed,
      waterLevel: hazardData.waterLevel || null
    };

    // Save to local cache
    await addItem('hazards', hazard);

    // Add to pending sync queue
    const token = localStorage.getItem('token');
    if (token) {
      await addItem('pendingHazards', {
        id: hazard.id,
        token,
        data: hazard,
        timestamp: Date.now()
      });

      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in self.registration) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('hazard-sync');
      }
    }

    // Add to local hazards list
    this.hazards.push(hazard);

    console.log('Hazard reported:', hazard.id);

    this.notifyListeners({
      type: 'HAZARD_REPORTED',
      hazard
    });

    return hazard;
  }

  // Mark hazard as passed safely
  async markHazardPassed(hazardId) {
    const hazard = this.hazards.find(h => h.id === hazardId);

    if (hazard) {
      hazard.passedSafely = (hazard.passedSafely || 0) + 1;
      await updateItem('hazards', hazard);

      this.notifyListeners({
        type: 'HAZARD_PASSED',
        hazardId
      });
    }
  }

  // Confirm hazard
  async confirmHazard(hazardId) {
    const hazard = this.hazards.find(h => h.id === hazardId);

    if (hazard) {
      hazard.confirmations = (hazard.confirmations || 0) + 1;
      hazard.confidence = Math.min(1, (hazard.confidence || 0.5) + 0.1);
      await updateItem('hazards', hazard);

      this.notifyListeners({
        type: 'HAZARD_CONFIRMED',
        hazardId
      });
    }
  }

  // Get nearby hazards for display
  getNearbyHazards(radius = 5) {
    if (!this.currentPosition) return [];

    const currentPoint = turf.point([this.currentPosition.lng, this.currentPosition.lat]);

    return this.hazards
      .map(hazard => {
        const hazardPoint = turf.point([hazard.lng, hazard.lat]);
        const distance = turf.distance(currentPoint, hazardPoint, { units: 'kilometers' });
        const bearing = turf.bearing(currentPoint, hazardPoint);

        return {
          ...hazard,
          distance,
          bearing
        };
      })
      .filter(h => h.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  // Get service status
  getStatus() {
    return {
      isActive: this.isActive,
      hazardCount: this.hazards.length,
      currentPosition: this.currentPosition,
      currentHeading: this.currentHeading,
      currentSpeed: this.currentSpeed
    };
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
export const hazardAlert = new HazardAlertService();
export default hazardAlert;
