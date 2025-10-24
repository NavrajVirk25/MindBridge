require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Create a new pool with explicit string conversion
const pool = new Pool({
  user: String(process.env.DB_USER),
  host: String(process.env.DB_HOST),
  database: String(process.env.DB_NAME),
  password: String(process.env.DB_PASSWORD),
  port: parseInt(process.env.DB_PORT),
});

async function updatePasswords() {
  console.log('Updating existing users to use hashed passwords...\n');

  // Map of users to their new passwords
  const userPasswords = {
    'alex.johnson@student.kpu.ca': 'Student123!',
    'peer.supporter@student.kpu.ca': 'Peer123!',
    'counselor@employee.kpu.ca': 'Counselor123!',
    'admin@admin.kpu.ca': 'Admin123!'
  };

  try {
    // Test connection first
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully\n');

    for (const [email, password] of Object.entries(userPasswords)) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user
        const result = await pool.query(
          'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email, user_type',
          [hashedPassword, email]
        );

        if (result.rows.length > 0) {
          const user = result.rows[0];
          console.log(`✅ Updated ${user.user_type}: ${email}`);
          console.log(`   Password: ${password}`);
        } else {
          console.log(`⚠️  User not found: ${email}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${email}:`, error.message);
      }
    }

    console.log('\n✅ Password update complete!');
    console.log('\nYou can now log in with these credentials:');
    console.log('━'.repeat(60));
    for (const [email, password] of Object.entries(userPasswords)) {
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('━'.repeat(60));
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Please check your .env file settings');
  } finally {
    await pool.end();
  }
}

updatePasswords();
