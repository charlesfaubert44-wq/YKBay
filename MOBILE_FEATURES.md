# YK Bay Mobile Features

## Overview

YK Bay now includes powerful mobile-first features designed for safe boating navigation on Great Slave Lake. These features work on mobile browsers and support Progressive Web App (PWA) capabilities for app-like experience without requiring app store installation.

## New Features

### 1. Real-Time GPS Tracking

Track your boat journey in real-time with intelligent battery optimization and offline storage.

**Features:**
- ✅ Background GPS tracking (continues when app minimized)
- ✅ Adaptive sampling (1s when moving, 30s when stationary)
- ✅ Battery saver mode (activates at 15% battery)
- ✅ Automatic pause detection (after 5 minutes stationary)
- ✅ Live stats display (distance, duration, speed)
- ✅ Manual waypoint marking with notes
- ✅ Offline storage with automatic sync
- ✅ Track visualization on map
- ✅ Kalman filtering for smooth GPS data

**Usage:**
1. Open the map view
2. Tap "Start GPS Tracking" button (bottom-right)
3. Grant location permissions when prompted
4. Your current track appears as a green line on the map
5. Tap "Waypoint" to mark important locations
6. Tap "Stop & Save" to complete and name your track
7. Tracks automatically sync when connection available

**Technical Details:**
- Service: [`gpsTracker.js`](client/src/services/gpsTracker.js)
- Component: [`GPSTrackingControl.jsx`](client/src/components/GPSTrackingControl.jsx)
- Storage: IndexedDB (`tracks` and `pendingTracks` stores)
- Sync: Service Worker background sync

---

### 2. Proximity-Based Hazard Alerts

Get real-time alerts when approaching reported hazards while navigating.

**Features:**
- ✅ Multi-modal alerts (visual, audio, haptic, notifications)
- ✅ Three severity levels:
  - **Critical**: 100m radius (3 strong pulses)
  - **Warning**: 300m radius (2 medium pulses)
  - **Advisory**: 500m radius (1 light pulse)
- ✅ Smart filtering (direction-aware, cooldown to prevent spam)
- ✅ Speed adjustment (faster = earlier warnings)
- ✅ Compass/heading integration
- ✅ Voice announcements
- ✅ Offline hazard database
- ✅ Community verification system

**Alert Example:**
```
CRITICAL ALERT
Reef reported 150 meters ahead, bearing northeast
[View on Map] [Passed Safely] [Confirm Hazard]
```

**Usage:**
1. Hazard alerts automatically activate when map loads
2. Grant notification permissions for full functionality
3. Alerts appear as banners at top of screen
4. Tap alert to view hazard location on map
5. Help community by marking "Passed Safely" or "Confirm Hazard"
6. Toggle alerts on/off with Shield button (bottom-left)

**Quick Hazard Reporting:**
1. Tap "Report" button (bottom-left) OR
2. Long-press/right-click on map at hazard location
3. Select hazard type (reef, rock, shoal, etc.)
4. Choose severity (high, medium, low)
5. Add optional description
6. Submit - saves locally and syncs when online

**Technical Details:**
- Service: [`hazardAlert.js`](client/src/services/hazardAlert.js)
- Components:
  - [`HazardAlertBanner.jsx`](client/src/components/HazardAlertBanner.jsx)
  - [`QuickHazardReport.jsx`](client/src/components/QuickHazardReport.jsx)
- Storage: IndexedDB (`hazards` and `pendingHazards` stores)
- Geofencing: Turf.js distance calculations
- Audio: Web Audio API with synthesized tones

---

### 3. Offline Map Download & Caching

Download map regions for navigation without cellular connectivity.

**Features:**
- ✅ Predefined regions (Yellowknife Bay, East Arm, North Arm, McLeod Bay)
- ✅ Custom region selection (draw on map)
- ✅ Multiple map layers (satellite, topographic, nautical charts)
- ✅ Resumable downloads (pause/resume anytime)
- ✅ Background downloading (continues when app closed)
- ✅ Storage management dashboard
- ✅ Compression and optimization
- ✅ Differential updates (only changed tiles)
- ✅ Automatic cleanup of old regions

**Predefined Regions:**
| Region | Size | Coverage |
|--------|------|----------|
| Yellowknife Bay | ~180 MB | Main city area |
| East Arm | ~520 MB | Extended eastern waters |
| North Arm | ~450 MB | Northern passages |
| McLeod Bay | ~280 MB | Southeast region |

