const Track = require('../models/Track');
const User = require('../models/User');
const gpxParser = require('../services/gpxParser');

class TrackController {
  static async uploadTrack(req, res) {
    try {
      const userId = req.user.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Parse the GPX file
      const trackData = await gpxParser.parseGPX(file.path);

      // Get additional metadata from request
      const {
        vesselType,
        vesselDraft,
        waterLevel,
        windSpeed,
        waveHeight,
        visibility,
        privacy,
        notes,
        tags
      } = req.body;

      // Create track in database
      const track = await Track.create({
        userId,
        vesselType: vesselType || trackData.vesselType,
        vesselDraft: parseFloat(vesselDraft) || null,
        waterLevel: parseFloat(waterLevel) || null,
        windSpeed: parseFloat(windSpeed) || null,
        waveHeight: parseFloat(waveHeight) || null,
        visibility: visibility || 'good',
        geometry: trackData.geometry,
        distanceKm: trackData.distance,
        durationSeconds: trackData.duration,
        avgSpeedKmh: trackData.averageSpeed,
        pointCount: trackData.pointCount,
        privacy: privacy || 'public',
        notes,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        gpxFilePath: file.path
      });

      // Award reputation points for contributing
      await User.updateReputationScore(userId, 5);

      res.status(201).json({
        success: true,
        data: {
          trackId: track.id,
          trackUuid: track.track_uuid,
          uploadDate: track.upload_date,
          distance: trackData.distance,
          duration: trackData.duration
        },
        message: 'Track uploaded successfully'
      });
    } catch (error) {
      console.error('Track upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Track upload failed'
      });
    }
  }

  static async getTrack(req, res) {
    try {
      const { id } = req.params;
      const track = await Track.findById(id);

      if (!track) {
        return res.status(404).json({
          success: false,
          error: 'Track not found'
        });
      }

      // Check privacy settings
      if (track.privacy === 'private' &&
          (!req.user || req.user.userId !== track.user_id)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to private track'
        });
      }

      res.json({
        success: true,
        data: track
      });
    } catch (error) {
      console.error('Get track error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve track'
      });
    }
  }

  static async getUserTracks(req, res) {
    try {
      const userId = req.user.userId;
      const { limit = 50, offset = 0 } = req.query;

      const tracks = await Track.findByUser(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: tracks,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: tracks.length
        }
      });
    } catch (error) {
      console.error('Get user tracks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user tracks'
      });
    }
  }

  static async searchTracks(req, res) {
    try {
      const {
        minLat, minLng, maxLat, maxLng,
        vesselType, minDraft, maxDraft,
        minWaterLevel, verified, limit = 100
      } = req.query;

      if (!minLat || !minLng || !maxLat || !maxLng) {
        return res.status(400).json({
          success: false,
          error: 'Bounding box coordinates required'
        });
      }

      const bounds = {
        minLat: parseFloat(minLat),
        minLng: parseFloat(minLng),
        maxLat: parseFloat(maxLat),
        maxLng: parseFloat(maxLng)
      };

      const filters = {
        vesselType,
        minDraft: minDraft ? parseFloat(minDraft) : undefined,
        maxDraft: maxDraft ? parseFloat(maxDraft) : undefined,
        minWaterLevel: minWaterLevel ? parseFloat(minWaterLevel) : undefined,
        verified: verified === 'true',
        limit: parseInt(limit)
      };

      const tracks = await Track.findInArea(bounds, filters);

      res.json({
        success: true,
        data: tracks,
        count: tracks.length
      });
    } catch (error) {
      console.error('Search tracks error:', error);
      res.status(500).json({
        success: false,
        error: 'Track search failed'
      });
    }
  }

  static async getPopularRoutes(req, res) {
    try {
      const { limit = 10 } = req.query;
      const routes = await Track.getPopularRoutes(parseInt(limit));

      res.json({
        success: true,
        data: routes
      });
    } catch (error) {
      console.error('Get popular routes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve popular routes'
      });
    }
  }

  static async verifyTrack(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Check if track exists
      const track = await Track.findById(id);
      if (!track) {
        return res.status(404).json({
          success: false,
          error: 'Track not found'
        });
      }

      // Users can't verify their own tracks
      if (track.user_id === userId) {
        return res.status(400).json({
          success: false,
          error: 'You cannot verify your own track'
        });
      }

      const result = await Track.verify(id, userId);

      // Award reputation to both verifier and track owner
      await User.updateReputationScore(userId, 2);
      if (result.verified) {
        await User.updateReputationScore(track.user_id, 10);
      }

      res.json({
        success: true,
        data: result,
        message: 'Track verification recorded'
      });
    } catch (error) {
      console.error('Verify track error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Verification failed'
      });
    }
  }

  static async deleteTrack(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Check if track exists and user owns it
      const track = await Track.findById(id);
      if (!track) {
        return res.status(404).json({
          success: false,
          error: 'Track not found'
        });
      }

      if (track.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own tracks'
        });
      }

      await Track.delete(id);

      res.json({
        success: true,
        message: 'Track deleted successfully'
      });
    } catch (error) {
      console.error('Delete track error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete track'
      });
    }
  }

  static async getStatistics(req, res) {
    try {
      const stats = await Track.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve statistics'
      });
    }
  }
}

module.exports = TrackController;