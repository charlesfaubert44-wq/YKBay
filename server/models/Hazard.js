const db = require('../config/database');

class Hazard {
  static async create(hazardData) {
    const {
      type,
      severity,
      location,
      reportedBy,
      description,
      activeSeasons
    } = hazardData;

    const query = `
      INSERT INTO hazards (
        type, severity, location, reported_by,
        description, active_seasons
      ) VALUES (
        $1, $2, ST_GeomFromGeoJSON($3), $4, $5, $6
      )
      RETURNING id, hazard_uuid, created_at, verified
    `;

    const values = [
      type,
      severity,
      JSON.stringify(location),
      reportedBy,
      description,
      activeSeasons
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT
        h.*,
        ST_AsGeoJSON(h.location) as location,
        u.username as reporter_name,
        v.username as verifier_name
      FROM hazards h
      LEFT JOIN users u ON h.reported_by = u.id
      LEFT JOIN users v ON h.verified_by = v.id
      WHERE h.id = $1
    `;
    const result = await db.query(query, [id]);
    if (result.rows[0]) {
      result.rows[0].location = JSON.parse(result.rows[0].location);
    }
    return result.rows[0];
  }

  static async findByUuid(uuid) {
    const query = `
      SELECT
        h.*,
        ST_AsGeoJSON(h.location) as location,
        u.username as reporter_name,
        v.username as verifier_name
      FROM hazards h
      LEFT JOIN users u ON h.reported_by = u.id
      LEFT JOIN users v ON h.verified_by = v.id
      WHERE h.hazard_uuid = $1
    `;
    const result = await db.query(query, [uuid]);
    if (result.rows[0]) {
      result.rows[0].location = JSON.parse(result.rows[0].location);
    }
    return result.rows[0];
  }

  static async findInArea(bounds, filters = {}) {
    const { minLat, minLng, maxLat, maxLng } = bounds;
    const { type, severity, verified, activeOnly } = filters;

    let query = `
      SELECT
        h.id, h.hazard_uuid, h.type, h.severity,
        ST_AsGeoJSON(h.location) as location,
        h.report_count, h.verified, h.description,
        h.active_seasons, h.created_at, h.last_verified,
        u.username as reporter_name
      FROM hazards h
      LEFT JOIN users u ON h.reported_by = u.id
      WHERE ST_Within(
        h.location,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
    `;

    const values = [minLng, minLat, maxLng, maxLat];
    let paramIndex = 5;

    if (type) {
      query += ` AND h.type = $${paramIndex}`;
      values.push(type);
      paramIndex++;
    }

    if (severity) {
      query += ` AND h.severity = $${paramIndex}`;
      values.push(severity);
      paramIndex++;
    }

    if (verified !== undefined) {
      query += ` AND h.verified = $${paramIndex}`;
      values.push(verified);
      paramIndex++;
    }

    if (activeOnly) {
      const currentMonth = new Date().getMonth() + 1;
      const season = currentMonth >= 6 && currentMonth <= 10 ? 'summer' : 'winter';
      query += ` AND $${paramIndex} = ANY(h.active_seasons)`;
      values.push(season);
      paramIndex++;
    }

    query += ' ORDER BY h.severity DESC, h.report_count DESC';

    const result = await db.query(query, values);
    return result.rows.map(row => ({
      ...row,
      location: JSON.parse(row.location)
    }));
  }

  static async addReport(hazardId, reportData) {
    const { userId, photoUrls, description } = reportData;

    // Add the report
    const insertQuery = `
      INSERT INTO hazard_reports (hazard_id, user_id, photo_urls, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, reported_at
    `;
    const insertResult = await db.query(insertQuery, [
      hazardId, userId, photoUrls, description
    ]);

    // Update the hazard report count
    const updateQuery = `
      UPDATE hazards
      SET report_count = report_count + 1
      WHERE id = $1
      RETURNING report_count
    `;
    const updateResult = await db.query(updateQuery, [hazardId]);

    return {
      reportId: insertResult.rows[0].id,
      reportedAt: insertResult.rows[0].reported_at,
      totalReports: updateResult.rows[0].report_count
    };
  }

  static async verify(hazardId, verifiedBy) {
    const query = `
      UPDATE hazards
      SET
        verified = true,
        verified_by = $2,
        last_verified = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING verified, last_verified
    `;
    const result = await db.query(query, [hazardId, verifiedBy]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'location' && updateData[key] !== undefined) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        fields.push(`${snakeKey} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateData.location) {
      fields.push(`location = ST_GeomFromGeoJSON($${paramIndex})`);
      values.push(JSON.stringify(updateData.location));
      paramIndex++;
    }

    values.push(id);

    const query = `
      UPDATE hazards
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM hazards WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getRecentReports(hazardId, limit = 10) {
    const query = `
      SELECT
        hr.id, hr.photo_urls, hr.description, hr.reported_at,
        u.username, u.reputation_score
      FROM hazard_reports hr
      LEFT JOIN users u ON hr.user_id = u.id
      WHERE hr.hazard_id = $1
      ORDER BY hr.reported_at DESC
      LIMIT $2
    `;
    const result = await db.query(query, [hazardId, limit]);
    return result.rows;
  }

  static async getStatistics() {
    const query = `
      SELECT
        COUNT(*) as total_hazards,
        COUNT(CASE WHEN verified = true THEN 1 END) as verified_hazards,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_hazards,
        array_agg(DISTINCT type) as hazard_types
      FROM hazards
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  static async getNearbyHazards(location, radiusKm = 5) {
    const query = `
      SELECT
        h.id, h.hazard_uuid, h.type, h.severity,
        ST_AsGeoJSON(h.location) as location,
        h.description, h.verified,
        ST_Distance(
          h.location::geography,
          ST_GeomFromGeoJSON($1)::geography
        ) / 1000 as distance_km
      FROM hazards h
      WHERE ST_DWithin(
        h.location::geography,
        ST_GeomFromGeoJSON($1)::geography,
        $2
      )
      ORDER BY distance_km ASC
      LIMIT 20
    `;

    const values = [JSON.stringify(location), radiusKm * 1000];
    const result = await db.query(query, values);

    return result.rows.map(row => ({
      ...row,
      location: JSON.parse(row.location)
    }));
  }
}

module.exports = Hazard;