**Usage:**
1. Tap "Offline" button (bottom-left)
2. View storage stats and downloaded regions
3. Select a predefined region from "Available Regions"
4. Tap "Download" and confirm
5. Monitor progress in "Active Downloads" section
6. Pause/resume/cancel downloads as needed
7. Delete old regions to free up space

**Storage Management:**
- View total storage used
- See breakdown by region
- Delete individual regions
- Auto-cleanup keeps 5 most recent regions

**Technical Details:**
- Service: [`offlineMapManager.js`](client/src/services/offlineMapManager.js)
- Component: [`OfflineMapManager.jsx`](client/src/components/OfflineMapManager.jsx)
- Storage: IndexedDB (`offlineMaps` and `mapTiles` stores)
- Tile format: Mapbox raster tiles (512x512)
- Zoom levels: 8-16 (balance quality vs size)
- Max storage: 2GB (configurable)

---

## Progressive Web App (PWA)

YK Bay is installable as a PWA for app-like experience.

**Installation:**

**iOS (Safari):**
1. Open YK Bay in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Confirm installation

**Android (Chrome):**
1. Open YK Bay in Chrome
2. Tap menu (⋮)
3. Select "Install app" or "Add to Home screen"
4. Confirm installation

**Desktop:**
1. Open YK Bay in Chrome/Edge
2. Click install icon in address bar
3. Confirm installation

**PWA Features:**
- Standalone mode (no browser chrome)
- Full screen on mobile
- App icon on home screen
- Splash screen
- Background sync
- Push notifications
- Offline functionality

**Technical Details:**
- Manifest: [`manifest.json`](client/public/manifest.json)
- Service Worker: [`sw.js`](client/public/sw.js)
- Registration: [`serviceWorkerRegistration.js`](client/src/services/serviceWorkerRegistration.js)

---

## Background Sync

Tracks and hazards sync automatically when connection available.

**How It Works:**
1. User creates track/reports hazard while offline
2. Data saved to IndexedDB pending queue
3. Service worker registers sync event
4. When online, sync automatically triggers
5. Data uploaded to server
6. Local queue cleared on success
7. User notified of sync status

**Sync Tags:**
- `track-sync`: Sync pending GPS tracks
- `hazard-sync`: Sync pending hazard reports

**Retry Logic:**
- Exponential backoff (1s, 2s, 4s, 8s...)
- Max 50 retry attempts
- Manual sync trigger available

**Monitoring:**
- Visual indicators on UI:
  - 🟢 Synced (WiFi icon)
  - 🟡 Queued (WiFi off icon)
  - 🔵 Syncing (WiFi icon pulsing)
  - 🔴 Failed (alert icon)

---

## API Endpoints

### Track Sync
```http
POST /api/tracks/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "positions": [
    {
      "timestamp": 1234567890,
      "latitude": 62.4540,
      "longitude": -114.3718,
      "altitude": 156.2,
      "accuracy": 15,
      "speed": 25.5,
      "heading": 45
    }
  ],
  "metadata": {
    "vesselType": "aluminum boat",
    "vesselDraft": 0.5,
    "waterLevel": 156.2,
    "windSpeed": 15,
    "waveHeight": 0.3,
    "visibility": "good",
    "notes": "Smooth passage"
  },
  "statistics": {
    "distance": 5.2,
    "duration": 900000,
    "avgSpeed": 20.8,
    "maxSpeed": 32.5,
    "pointCount": 350
  }
}
```

### Hazard Sync
```http
POST /api/hazards/sync
Authorization: Bearer {token}
Content-Type: application/json

{
  "lat": 62.4570,
  "lng": -114.3600,
  "type": "reef",
  "severity": "high",
  "description": "Large reef visible at low water",
  "timestamp": 1234567890
}
```

---

## Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| GPS Tracking | ✅ | ✅ | ✅ | ✅ |
| Background Tracking | ✅ | ⚠️ Limited | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| Vibration API | ✅ Android | ❌ | ✅ Android | ✅ |
| Battery API | ✅ | ❌ | ✅ | ✅ |

**Notes:**
- Safari has limited background execution
- iOS requires "Add to Home Screen" for best experience
- Background sync fallbacks to manual sync on unsupported browsers

---

## Performance & Optimization

### Battery Optimization
- Adaptive GPS sampling based on movement
- Battery saver mode at <15% battery
- Reduce sampling after 2 hours continuous tracking
- Efficient geofencing with distance filtering
- Debounced UI updates

### Storage Optimization
- WebP image format (30-50% smaller)
- Gzip compression for vector data
- Tile deduplication
- Lazy loading of map tiles
- Automatic cleanup of old data
- Max 50 tracks or 500MB local storage

