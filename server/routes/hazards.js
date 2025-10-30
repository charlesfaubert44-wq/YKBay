const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/hazards
 * Get all hazards, optionally filtered by bounding box
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { bbox, severity, type } = req.query;

    let query = `
      SELECT
        h.id, h.hazard_uuid, h.type, h.severity,
        h.description, h.report_count, h.verified,
        h.active_seasons, h.created_at, h.last_verified,
        ST_AsGeoJSON(h.location) as location,
        u.username as reported_by_username
      FROM hazards h
      LEFT JOIN users u ON h.reported_by = u.id
      WHERE 1=1
    `;

    const params = [];

    // Filter by bounding box
    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(parseFloat);
      params.push(minLon, minLat, maxLon, maxLat);
      query += ` AND ST_Intersects(
        h.location,
        ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326)
      )`;
    }

    // Filter by severity
    if (severity) {
      params.push(severity);
      query += ` AND h.severity = $${params.length}`;
    }

    // Filter by type
    if (type) {
      params.push(type);
      query += ` AND h.type = $${params.length}`;
    }

    query += ` ORDER BY h.severity DESC, h.report_count DESC`;

    const result = await db.query(query, params);

    const hazards = result.rows.map(row => ({
      ...row,
      location: JSON.parse(row.location)
    }));

    res.json({ hazards });
  } catch (error) {
    console.error('Get hazards error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hazards
 * Report a new hazard
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      severity,
      location,
      description,
      activeSeasons
    } = req.body;

    if (!type || !severity || !location) {
      return res.status(400).json({
        error: 'Type, severity, and location are required'
      });
    }

    const { coordinates } = location;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        error: 'Invalid location coordinates'
      });
    }

    const result = await db.query(
      `INSERT INTO hazards (
        type, severity, location, reported_by,
        description, active_seasons
      ) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7)
      RETURNING id, hazard_uuid, created_at`,
      [
        type,
        severity,
        coordinates[0], // longitude
        coordinates[1], // latitude
        req.user.id,
        description || null,
        activeSeasons || null
      ]
    );

    res.status(201).json({
      success: true,
      hazard: result.rows[0]
    });
  } catch (error) {
    console.error('Create hazard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hazards/:id/report
 * Add additional report to existing hazard
 */
router.post('/:id/report', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, photoUrls } = req.body;

    // Check if hazard exists
    const hazardCheck = await db.query(
      'SELECT id FROM hazards WHERE id = $1',
      [id]
    );

    if (hazardCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Hazard not found' });
    }

    // Add report
    await db.query(
      `INSERT INTO hazard_reports (hazard_id, user_id, description, photo_urls)
       VALUES ($1, $2, $3, $4)`,
      [id, req.user.id, description || null, photoUrls || null]
    );

    // Increment report count
    await db.query(
      'UPDATE hazards SET report_count = report_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Report added successfully'
    });
  } catch (error) {
    console.error('Add hazard report error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/hazards/:id/verify
 * Verify a hazard (admin only - simplified for now)
 */
router.put('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Add admin check
    // For now, allow any authenticated user to verify if they have high reputation

    const userCheck = await db.query(
      'SELECT reputation_score FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userCheck.rows.length === 0 || userCheck.rows[0].reputation_score < 50) {
      return res.status(403).json({
        error: 'Insufficient reputation to verify hazards'
      });
    }

    await db.query(
      `UPDATE hazards
       SET verified = true, verified_by = $1, last_verified = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [req.user.id, id]
    );

    res.json({
      success: true,
      message: 'Hazard verified successfully'
    });
  } catch (error) {
    console.error('Verify hazard error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
