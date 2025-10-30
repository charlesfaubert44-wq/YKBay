const xml2js = require('xml2js');
const fs = require('fs').promises;

class GPXParser {
  /**
   * Parse GPX file and extract track data
   * @param {string} filePath - Path to GPX file
   * @returns {Object} Parsed track data with geometry and metadata
   */
  static async parseGPX(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(fileContent);

      const gpx = result.gpx;
      const trackData = {
        metadata: this.extractMetadata(gpx),
        tracks: [],
        waypoints: []
      };

      // Extract tracks
      if (gpx.trk && gpx.trk.length > 0) {
        gpx.trk.forEach(track => {
          const parsedTrack = this.extractTrack(track);
          if (parsedTrack) {
            trackData.tracks.push(parsedTrack);
          }
        });
      }

      // Extract waypoints
      if (gpx.wpt && gpx.wpt.length > 0) {
        gpx.wpt.forEach(waypoint => {
          const parsedWaypoint = this.extractWaypoint(waypoint);
          if (parsedWaypoint) {
            trackData.waypoints.push(parsedWaypoint);
          }
        });
      }

      return trackData;
    } catch (error) {
      throw new Error(`Failed to parse GPX file: ${error.message}`);
    }
  }

  /**
   * Extract metadata from GPX
   */
  static extractMetadata(gpx) {
    const metadata = gpx.metadata && gpx.metadata[0] ? gpx.metadata[0] : {};
    return {
      name: metadata.name ? metadata.name[0] : null,
      description: metadata.desc ? metadata.desc[0] : null,
      author: metadata.author ? metadata.author[0] : null,
      time: metadata.time ? new Date(metadata.time[0]) : null
    };
  }

  /**
   * Extract track from GPX track element
   */
  static extractTrack(track) {
    const trackName = track.name ? track.name[0] : 'Unnamed Track';
    const trackSegments = track.trkseg || [];

    const coordinates = [];
    const elevations = [];
    const timestamps = [];

    trackSegments.forEach(segment => {
      if (segment.trkpt && segment.trkpt.length > 0) {
        segment.trkpt.forEach(point => {
          const lat = parseFloat(point.$.lat);
          const lon = parseFloat(point.$.lon);
          const ele = point.ele ? parseFloat(point.ele[0]) : null;
          const time = point.time ? new Date(point.time[0]) : null;

          if (!isNaN(lat) && !isNaN(lon)) {
            // GeoJSON format: [longitude, latitude, elevation]
            coordinates.push([lon, lat, ele || 0]);

            if (ele !== null) elevations.push(ele);
            if (time !== null) timestamps.push(time);
          }
        });
      }
    });

    if (coordinates.length === 0) {
      return null;
    }

    const stats = this.calculateTrackStatistics(coordinates, timestamps);

    return {
      name: trackName,
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      },
      pointCount: coordinates.length,
      statistics: stats,
      timestamps: timestamps
    };
  }

  /**
   * Extract waypoint from GPX waypoint element
   */
  static extractWaypoint(waypoint) {
    const lat = parseFloat(waypoint.$.lat);
    const lon = parseFloat(waypoint.$.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return null;
    }

    return {
      name: waypoint.name ? waypoint.name[0] : 'Unnamed Waypoint',
      description: waypoint.desc ? waypoint.desc[0] : null,
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      elevation: waypoint.ele ? parseFloat(waypoint.ele[0]) : null,
      time: waypoint.time ? new Date(waypoint.time[0]) : null
    };
  }

  /**
   * Calculate track statistics
   */
  static calculateTrackStatistics(coordinates, timestamps) {
    if (coordinates.length < 2) {
      return {
        distanceKm: 0,
        durationSeconds: 0,
        avgSpeedKmh: 0
      };
    }

    // Calculate total distance using Haversine formula
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lon1, lat1] = coordinates[i];
      const [lon2, lat2] = coordinates[i + 1];
      totalDistance += this.haversineDistance(lat1, lon1, lat2, lon2);
    }

    // Calculate duration
    let durationSeconds = 0;
    if (timestamps.length >= 2) {
      const startTime = new Date(timestamps[0]);
      const endTime = new Date(timestamps[timestamps.length - 1]);
      durationSeconds = Math.floor((endTime - startTime) / 1000);
    }

    // Calculate average speed
    const avgSpeedKmh = durationSeconds > 0
      ? (totalDistance / (durationSeconds / 3600))
      : 0;

    return {
      distanceKm: parseFloat(totalDistance.toFixed(2)),
      durationSeconds: durationSeconds,
      avgSpeedKmh: parseFloat(avgSpeedKmh.toFixed(2))
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  static haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Parse KML file (simplified version)
   */
  static async parseKML(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(fileContent);

      // Basic KML parsing - can be expanded
      const kml = result.kml;
      const document = kml.Document ? kml.Document[0] : kml;

      // Extract placemarks (which can contain tracks)
      const placemarks = document.Placemark || [];
      const tracks = [];

      placemarks.forEach(placemark => {
        if (placemark.LineString) {
          const lineString = placemark.LineString[0];
          const coordinates = lineString.coordinates[0]
            .trim()
            .split(/\s+/)
            .map(coord => {
              const [lon, lat, ele] = coord.split(',').map(parseFloat);
              return [lon, lat, ele || 0];
            });

          tracks.push({
            name: placemark.name ? placemark.name[0] : 'Unnamed Track',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            },
            pointCount: coordinates.length,
            statistics: this.calculateTrackStatistics(coordinates, [])
          });
        }
      });

      return {
        metadata: {
          name: document.name ? document.name[0] : null,
          description: document.description ? document.description[0] : null
        },
        tracks: tracks
      };
    } catch (error) {
      throw new Error(`Failed to parse KML file: ${error.message}`);
    }
  }

  /**
   * Parse CSV file from fishfinder/GPS devices
   */
  static async parseCSV(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Detect CSV format (common formats: lat,lon,depth or lon,lat,depth)
      const header = lines[0].toLowerCase();
      const coordinates = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lon = parseFloat(parts[1]);
          const depth = parts[2] ? parseFloat(parts[2]) : 0;

          if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lon, lat, depth]);
          }
        }
      }

      if (coordinates.length === 0) {
        throw new Error('No valid coordinates found in CSV file');
      }

      return {
        metadata: {
          name: 'CSV Track Import',
          description: null
        },
        tracks: [{
          name: 'CSV Track',
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          },
          pointCount: coordinates.length,
          statistics: this.calculateTrackStatistics(coordinates, [])
        }]
      };
    } catch (error) {
      throw new Error(`Failed to parse CSV file: ${error.message}`);
    }
  }
}

module.exports = GPXParser;
