const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/routes
 * Get all official routes
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { bbox, minDraft, maxDraft } = req.query;

    let query = `
      SELECT
        r.id, r.route_uuid, r.name, r.description,
        r.min_draft, r.max_draft, r.min_water_level,
        r.seasonal_availability, r.created_at, r.active,
        ST_AsGeoJSON(r.geometry) as geometry,
        u.username as created_by_username
      FROM official_routes r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.active = true
    `;

    const params = [];

    // Filter by bounding box
    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(parseFloat);
      params.push(minLon, minLat, maxLon, maxLat);
      query += ` AND ST_Intersects(
        r.geometry,
        ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326)
      )`;
    }

    // Filter by draft requirements
    if (minDraft) {
      params.push(parseFloat(minDraft));
      query += ` AND (r.min_draft IS NULL OR r.min_draft <= $${params.length})`;
    }

    if (maxDraft) {
      params.push(parseFloat(maxDraft));
      query += ` AND (r.max_draft IS NULL OR r.max_draft >= $${params.length})`;
    }

    query += ` ORDER BY r.name`;

    const result = await db.query(query, params);

    const routes = result.rows.map(row => ({
      ...row,
      geometry: JSON.parse(row.geometry)
    }));

    res.json({ routes });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/routes/:id
 * Get specific route with waypoints
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const routeResult = await db.query(
      `SELECT
        r.id, r.route_uuid, r.name, r.description,
        r.min_draft, r.max_draft, r.min_water_level,
        r.seasonal_availability, r.created_at, r.active,
        ST_AsGeoJSON(r.geometry) as geometry,
        u.username as created_by_username
      FROM official_routes r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = $1`,
      [id]
    );

    if (routeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = {
      ...routeResult.rows[0],
      geometry: JSON.parse(routeResult.rows[0].geometry)
    };

    // Get waypoints
    const waypointsResult = await db.query(
      `SELECT
        id, sequence_order, name, description,
        waypoint_type, ST_AsGeoJSON(location) as location
      FROM route_waypoints
      WHERE route_id = $1
      ORDER BY sequence_order`,
      [id]
    );

    route.waypoints = waypointsResult.rows.map(row => ({
      ...row,
      location: JSON.parse(row.location)
    }));

    res.json({ route });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