### Network Optimization
- Offline-first architecture
- Request caching with stale-while-revalidate
- Background sync reduces data usage
- Differential map tile updates
- Compressed uploads from mobile devices

---

## Testing

### Desktop Testing
```bash
# Start development server
npm run dev

# Access on mobile via local network
# Find your computer's IP address
# Open http://YOUR_IP:5173 on mobile
```

### Mobile Device Testing

**iOS Safari:**
1. Connect iPhone to Mac
2. Enable "Web Inspector" in Safari settings
3. Open YK Bay on iPhone
4. Debug from Mac Safari > Develop > iPhone

**Android Chrome:**
1. Enable USB debugging on Android
2. Connect device to computer
3. Open chrome://inspect in desktop Chrome
4. Click "Inspect" on mobile browser

**PWA Testing:**
1. Install app to home screen
2. Test offline by enabling Airplane mode
3. Verify background sync works
4. Test notifications
5. Check GPS tracking accuracy

---

## Troubleshooting

### GPS Not Working
- Check location permissions (Settings > Privacy)
- Ensure location services enabled
- Try refreshing page
- Clear browser cache
- Check GPS signal (requires view of sky)

### Notifications Not Showing
- Check notification permissions
- Ensure "Do Not Disturb" is off
- On iOS, must add to home screen first
- Try re-granting permissions

### Offline Maps Not Downloading
- Check available storage space
- Ensure WiFi connected (default setting)
- Try pausing and resuming
- Check browser console for errors

### Tracks Not Syncing
- Check internet connection
- Verify authentication token valid
- Try manual sync from tracking control
- Check pending queue in browser DevTools > Application > IndexedDB

### Performance Issues
- Clear old offline map regions
- Delete old cached tracks
- Close other browser tabs
- Disable unnecessary background apps
- Update browser to latest version

---

## Development

### Project Structure
```
client/src/
├── services/
│   ├── gpsTracker.js           # GPS tracking service
│   ├── hazardAlert.js          # Hazard alert service
│   ├── offlineMapManager.js    # Offline map manager
│   ├── db.js                   # IndexedDB wrapper
│   └── serviceWorkerRegistration.js
├── components/
│   ├── GPSTrackingControl.jsx
│   ├── HazardAlertBanner.jsx
│   ├── QuickHazardReport.jsx
│   └── OfflineMapManager.jsx
└── pages/
    └── MapView.jsx             # Main map with integrations

client/public/
├── sw.js                       # Service worker
├── manifest.json               # PWA manifest
└── offline.html               # Offline fallback page

server/routes/
├── tracks.js                   # Added /sync endpoint
└── hazards.js                 # Added /sync endpoint
```

### Key Technologies
- **React 19**: UI components
- **Mapbox GL JS**: Map rendering
- **Turf.js**: Geospatial calculations
- **IndexedDB**: Local storage
- **Service Worker**: Background sync
- **Web APIs**: Geolocation, Notifications, Battery, Vibration

### Adding New Features
1. Create service in `client/src/services/`
2. Create React component in `client/src/components/`
3. Integrate into `MapView.jsx`
4. Add API endpoint in `server/routes/`
5. Test on mobile devices
6. Update documentation

---

## Future Enhancements

**Planned Features:**
- [ ] Voice-guided turn-by-turn navigation
- [ ] Emergency SOS with location broadcast
- [ ] Route planning with waypoints
- [ ] Weather integration
- [ ] Mesh network sharing (peer-to-peer map transfer)
- [ ] Integration with marine chartplotters (NMEA)
- [ ] Photo upload for hazard reports
- [ ] Vessel AIS integration
- [ ] Group navigation (fleet coordination)
- [ ] Gamification (achievements for contributions)

**Native App Development:**
- React Native for enhanced mobile experience
- Full background GPS tracking
- Push notifications without limitations
- Better battery management
- Native sensor integration

---

## Contributing

To contribute to mobile features:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/mobile-enhancement`
3. Test on multiple devices and browsers
4. Ensure offline functionality works
5. Update documentation
6. Submit pull request

**Testing Checklist:**
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] PWA installs correctly
- [ ] Offline mode functional
- [ ] Background sync works
- [ ] Notifications display properly
- [ ] GPS tracking accurate
- [ ] Battery usage acceptable
- [ ] No console errors

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions about mobile features:
- Open GitHub issue
- Include browser/device information
- Provide console error logs
- Describe steps to reproduce

**Emergency Support:**
YK Bay is not a replacement for official marine navigation equipment and emergency services. Always carry proper safety equipment and contact appropriate authorities in emergencies.

🚤 **Safe Boating!**
