const turf = require('@turf/turf');
const db = require('../config/database');

class MapService {
  /**
   * Generate a safety heatmap based on track density and hazards
   */
  static async generateSafetyHeatmap(bounds, resolution = 0.01) {
    const { minLat, minLng, maxLat, maxLng } = bounds;

    // Create a grid of points
    const grid = [];
    for (let lat = minLat; lat <= maxLat; lat += resolution) {
      for (let lng = minLng; lng <= maxLng; lng += resolution) {
        grid.push({
          lat,
          lng,
          safety_score: 0,
          track_count: 0,
          hazard_proximity: 1.0
        });
      }
    }

    // Query tracks in the area
    const trackQuery = `
      SELECT ST_AsGeoJSON(geometry) as geometry, verified, verification_count
      FROM tracks
      WHERE ST_Intersects(
        geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      AND privacy = 'public'
      AND upload_date > NOW() - INTERVAL '6 months'
    `;

    const trackResult = await db.query(trackQuery, [minLng, minLat, maxLng, maxLat]);

    // Query hazards in the area
    const hazardQuery = `
      SELECT ST_AsGeoJSON(location) as location, severity
      FROM hazards
      WHERE ST_Within(
        location,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
    `;

    const hazardResult = await db.query(hazardQuery, [minLng, minLat, maxLng, maxLat]);

    // Process each grid point
    grid.forEach(point => {
      // Calculate track influence
      trackResult.rows.forEach(track => {
        const trackGeom = JSON.parse(track.geometry);
        const pointGeom = turf.point([point.lng, point.lat]);
        const distance = this.distanceToLineString(pointGeom, trackGeom);

        if (distance < 1) { // Within 1km of track
          const influence = 1 - (distance / 1);
          point.track_count++;
          point.safety_score += influence * (track.verified ? 2 : 1);
        }
      });

      // Calculate hazard influence
      hazardResult.rows.forEach(hazard => {
        const hazardGeom = JSON.parse(hazard.location);
        const hazardPoint = turf.point(hazardGeom.coordinates);
        const pointGeom = turf.point([point.lng, point.lat]);
        const distance = turf.distance(pointGeom, hazardPoint, { units: 'kilometers' });

        if (distance < 2) { // Within 2km of hazard
          const severityMultiplier = {
            'high': 0.3,
            'medium': 0.6,
            'low': 0.8
          }[hazard.severity] || 0.8;

          point.hazard_proximity *= severityMultiplier;
        }
      });

      // Final safety score
      point.safety_score *= point.hazard_proximity;
    });

    return grid;
  }

  /**
   * Find optimal route between two points based on existing tracks
   */
  static async findOptimalRoute(startPoint, endPoint, preferences = {}) {
    const {
      vesselDraft = 1.0,
      avoidHazards = true,
      preferVerified = true,
      maxDetour = 1.5 // Maximum route length multiplier
    } = preferences;

    // Get direct distance for reference
    const directDistance = turf.distance(
      turf.point(startPoint),
      turf.point(endPoint),
      { units: 'kilometers' }
    );

    // Find tracks that could form part of the route
    const query = `
      WITH route_line AS (
        SELECT ST_MakeLine(
          ST_Point($1, $2),
          ST_Point($3, $4)
        )::geography as line
      )
      SELECT
        t.id, t.track_uuid,
        ST_AsGeoJSON(t.geometry) as geometry,
        t.verified, t.verification_count, t.vessel_draft,
        ST_Distance(t.geometry::geography, line) as distance_from_route
      FROM tracks t, route_line
      WHERE ST_DWithin(
        t.geometry::geography,
        line,
        $5
      )
      AND t.privacy = 'public'
      AND t.vessel_draft <= $6
      ${preferVerified ? 'AND t.verified = true' : ''}
      ORDER BY
        distance_from_route ASC,
        t.verification_count DESC
      LIMIT 50
    `;

    const values = [
      startPoint[0], startPoint[1],
      endPoint[0], endPoint[1],
      directDistance * maxDetour * 1000, // Convert to meters
      vesselDraft
    ];

    const trackResult = await db.query(query, values);

    if (trackResult.rows.length === 0) {
      // No tracks found, return direct route
      return {
        type: 'direct',
        confidence: 0,
        geometry: {
          type: 'LineString',
          coordinates: [startPoint, endPoint]
        },
        distance: directDistance,
        trackCount: 0
      };
    }

    // Build optimal route from track segments
    const routeSegments = [];
    let currentPoint = startPoint;
    const usedTracks = new Set();

    while (turf.distance(turf.point(currentPoint), turf.point(endPoint)) > 0.5) {
      let bestSegment = null;
      let bestScore = -Infinity;

      for (const track of trackResult.rows) {
        if (usedTracks.has(track.id)) continue;

        const trackGeom = JSON.parse(track.geometry);
        const trackLine = turf.lineString(trackGeom.coordinates);

        // Find closest point on track to current position
        const nearestPoint = turf.nearestPointOnLine(
          trackLine,
          turf.point(currentPoint)
        );

        if (nearestPoint.properties.dist > 2) continue; // Too far from current position

        // Find point on track closest to destination
        const destinationPoint = turf.nearestPointOnLine(
          trackLine,
          turf.point(endPoint)
        );

        // Calculate score based on progress toward destination
        const currentDist = turf.distance(
          turf.point(currentPoint),
          turf.point(endPoint)
        );
        const newDist = turf.distance(
          turf.point(destinationPoint.geometry.coordinates),
          turf.point(endPoint)
        );
        const progress = currentDist - newDist;

        const score = progress * (track.verified ? 2 : 1) *
                     (track.verification_count + 1);

        if (score > bestScore) {
          bestScore = score;
          bestSegment = {
            track,
            startIndex: nearestPoint.properties.index,
            endIndex: destinationPoint.properties.index,
            endPoint: destinationPoint.geometry.coordinates
          };
        }
      }

      if (!bestSegment) {
        // No more track segments, add direct line to destination
        routeSegments.push([currentPoint, endPoint]);
        break;
      }

      // Extract the relevant portion of the track
      const trackGeom = JSON.parse(bestSegment.track.geometry);
      const segment = trackGeom.coordinates.slice(
        bestSegment.startIndex,
        bestSegment.endIndex + 1
      );
      routeSegments.push(...segment);
      currentPoint = bestSegment.endPoint;
      usedTracks.add(bestSegment.track.id);
    }

    // Simplify the route
    const fullRoute = turf.lineString(routeSegments.flat());
    const simplified = turf.simplify(fullRoute, { tolerance: 0.001, highQuality: true });

    // Calculate confidence score
    const confidence = Math.min(
      100,
      (usedTracks.size * 20) +
      (trackResult.rows.filter(t => t.verified).length * 10)
    );

    return {
      type: 'optimized',
      confidence,
      geometry: simplified.geometry,
      distance: turf.length(simplified, { units: 'kilometers' }),
      trackCount: usedTracks.size,
      usedTracks: Array.from(usedTracks)
    };
  }

