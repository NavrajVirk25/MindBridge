require('dotenv').config();
const pool = require('../db');

async function checkDatabase() {
  console.log('Checking database connection and users...\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Check users table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📋 Users table structure:');
    console.table(tableInfo.rows);

    // Check existing users
    const users = await pool.query(`
      SELECT
        id,
        email,
        first_name,
        last_name,
        user_type,
        CASE
          WHEN password_hash IS NULL THEN 'NULL'
          WHEN password_hash = '' THEN 'EMPTY'
          WHEN LENGTH(password_hash) < 20 THEN 'TOO SHORT (probably plain text)'
          ELSE 'HASHED (' || LENGTH(password_hash) || ' chars)'
        END as password_status,
        is_active,
        created_at
      FROM users
      ORDER BY id
      LIMIT 20
    `);

    console.log('\n👥 Users in database:');
    if (users.rows.length === 0) {
      console.log('❌ No users found in database!\n');
      console.log('You need to create users. Run: node scripts/createTestUsers.js');
    } else {
      console.table(users.rows);
    }

    // Count by user type
    const counts = await pool.query(`
      SELECT user_type, COUNT(*) as count
      FROM users
      GROUP BY user_type
    `);

    console.log('\n📊 User count by type:');
    console.table(counts.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
