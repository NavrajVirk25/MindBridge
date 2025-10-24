require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: String(process.env.DB_USER),
  host: String(process.env.DB_HOST),
  database: String(process.env.DB_NAME),
  password: String(process.env.DB_PASSWORD),
  port: parseInt(process.env.DB_PORT),
});

async function testAllConnections() {
  console.log('Testing all database connections and tables...\n');
  console.log('='.repeat(60));

  try {
    // Test basic connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connection: WORKING\n');

    // Test all tables
    const tables = [
      'users',
      'resources',
      'mood_entries',
      'appointments',
      'crisis_alerts',
      'chat_rooms',
      'chat_messages',
      'peer_support_availability'
    ];

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        console.log(`✅ ${table.padEnd(30)} ${count} rows`);
      } catch (error) {
        console.log(`❌ ${table.padEnd(30)} ERROR: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Testing specific functionality:\n');

    // Test users
    const users = await pool.query('SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type');
    console.log('👥 Users by type:');
    users.rows.forEach(row => {
      console.log(`   ${row.user_type}: ${row.count}`);
    });

    // Test appointments
    console.log('\n📅 Appointments:');
    const appointments = await pool.query(`
      SELECT
        a.id,
        a.appointment_date,
        a.status,
        s.email as student_email,
        c.email as counselor_email
      FROM appointments a
      JOIN users s ON a.student_id = s.id
      JOIN users c ON a.counselor_id = c.id
      ORDER BY a.appointment_date DESC
      LIMIT 5
    `);

    if (appointments.rows.length === 0) {
      console.log('   ⚠️  No appointments found');
    } else {
      console.table(appointments.rows);
    }

    // Test mood entries
    const moods = await pool.query('SELECT COUNT(*) as count FROM mood_entries');
    console.log(`\n😊 Mood Entries: ${moods.rows[0].count}`);

    // Test crisis alerts
    const alerts = await pool.query('SELECT COUNT(*) as count, status FROM crisis_alerts GROUP BY status');
    console.log('\n🚨 Crisis Alerts:');
    if (alerts.rows.length === 0) {
      console.log('   No crisis alerts');
    } else {
      alerts.rows.forEach(row => {
        console.log(`   ${row.status}: ${row.count}`);
      });
    }

    // Test chat rooms
    const chats = await pool.query('SELECT COUNT(*) as count, status FROM chat_rooms GROUP BY status');
    console.log('\n💬 Chat Rooms:');
    if (chats.rows.length === 0) {
      console.log('   No chat rooms');
    } else {
      chats.rows.forEach(row => {
        console.log(`   ${row.status}: ${row.count}`);
      });
    }

    // Test resources
    const resources = await pool.query('SELECT COUNT(*) as count FROM resources WHERE is_active = true');
    console.log(`\n📚 Active Resources: ${resources.rows[0].count}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All database connections are working!\n');

    // Check for potential issues
    console.log('Checking for potential issues:\n');

    const studentCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'student'");
    const counselorCount = await pool.query("SELECT COUNT(*) FROM users WHERE user_type = 'counselor'");

    if (studentCount.rows[0].count === '0') {
      console.log('⚠️  WARNING: No students in database');
    }
    if (counselorCount.rows[0].count === '0') {
      console.log('⚠️  WARNING: No counselors in database');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testAllConnections();
