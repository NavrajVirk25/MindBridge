require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    // Check all users and their types
    const result = await pool.query('SELECT id, email, user_type FROM users ORDER BY id');

    console.log('\n👥 All Users in Database:');
    console.log('━'.repeat(70));
    result.rows.forEach(user => {
      console.log(`ID: ${user.id} | Email: ${user.email} | Type: ${user.user_type}`);
    });

    // Check for peer supporter
    const peerCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      ['peer.supporter@student.kpu.ca']
    );

    if (peerCheck.rows.length > 0) {
      console.log('\n✅ Found peer supporter account:');
      console.log('━'.repeat(70));
      console.log(JSON.stringify(peerCheck.rows[0], null, 2));
    } else {
      console.log('\n❌ No account found with email: peer.supporter@student.kpu.ca');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
})();
