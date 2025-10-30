const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');
const GPXParser = require('../services/gpxParser');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.gpx', '.kml', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only GPX, KML, and CSV files are allowed.'));
    }
  }
});

/**
 * POST /api/tracks/upload
 * Upload and parse GPS track file
 */
router.post('/upload', authenticateToken, upload.single('trackFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      vesselType,
      vesselDraft,
      waterLevel,
      windSpeed,
      waveHeight,
      visibility,
      notes,
      privacy
    } = req.body;

    // Parse the uploaded file based on extension
    const ext = path.extname(req.file.filename).toLowerCase();
    let parsedData;

    if (ext === '.gpx') {
      parsedData = await GPXParser.parseGPX(req.file.path);
    } else if (ext === '.kml') {
      parsedData = await GPXParser.parseKML(req.file.path);
    } else if (ext === '.csv') {
      parsedData = await GPXParser.parseCSV(req.file.path);
    }

    if (!parsedData || !parsedData.tracks || parsedData.tracks.length === 0) {
      return res.status(400).json({ error: 'No valid tracks found in file' });
    }

    // Save track to database
    const track = parsedData.tracks[0]; // Use first track
    const geometry = JSON.stringify(track.geometry);

    const result = await db.query(
      `INSERT INTO tracks (
        user_id, vessel_type, vessel_draft, water_level,
        wind_speed, wave_height, visibility, geometry,
        distance_km, duration_seconds, avg_speed_kmh,
        point_count, privacy, notes, gpx_file_path
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, ST_GeomFromGeoJSON($8), $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, track_uuid, upload_date`,
      [
        req.user.id,
        vesselType || null,
        vesselDraft || null,
        waterLevel || null,
        windSpeed || null,
        waveHeight || null,
        visibility || 'good',
        geometry,
        track.statistics.distanceKm,
        track.statistics.durationSeconds,
        track.statistics.avgSpeedKmh,
        track.pointCount,
        privacy || 'public',
        notes || null,
        req.file.path
      ]
    );

    res.json({
      success: true,
      track: {
        id: result.rows[0].id,
        uuid: result.rows[0].track_uuid,
        uploadDate: result.rows[0].upload_date,
        statistics: track.statistics,
        pointCount: track.pointCount
      }
    });
  } catch (error) {
    console.error('Track upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tracks
 * Get all public tracks or user's own tracks
 */
router.get('/', async (req, res) => {
  try {
    const { bbox, userId, privacy } = req.query;

    let query = `
      SELECT
        id, track_uuid, upload_date, vessel_type, vessel_draft,
        water_level, distance_km, duration_seconds, avg_speed_kmh,
        point_count, privacy, notes, verified,
        ST_AsGeoJSON(geometry) as geometry
      FROM tracks
      WHERE 1=1
    `;

    const params = [];

    // Filter by bounding box if provided
    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(parseFloat);
      params.push(minLon, minLat, maxLon, maxLat);
      query += ` AND ST_Intersects(
        geometry,
        ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326)
      )`;
    }

    // Filter by privacy
    if (!userId) {
      query += ` AND privacy = 'public'`;
    } else {
      params.push(userId);
      query += ` AND (privacy = 'public' OR user_id = $${params.length})`;
    }

    query += ` ORDER BY upload_date DESC LIMIT 1000`;

    const result = await db.query(query, params);

    const tracks = result.rows.map(row => ({
      ...row,
      geometry: JSON.parse(row.geometry)
    }));

    res.json({ tracks });
  } catch (error) {
    console.error('Get tracks error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tracks/:id
 * Get specific track details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT
        t.*,
        u.username,
        ST_AsGeoJSON(t.geometry) as geometry
      FROM tracks t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const track = {
      ...result.rows[0],
      geometry: JSON.parse(result.rows[0].geometry)
    };

    res.json({ track });
  } catch (error) {
    console.error('Get track error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tracks/heatmap/data
 * Get track density heatmap data
 */
router.get('/heatmap/data', async (req, res) => {
  try {
    const { bbox } = req.query;

    // Get all public tracks within bounding box
    let query = `
      SELECT ST_AsGeoJSON(geometry) as geometry
      FROM tracks
      WHERE privacy = 'public'
    `;

    const params = [];
    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(parseFloat);
      params.push(minLon, minLat, maxLon, maxLat);
      query += ` AND ST_Intersects(
        geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )`;
    }

    const result = await db.query(query, params);

    // Convert to GeoJSON FeatureCollection
    const features = result.rows.map((row, index) => ({
      type: 'Feature',
      properties: { weight: 1 },
      geometry: JSON.parse(row.geometry)
    }));

    res.json({
      type: 'FeatureCollection',
      features: features
    });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/tracks/:id
 * Delete a track (only owner can delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the track
    const checkResult = await db.query(
      'SELECT user_id, gpx_file_path FROM tracks WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }

    if (checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this track' });
    }

    // Delete file if exists
    const filePath = checkResult.rows[0].gpx_file_path;
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Delete track from database
    await db.query('DELETE FROM tracks WHERE id = $1', [id]);

    res.json({ success: true, message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
