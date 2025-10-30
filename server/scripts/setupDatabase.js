const { Client } = require('pg');
require('dotenv').config();

const setupDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default database first
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME;
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname='${dbName}'`;
    const result = await client.query(checkDbQuery);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }

    await client.end();

    // Connect to the new database
    const dbClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName
    });

    await dbClient.connect();
    console.log(`Connected to database '${dbName}'`);

    // Enable PostGIS extension
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS postgis');
    console.log('PostGIS extension enabled');

    // Create users table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        vessel_type VARCHAR(50),
        vessel_draft DECIMAL(4,2),
        reputation_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);
    console.log('Users table created');

    // Create tracks table with PostGIS geometry
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        track_uuid UUID DEFAULT gen_random_uuid(),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        vessel_type VARCHAR(50),
        vessel_draft DECIMAL(4,2),
        water_level DECIMAL(6,2),
        wind_speed DECIMAL(5,2),
        wave_height DECIMAL(4,2),
        visibility VARCHAR(20),
        geometry GEOMETRY(LineString, 4326),
        distance_km DECIMAL(8,2),
        duration_seconds INTEGER,
        avg_speed_kmh DECIMAL(6,2),
        point_count INTEGER,
        privacy VARCHAR(20) DEFAULT 'public',
        notes TEXT,
        tags TEXT[],
        gpx_file_path VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        verification_count INTEGER DEFAULT 0
      )
    `);
    console.log('Tracks table created');

    // Create spatial index on tracks
    await dbClient.query(`
      CREATE INDEX IF NOT EXISTS idx_tracks_geometry
      ON tracks USING GIST(geometry)
    `);
    console.log('Spatial index created on tracks');

    // Create hazards table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS hazards (
        id SERIAL PRIMARY KEY,
        hazard_uuid UUID DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        location GEOMETRY(Point, 4326),
        reported_by INTEGER REFERENCES users(id),
        report_count INTEGER DEFAULT 1,
        verified BOOLEAN DEFAULT FALSE,
        verified_by INTEGER REFERENCES users(id),
        description TEXT,
        active_seasons TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_verified TIMESTAMP
      )
    `);
    console.log('Hazards table created');

    // Create spatial index on hazards
    await dbClient.query(`
      CREATE INDEX IF NOT EXISTS idx_hazards_location
      ON hazards USING GIST(location)
    `);
    console.log('Spatial index created on hazards');

    // Create official routes table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS official_routes (
        id SERIAL PRIMARY KEY,
        route_uuid UUID DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        geometry GEOMETRY(LineString, 4326),
        min_draft DECIMAL(4,2),
        max_draft DECIMAL(4,2),
        min_water_level DECIMAL(6,2),
        seasonal_availability TEXT[],
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('Official routes table created');

    // Create route waypoints table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS route_waypoints (
        id SERIAL PRIMARY KEY,
        route_id INTEGER REFERENCES official_routes(id) ON DELETE CASCADE,
        sequence_order INTEGER NOT NULL,
        location GEOMETRY(Point, 4326),
        name VARCHAR(100),
        description TEXT,
        waypoint_type VARCHAR(50)
      )
    `);
    console.log('Route waypoints table created');

    // Create track comments table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS track_comments (
        id SERIAL PRIMARY KEY,
        track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Track comments table created');

    // Create hazard reports table (for multiple reports of same hazard)
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS hazard_reports (
        id SERIAL PRIMARY KEY,
        hazard_id INTEGER REFERENCES hazards(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        photo_urls TEXT[],
        description TEXT,
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Hazard reports table created');

    // Create water level readings table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS water_levels (
        id SERIAL PRIMARY KEY,
        station_name VARCHAR(100),
        reading_date TIMESTAMP NOT NULL,
        level_meters DECIMAL(6,2) NOT NULL,
        source VARCHAR(50) DEFAULT 'environment_canada',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Water levels table created');

    // Create index on water level readings
    await dbClient.query(`
      CREATE INDEX IF NOT EXISTS idx_water_levels_date
      ON water_levels(reading_date DESC)
    `);

    // Insert sample admin user (password: admin123 - CHANGE IN PRODUCTION!)
    const bcrypt = require('bcrypt');
    const adminPassword = await bcrypt.hash('admin123', 10);

    await dbClient.query(`
      INSERT INTO users (username, email, password_hash, vessel_type, vessel_draft, reputation_score)
      VALUES ('admin', 'admin@truenorth.local', $1, 'aluminum-boat', 0.6, 100)
      ON CONFLICT (username) DO NOTHING
    `, [adminPassword]);
    console.log('Admin user created (username: admin, password: admin123)');

    console.log('\n✅ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env file with database credentials');
    console.log('2. Run: npm run dev');
    console.log('3. Access the app at http://localhost:5173');

    await dbClient.end();
    process.exit(0);

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
