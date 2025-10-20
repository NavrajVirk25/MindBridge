// Migration Runner Script
// Executes SQL migration files against the PostgreSQL database

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runMigration(filename) {
  const filePath = path.join(__dirname, filename);

  console.log(`\n📋 Running migration: ${filename}`);
  console.log('━'.repeat(50));

  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the SQL
    await pool.query(sql);

    console.log(`✅ Migration ${filename} completed successfully!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Migration ${filename} failed!`);
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    return false;
  }
}

async function main() {
  console.log('\n🚀 MindBridge Database Migration System');
  console.log('=' .repeat(50));

  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful\n');

    // Get migration file from command line or use default
    const migrationFile = process.argv[2] || '001_create_chat_tables.sql';

    // Run the migration
    const success = await runMigration(migrationFile);

    if (success) {
      console.log('🎉 All migrations completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  Migration failed. Please check the errors above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nPlease check your database credentials in .env file');
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run the migration
main();
