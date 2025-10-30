const bcrypt = require('bcrypt');
const { initDatabase, run } = require('../config/database-sqlite');
const { v4: uuidv4 } = require('uuid');

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up SQLite database...\n');

    // Initialize database schema
    await initDatabase();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);

    try {
      await run(
        `INSERT INTO users (username, email, password_hash, vessel_type, vessel_draft, reputation_score)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin', 'admin@truenorth.local', adminPassword, 'aluminum-boat', 0.6, 100]
      );
      console.log('✅ Admin user created (username: admin, password: admin123)');
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        console.log('ℹ️  Admin user already exists');
      } else {
        throw err;
      }
    }

    console.log('\n✅ SQLite Database setup completed successfully!\n');
    console.log('📝 Note: SQLite mode has limitations:');
    console.log('   - No spatial queries (PostGIS features)');
    console.log('   - Simplified geometry handling');
    console.log('   - Good for testing and development\n');
    console.log('Next steps:');
    console.log('1. Update your .env file (no database credentials needed for SQLite)');
    console.log('2. Run: npm run dev');
    console.log('3. Access the app at http://localhost:5173\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

// Add uuid package if not installed
try {
  require('uuid');
} catch (err) {
  console.log('Installing uuid package...');
  require('child_process').execSync('npm install uuid', { stdio: 'inherit' });
}

setupDatabase();
