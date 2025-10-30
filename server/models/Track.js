const db = require('../config/database');

class Track {
  static async create(trackData) {
    const {
      userId,
      vesselType,
      vesselDraft,
      waterLevel,
      windSpeed,
      waveHeight,
      visibility,
      geometry,
      distanceKm,
      durationSeconds,
      avgSpeedKmh,
      pointCount,
      privacy,
      notes,
      tags,
      gpxFilePath
    } = trackData;

    const query = `
      INSERT INTO tracks (
        user_id, vessel_type, vessel_draft, water_level,
        wind_speed, wave_height, visibility, geometry,
        distance_km, duration_seconds, avg_speed_kmh, point_count,
        privacy, notes, tags, gpx_file_path
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        ST_GeomFromGeoJSON($8),
        $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING id, track_uuid, upload_date, verified, verification_count
    `;

    const values = [
      userId, vesselType, vesselDraft, waterLevel,
      windSpeed, waveHeight, visibility, JSON.stringify(geometry),
      distanceKm, durationSeconds, avgSpeedKmh, pointCount,
      privacy, notes, tags, gpxFilePath
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT
        t.*,
        ST_AsGeoJSON(t.geometry) as geometry,
        u.username,
        u.reputation_score
      FROM tracks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows[0]) {
      result.rows[0].geometry = JSON.parse(result.rows[0].geometry);
    }
    return result.rows[0];
  }

  static async findByUuid(uuid) {
    const query = `
      SELECT
        t.*,
        ST_AsGeoJSON(t.geometry) as geometry,
        u.username,
        u.reputation_score
      FROM tracks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.track_uuid = $1
    `;
    const result = await db.query(query, [uuid]);
    if (result.rows[0]) {
      result.rows[0].geometry = JSON.parse(result.rows[0].geometry);
    }
    return result.rows[0];
  }

  static async findByUser(userId, limit = 50, offset = 0) {
    const query = `
      SELECT
        id, track_uuid, upload_date, vessel_type, vessel_draft,
        water_level, wind_speed, wave_height, visibility,
        distance_km, duration_seconds, avg_speed_kmh, point_count,
        privacy, notes, tags, verified, verification_count,
        ST_AsGeoJSON(geometry) as geometry
      FROM tracks
      WHERE user_id = $1
      ORDER BY upload_date DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows.map(row => ({
      ...row,
      geometry: JSON.parse(row.geometry)
    }));
  }

  static async findInArea(bounds, filters = {}) {
    const { minLat, minLng, maxLat, maxLng } = bounds;
    const {
      vesselType,
      minDraft,
      maxDraft,
      minWaterLevel,
      verified,
      limit = 100
    } = filters;

    let query = `
      SELECT
        t.id, t.track_uuid, t.upload_date, t.vessel_type, t.vessel_draft,
        t.water_level, t.wind_speed, t.wave_height, t.visibility,
        t.distance_km, t.avg_speed_kmh, t.verified, t.verification_count,
        ST_AsGeoJSON(t.geometry) as geometry,
        u.username
      FROM tracks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE ST_Intersects(
        t.geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      AND t.privacy = 'public'
    `;

    const values = [minLng, minLat, maxLng, maxLat];
    let paramIndex = 5;

    if (vesselType) {
      query += ` AND t.vessel_type = $${paramIndex}`;
      values.push(vesselType);
      paramIndex++;
    }

    if (minDraft !== undefined) {
      query += ` AND t.vessel_draft >= $${paramIndex}`;
      values.push(minDraft);
      paramIndex++;
    }

    if (maxDraft !== undefined) {
      query += ` AND t.vessel_draft <= $${paramIndex}`;
      values.push(maxDraft);
      paramIndex++;
    }

    if (minWaterLevel !== undefined) {
      query += ` AND t.water_level >= $${paramIndex}`;
      values.push(minWaterLevel);
      paramIndex++;
    }

    if (verified !== undefined) {
      query += ` AND t.verified = $${paramIndex}`;
      values.push(verified);
      paramIndex++;
    }

    query += ` ORDER BY t.upload_date DESC LIMIT $${paramIndex}`;
    values.push(limit);

    const result = await db.query(query, values);
    return result.rows.map(row => ({
      ...row,
      geometry: JSON.parse(row.geometry)
    }));
  }

  static async getPopularRoutes(limit = 10) {
    const query = `
      WITH track_clusters AS (
        SELECT
          ST_ClusterKMeans(geometry, 20) OVER() AS cluster_id,
          t.*
        FROM tracks t
        WHERE t.privacy = 'public'
          AND t.upload_date > NOW() - INTERVAL '90 days'
      ),
      cluster_stats AS (
        SELECT
          cluster_id,
          COUNT(*) as track_count,
          AVG(vessel_draft) as avg_draft,
          AVG(water_level) as avg_water_level,
          ST_Collect(geometry) as cluster_geom,
          array_agg(DISTINCT vessel_type) as vessel_types
        FROM track_clusters
        GROUP BY cluster_id
        HAVING COUNT(*) >= 3
      )
      SELECT
        cluster_id,
        track_count,
        avg_draft,
        avg_water_level,
        vessel_types,
        ST_AsGeoJSON(ST_Centroid(cluster_geom)) as centroid,
        ST_AsGeoJSON(ST_ConvexHull(cluster_geom)) as coverage_area
      FROM cluster_stats
      ORDER BY track_count DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);
    return result.rows.map(row => ({
      ...row,
      centroid: JSON.parse(row.centroid),
      coverage_area: JSON.parse(row.coverage_area)
    }));
  }

  static async verify(trackId, userId) {
    const checkQuery = `
      SELECT * FROM track_verifications
      WHERE track_id = $1 AND user_id = $2
    `;
    const checkResult = await db.query(checkQuery, [trackId, userId]);

    if (checkResult.rows.length > 0) {
      throw new Error('User has already verified this track');
    }

    const insertQuery = `
      INSERT INTO track_verifications (track_id, user_id)
      VALUES ($1, $2)
    `;
    await db.query(insertQuery, [trackId, userId]);

    const updateQuery = `
      UPDATE tracks
      SET
        verification_count = verification_count + 1,
        verified = CASE
          WHEN verification_count >= 2 THEN true
          ELSE false
        END
      WHERE id = $1
      RETURNING verified, verification_count
    `;

    const result = await db.query(updateQuery, [trackId]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM tracks WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_tracks,
        COUNT(DISTINCT user_id) as unique_contributors,
        SUM(distance_km) as total_distance_km,
        AVG(distance_km) as avg_distance_km,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_tracks,
        COUNT(CASE WHEN upload_date > NOW() - INTERVAL '7 days' THEN 1 END) as recent_tracks
      FROM tracks
      WHERE privacy = 'public'
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = Track;