  /**
   * Calculate distance from a point to a LineString
   */
  static distanceToLineString(point, lineStringGeom) {
    try {
      const line = turf.lineString(lineStringGeom.coordinates);
      const nearest = turf.nearestPointOnLine(line, point);
      return nearest.properties.dist;
    } catch (error) {
      console.error('Distance calculation error:', error);
      return Infinity;
    }
  }

  /**
   * Cluster tracks to identify common routes
   */
  static async clusterTracks(bounds, minClusterSize = 3) {
    const { minLat, minLng, maxLat, maxLng } = bounds;

    const query = `
      WITH clustered_tracks AS (
        SELECT
          ST_ClusterKMeans(geometry, 20) OVER() AS cluster_id,
          id, track_uuid, geometry, verified
        FROM tracks
        WHERE ST_Intersects(
          geometry,
          ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
        AND privacy = 'public'
        AND upload_date > NOW() - INTERVAL '6 months'
      ),
      cluster_summary AS (
        SELECT
          cluster_id,
          COUNT(*) as track_count,
          COUNT(CASE WHEN verified THEN 1 END) as verified_count,
          ST_AsGeoJSON(ST_Collect(geometry)) as cluster_geom,
          array_agg(track_uuid) as track_ids
        FROM clustered_tracks
        GROUP BY cluster_id
        HAVING COUNT(*) >= $5
      )
      SELECT
        cluster_id,
        track_count,
        verified_count,
        cluster_geom,
        track_ids,
        ST_AsGeoJSON(ST_Centroid(ST_Collect(ST_GeomFromGeoJSON(cluster_geom)))) as centroid
      FROM cluster_summary
      ORDER BY track_count DESC
    `;

    const result = await db.query(query, [
      minLng, minLat, maxLng, maxLat, minClusterSize
    ]);

    return result.rows.map(row => ({
      clusterId: row.cluster_id,
      trackCount: row.track_count,
      verifiedCount: row.verified_count,
      geometry: JSON.parse(row.cluster_geom),
      centroid: JSON.parse(row.centroid),
      trackIds: row.track_ids,
      confidence: (row.verified_count / row.track_count) * 100
    }));
  }

  /**
   * Get navigation warnings for a specific area
   */
  static async getNavigationWarnings(bounds) {
    const { minLat, minLng, maxLat, maxLng } = bounds;

    // Get hazards
    const hazardQuery = `
      SELECT
        h.type, h.severity, h.description,
        ST_AsGeoJSON(h.location) as location,
        h.active_seasons
      FROM hazards h
      WHERE ST_Within(
        h.location,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      AND h.verified = true
    `;

    const hazards = await db.query(hazardQuery, [minLng, minLat, maxLng, maxLat]);

    // Get recent water levels
    const waterQuery = `
      SELECT station_name, level_meters, reading_date
      FROM water_levels
      WHERE reading_date > NOW() - INTERVAL '24 hours'
      ORDER BY reading_date DESC
      LIMIT 1
    `;

    const waterLevels = await db.query(waterQuery);

    // Get areas with low track coverage (potentially dangerous)
    const coverageQuery = `
      WITH coverage AS (
        SELECT
          ST_Buffer(ST_Collect(geometry), 0.01) as covered_area
        FROM tracks
        WHERE ST_Intersects(
          geometry,
          ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
        AND privacy = 'public'
        AND verified = true
      )
      SELECT
        ST_AsGeoJSON(
          ST_Difference(
            ST_MakeEnvelope($1, $2, $3, $4, 4326),
            COALESCE(covered_area, ST_GeomFromText('POLYGON EMPTY'))
          )
        ) as uncovered_area
      FROM coverage
    `;

    const coverage = await db.query(coverageQuery, [minLng, minLat, maxLng, maxLat]);

    return {
      hazards: hazards.rows.map(h => ({
        ...h,
        location: JSON.parse(h.location)
      })),
      waterLevel: waterLevels.rows[0] || null,
      lowCoverageArea: coverage.rows[0]?.uncovered_area ?
        JSON.parse(coverage.rows[0].uncovered_area) : null,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = MapService;