require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    console.log('\n🔍 Verifying Chat Tables...');
    console.log('='.repeat(70));

    // Check if all three tables exist
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('chat_rooms', 'chat_messages', 'peer_support_availability')
      ORDER BY table_name
    `);

    console.log(`\n✅ Found ${tables.rows.length}/3 chat tables:\n`);
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Check chat_rooms structure
    console.log('\n📋 chat_rooms table structure:');
    console.log('━'.repeat(70));
    const roomsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'chat_rooms'
      ORDER BY ordinal_position
    `);
    roomsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '* required' : ''}`);
    });

    // Check chat_messages structure
    console.log('\n📋 chat_messages table structure:');
    console.log('━'.repeat(70));
    const messagesColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'chat_messages'
      ORDER BY ordinal_position
    `);
    messagesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '* required' : ''}`);
    });

    // Check peer_support_availability structure
    console.log('\n📋 peer_support_availability table structure:');
    console.log('━'.repeat(70));
    const availColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'peer_support_availability'
      ORDER BY ordinal_position
    `);
    availColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '* required' : ''}`);
    });

    // Check peer supporter availability record
    console.log('\n👥 Peer Supporter Availability Records:');
    console.log('━'.repeat(70));
    const availability = await pool.query(`
      SELECT psa.*, u.email, u.first_name, u.last_name
      FROM peer_support_availability psa
      JOIN users u ON psa.user_id = u.id
    `);

    if (availability.rows.length > 0) {
      availability.rows.forEach(record => {
        console.log(`  ✓ ${record.first_name} ${record.last_name} (${record.email})`);
        console.log(`    - Online: ${record.is_online}`);
        console.log(`    - Max Chats: ${record.max_concurrent_chats}`);
        console.log(`    - Current Chats: ${record.current_active_chats}`);
      });
    } else {
      console.log('  ⚠️  No availability records found');
    }

    // Check indexes
    console.log('\n📊 Indexes Created:');
    console.log('━'.repeat(70));
    const indexes = await pool.query(`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('chat_rooms', 'chat_messages', 'peer_support_availability')
      ORDER BY tablename, indexname
    `);
    indexes.rows.forEach(idx => {
      console.log(`  ✓ ${idx.tablename}.${idx.indexname}`);
    });

    console.log('\n🎉 All tables verified successfully!\n');

    await pool.end();
  } catch (error) {
    console.error('\n❌ Verification failed!');
    console.error('Error:', error.message);
    await pool.end();
  }
})();
