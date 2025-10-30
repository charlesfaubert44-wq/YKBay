const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get track statistics
    const trackStats = await db.query(
      `SELECT
        COUNT(*) as total_tracks,
        COALESCE(SUM(distance_km), 0) as total_distance,
        COALESCE(AVG(distance_km), 0) as avg_distance
      FROM tracks
      WHERE user_id = $1`,
      [userId]
    );

    // Get reputation score
    const userInfo = await db.query(
      'SELECT reputation_score FROM users WHERE id = $1',
      [userId]
    );

    // Get contribution count (tracks + hazard reports)
    const contributions = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM tracks WHERE user_id = $1) +
        (SELECT COUNT(*) FROM hazard_reports WHERE user_id = $1) as total
      `,
      [userId]
    );

    res.json({
      tracksUploaded: parseInt(trackStats.rows[0].total_tracks),
      totalDistance: parseFloat(trackStats.rows[0].total_distance).toFixed(2),
      avgDistance: parseFloat(trackStats.rows[0].avg_distance).toFixed(2),
      reputationScore: userInfo.rows[0].reputation_score,
      contributions: parseInt(contributions.rows[0].total)
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/tracks
 * Get user's tracks
 */
router.get('/tracks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT
        id, track_uuid, upload_date, distance_km,
        duration_seconds, privacy, notes, verified
      FROM tracks
      WHERE user_id = $1
      ORDER BY upload_date DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ tracks: result.rows });
  } catch (error) {
    console.error('Get user tracks error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/users/leaderboard
 * Get community leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await db.query(
      `SELECT
        username,
        reputation_score,
        (SELECT COUNT(*) FROM tracks WHERE user_id = users.id AND privacy = 'public') as public_tracks
      FROM users
      ORDER BY reputation_score DESC
      LIMIT $1`,
      [limit]
    );

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
