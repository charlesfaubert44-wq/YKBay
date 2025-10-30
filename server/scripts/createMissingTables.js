const { Client } = require('pg');
require('dotenv').config();

const createMissingTables = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create track_verifications table (for many-to-many relationship)
    await client.query(`
      CREATE TABLE IF NOT EXISTS track_verifications (
        id SERIAL PRIMARY KEY,
        track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(track_id, user_id)
      )
    `);
    console.log('Track verifications table created');

    // Create sessions table for refresh tokens (optional)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        refresh_token_hash VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('User sessions table created');

    // Create analytics table for tracking app usage
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        session_id VARCHAR(100),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Analytics events table created');

    // Create saved routes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_routes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        start_point GEOMETRY(Point, 4326) NOT NULL,
        end_point GEOMETRY(Point, 4326) NOT NULL,
        route_geometry GEOMETRY(LineString, 4326),
        preferences JSONB,
        distance_km DECIMAL(8,2),
        estimated_duration_seconds INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP
      )
    `);
    console.log('Saved routes table created');

    // Create weather conditions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS weather_conditions (
        id SERIAL PRIMARY KEY,
        location GEOMETRY(Point, 4326) NOT NULL,
        temperature_c DECIMAL(5,2),
        wind_speed_kmh DECIMAL(5,2),
        wind_direction INTEGER,
        visibility_km DECIMAL(5,2),
        conditions VARCHAR(50),
        source VARCHAR(50),
        observed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Weather conditions table created');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT,
        data JSONB,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      )
    `);
    console.log('Notifications table created');

    // Create track_likes table for social features
    await client.query(`
      CREATE TABLE IF NOT EXISTS track_likes (
        id SERIAL PRIMARY KEY,
        track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(track_id, user_id)
      )
    `);
    console.log('Track likes table created');

    // Create user_follows table for social features
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id),
        CHECK (follower_id != following_id)
      )
    `);
    console.log('User follows table created');

    // Create route_segments table for AI analysis
    await client.query(`
      CREATE TABLE IF NOT EXISTS route_segments (
        id SERIAL PRIMARY KEY,
        segment_hash VARCHAR(64) UNIQUE NOT NULL,
        geometry GEOMETRY(LineString, 4326) NOT NULL,
        usage_count INTEGER DEFAULT 1,
        avg_vessel_draft DECIMAL(4,2),
        avg_water_level DECIMAL(6,2),
        safety_score DECIMAL(3,2),
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Route segments table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_user_created
      ON analytics_events(user_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_saved_routes_user
      ON saved_routes(user_id);

      CREATE INDEX IF NOT EXISTS idx_weather_location
      ON weather_conditions USING GIST(location);

      CREATE INDEX IF NOT EXISTS idx_weather_observed
      ON weather_conditions(observed_at DESC);

      CREATE INDEX IF NOT EXISTS idx_notifications_user_read
      ON notifications(user_id, read);

      CREATE INDEX IF NOT EXISTS idx_track_likes_track
      ON track_likes(track_id);

      CREATE INDEX IF NOT EXISTS idx_route_segments_geometry
      ON route_segments USING GIST(geometry);

      CREATE INDEX IF NOT EXISTS idx_route_segments_usage
      ON route_segments(usage_count DESC);
    `);
    console.log('Additional indexes created');

    // Create materialized view for popular routes
    await client.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS popular_routes AS
      WITH route_stats AS (
        SELECT
          ST_SnapToGrid(geometry, 0.001) as grid_geom,
          COUNT(*) as track_count,
          AVG(vessel_draft) as avg_draft,
          AVG(water_level) as avg_water_level,
          COUNT(CASE WHEN verified THEN 1 END) as verified_count
        FROM tracks
        WHERE privacy = 'public'
          AND upload_date > NOW() - INTERVAL '90 days'
        GROUP BY grid_geom
        HAVING COUNT(*) >= 3
      )
      SELECT
        row_number() OVER () as id,
        grid_geom as geometry,
        track_count,
        avg_draft,
        avg_water_level,
        verified_count,
        (verified_count::float / track_count * 100) as confidence_score
      FROM route_stats
      ORDER BY track_count DESC
      LIMIT 100
    `);
    console.log('Popular routes materialized view created');

    // Create function to refresh materialized view
    await client.query(`
      CREATE OR REPLACE FUNCTION refresh_popular_routes()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY popular_routes;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Refresh function created');

    // Create trigger function for updating user reputation
    await client.query(`
      CREATE OR REPLACE FUNCTION update_user_reputation()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Award points for track upload
        IF TG_TABLE_NAME = 'tracks' AND TG_OP = 'INSERT' THEN
          UPDATE users SET reputation_score = reputation_score + 5
          WHERE id = NEW.user_id;
        END IF;

        -- Award points for hazard report
        IF TG_TABLE_NAME = 'hazards' AND TG_OP = 'INSERT' THEN
          UPDATE users SET reputation_score = reputation_score + 3
          WHERE id = NEW.reported_by;
        END IF;

        -- Award points for verification
        IF TG_TABLE_NAME = 'track_verifications' AND TG_OP = 'INSERT' THEN
          UPDATE users SET reputation_score = reputation_score + 2
          WHERE id = NEW.user_id;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Reputation trigger function created');

    // Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS track_upload_reputation ON tracks;
      CREATE TRIGGER track_upload_reputation
      AFTER INSERT ON tracks
      FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

      DROP TRIGGER IF EXISTS hazard_report_reputation ON hazards;
      CREATE TRIGGER hazard_report_reputation
      AFTER INSERT ON hazards
      FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

      DROP TRIGGER IF EXISTS verification_reputation ON track_verifications;
      CREATE TRIGGER verification_reputation
      AFTER INSERT ON track_verifications
      FOR EACH ROW EXECUTE FUNCTION update_user_reputation();
    `);
    console.log('Reputation triggers created');

    console.log('\n✅ All missing tables and features created successfully!');

    await client.end();
    process.exit(0);

  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createMissingTables();