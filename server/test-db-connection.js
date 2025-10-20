// Database Connection Test Script
// Tests PostgreSQL connection and displays database info

require('dotenv').config();
const pool = require('./db');

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...');
  console.log('=' .repeat(50));

  try {
    // Test basic connection
    const result = await pool.query('SELECT NOW(), current_database(), current_user');

    console.log('✅ Database connection successful!\n');
    console.log('Connection Details:');
    console.log('━'.repeat(50));
    console.log('📅 Server Time:', result.rows[0].now);
    console.log('🗄️  Database:', result.rows[0].current_database);
    console.log('👤 User:', result.rows[0].current_user);
    console.log('🌐 Host:', process.env.DB_HOST || 'localhost');
    console.log('🔌 Port:', process.env.DB_PORT || '5432');

    // Check if users table exists
    console.log('\n📋 Checking existing tables...');
    console.log('━'.repeat(50));

    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log(`✓ Found ${tablesResult.rows.length} existing table(s):`);
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found in database');
    }

    // Check specifically for users table
    const usersCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'users'
    `);

    if (usersCheck.rows[0].count > 0) {
      console.log('\n✅ Users table exists');

      // Get user count and roles
      const userStats = await pool.query(`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN user_type = 'student' THEN 1 END) as students,
          COUNT(CASE WHEN user_type = 'peer_support' THEN 1 END) as peer_supporters,
          COUNT(CASE WHEN user_type = 'counselor' THEN 1 END) as counselors,
          COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admins
        FROM users
      `);

      console.log('\n📊 User Statistics:');
      console.log('━'.repeat(50));
      console.log('Total Users:', userStats.rows[0].total_users);
      console.log('  - Students:', userStats.rows[0].students);
      console.log('  - Peer Supporters:', userStats.rows[0].peer_supporters);
      console.log('  - Counselors:', userStats.rows[0].counselors);
      console.log('  - Admins:', userStats.rows[0].admins);
    } else {
      console.log('\n❌ Users table not found!');
      console.log('   Migration may fail. Please create users table first.');
    }

    console.log('\n🎉 Database test completed successfully!');
    console.log('✓ Ready to run migrations\n');

  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('━'.repeat(50));
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('  - Database credentials in .env file are incorrect');
    console.error('  - PostgreSQL server is not running');
    console.error('  - Database "mindbridge_dev" does not exist');
    console.error('  - Network/firewall blocking connection');
    console.error('\nPlease check your .env file and PostgreSQL server.\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();
