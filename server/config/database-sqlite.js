const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database (simplified version without PostGIS)
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          vessel_type TEXT,
          vessel_draft REAL,
          reputation_score INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME
        )
      `);

      // Tracks table (geometry stored as JSON string)
      db.run(`
        CREATE TABLE IF NOT EXISTS tracks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          track_uuid TEXT UNIQUE,
          upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          vessel_type TEXT,
          vessel_draft REAL,
          water_level REAL,
          wind_speed REAL,
          wave_height REAL,
          visibility TEXT,
          geometry TEXT,
          distance_km REAL,
          duration_seconds INTEGER,
          avg_speed_kmh REAL,
          point_count INTEGER,
          privacy TEXT DEFAULT 'public',
          notes TEXT,
          tags TEXT,
          gpx_file_path TEXT,
          verified INTEGER DEFAULT 0,
          verification_count INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Hazards table
      db.run(`
        CREATE TABLE IF NOT EXISTS hazards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hazard_uuid TEXT UNIQUE,
          type TEXT NOT NULL,
          severity TEXT NOT NULL,
          location TEXT,
          reported_by INTEGER,
          report_count INTEGER DEFAULT 1,
          verified INTEGER DEFAULT 0,
          verified_by INTEGER,
          description TEXT,
          active_seasons TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_verified DATETIME,
          FOREIGN KEY (reported_by) REFERENCES users(id)
        )
      `);

      // Official routes table
      db.run(`
        CREATE TABLE IF NOT EXISTS official_routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          route_uuid TEXT UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          geometry TEXT,
          min_draft REAL,
          max_draft REAL,
          min_water_level REAL,
          seasonal_availability TEXT,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          active INTEGER DEFAULT 1,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      console.log('✅ SQLite database initialized');
      resolve();
    });
  });
};

// Promisify database operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ rows });
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ rows: [{ id: this.lastID }] });
    });
  });
};

module.exports = {
  query,
  run,
  initDatabase
};
