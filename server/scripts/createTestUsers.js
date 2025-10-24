const bcrypt = require('bcrypt');
const pool = require('../db');

async function createTestUsers() {
  console.log('Creating test users for MindBridge...\n');

  const users = [
    // Students
    { email: 'john.smith@student.kpu.ca', password: 'Student123!', firstName: 'John', lastName: 'Smith', userType: 'student' },
    { email: 'sarah.johnson@student.kpu.ca', password: 'Student123!', firstName: 'Sarah', lastName: 'Johnson', userType: 'student' },
    { email: 'mike.chen@student.kpu.ca', password: 'Student123!', firstName: 'Mike', lastName: 'Chen', userType: 'student' },

    // Peer Supporters
    { email: 'alex.peer@student.kpu.ca', password: 'Peer123!', firstName: 'Alex', lastName: 'Peer', userType: 'student' },
    { email: 'emma.support@student.kpu.ca', password: 'Peer123!', firstName: 'Emma', lastName: 'Support', userType: 'student' },

    // Counselors
    { email: 'sarah.mitchell@employee.kpu.ca', password: 'Counselor123!', firstName: 'Sarah', lastName: 'Mitchell', userType: 'counselor' },
    { email: 'james.wilson@employee.kpu.ca', password: 'Counselor123!', firstName: 'James', lastName: 'Wilson', userType: 'counselor' },

    // Admins
    { email: 'admin@admin.kpu.ca', password: 'Admin123!', firstName: 'Admin', lastName: 'User', userType: 'admin' },
    { email: 'superadmin@admin.kpu.ca', password: 'SuperAdmin123!', firstName: 'Super', lastName: 'Admin', userType: 'admin' }
  ];

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`⏭️  User ${user.email} already exists, skipping...`);
        skipped++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, user_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user.email, hashedPassword, user.firstName, user.lastName, user.userType]
      );

      console.log(`✅ Created ${user.userType}: ${user.firstName} ${user.lastName} (${user.email})`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Summary:');
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(50));

  if (created > 0) {
    console.log('\n📋 Test credentials available in TEST_CREDENTIALS.md');
  }

  await pool.end();
  process.exit(0);
}

createTestUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
