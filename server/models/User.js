const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    const { username, email, password, vesselType, vesselDraft } = userData;
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, email, password_hash, vessel_type, vessel_draft)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, vessel_type, vessel_draft, reputation_score, created_at
    `;

    const values = [username, email, passwordHash, vesselType, vesselDraft];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, username, email, vessel_type, vessel_draft, reputation_score, created_at, last_login
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, vessel_type, vessel_draft, reputation_score, created_at
      FROM users WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = `
      SELECT id, username, email, password_hash, vessel_type, vessel_draft, reputation_score, created_at
      FROM users WHERE username = $1
    `;
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        fields.push(`${snakeKey} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, username, email, vessel_type, vessel_draft, reputation_score, created_at
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    const query = `
      UPDATE users SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING last_login
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateReputationScore(id, scoreChange) {
    const query = `
      UPDATE users
      SET reputation_score = reputation_score + $2
      WHERE id = $1
      RETURNING reputation_score
    `;
    const result = await db.query(query, [id, scoreChange]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, username, email, vessel_type, vessel_draft, reputation_score, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  static async getTopContributors(limit = 10) {
    const query = `
      SELECT u.id, u.username, u.reputation_score,
        COUNT(DISTINCT t.id) as track_count,
        COUNT(DISTINCT h.id) as hazard_reports
      FROM users u
      LEFT JOIN tracks t ON u.id = t.user_id
      LEFT JOIN hazards h ON u.id = h.reported_by
      GROUP BY u.id, u.username, u.reputation_score
      ORDER BY u.reputation_score DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  static async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }
}

module.exports = User;