const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, vesselType, vesselDraft } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username, email, and password are required'
        });
      }

      // Check if user already exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          error: 'Username already taken'
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        vesselType: vesselType || null,
        vesselDraft: vesselDraft || null
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            vesselType: user.vessel_type,
            vesselDraft: user.vessel_draft
          },
          token
        },
        message: 'Registration successful'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValid = await User.verifyPassword(user, password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            vesselType: user.vessel_type,
            vesselDraft: user.vessel_draft,
            reputationScore: user.reputation_score
          },
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token required'
        });
      }

      // Verify the old token (even if expired, we just check signature)
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      // Get user to ensure they still exist
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: { token: newToken },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Token refresh failed'
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current and new password are required'
        });
      }

      // Get user with password hash
      const user = await User.findById(userId);
      const userWithPassword = await User.findByEmail(user.email);

      // Verify current password
      const isValid = await User.verifyPassword(userWithPassword, currentPassword);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      const bcrypt = require('bcrypt');
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      const db = require('../config/database');
      await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPasswordHash, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        error: 'Password change failed'
      });
    }
  }

  static async logout(req, res) {
    // Since we're using stateless JWT, logout is handled client-side
    // This endpoint can be used for logging purposes or token blacklisting
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }

  static async verify(req, res) {
    // This endpoint verifies if the token is valid
    // The auth middleware already validated the token
    try {
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            vesselType: user.vessel_type,
            vesselDraft: user.vessel_draft,
            reputationScore: user.reputation_score
          }
        }
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Verification failed'
      });
    }
  }
}

module.exports = AuthController;