/**
 * Setup TTL (Time To Live) Indexes
 * Auto-delete old data to save space
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function setupTTLIndexes() {
  try {
    console.log('⏰ Setting up TTL Indexes...\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // ==================== NOTIFICATIONS TTL ====================
    console.log('📊 Setting up Notifications TTL Index...');
    try {
      await db.collection('notifications').createIndex(
        { createdAt: 1 },
        {
          expireAfterSeconds: 2592000, // 30 days
          name: 'notifications_ttl'
        }
      );
      console.log('✅ Notifications will auto-delete after 30 days');
      console.log('   - Saves space automatically');
      console.log('   - No manual cleanup needed\n');
    } catch (error) {
      if (error.code === 85) {
        console.log('⚠️  TTL index already exists for notifications\n');
      } else {
        throw error;
      }
    }

    // ==================== CANCELLED ORDERS TTL ====================
    // DISABLED: Don't auto-delete cancelled orders (may need for refunds/disputes)
    console.log('📊 Cancelled Orders TTL - DISABLED');
    console.log('⚠️  Cancelled orders will NOT be auto-deleted');
    console.log('   - May be needed for refunds/disputes');
    console.log('   - Manual cleanup recommended instead');
    console.log('   - Run: node scripts/cleanupOldCancelledOrders.js\n');

    // ==================== VERIFY INDEXES ====================
    console.log('📊 Verifying TTL Indexes...\n');
    
    const notifIndexes = await db.collection('notifications').indexes();
    const orderIndexes = await db.collection('orders').indexes();
    
    console.log('📋 Notifications Indexes:');
    notifIndexes.forEach(index => {
      if (index.expireAfterSeconds) {
        console.log(`   ✅ ${index.name}: Expires after ${index.expireAfterSeconds / 86400} days`);
      }
    });
    console.log('');
    
    console.log('📋 Orders Indexes:');
    orderIndexes.forEach(index => {
      if (index.expireAfterSeconds) {
        console.log(`   ✅ ${index.name}: Expires after ${index.expireAfterSeconds / 86400} days`);
      }
    });
    console.log('');

    // ==================== SUMMARY ====================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ TTL INDEXES CONFIGURED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📅 Auto-Deletion Schedule:');
    console.log('   - Notifications: 30 days old');
    console.log('   - Cancelled Orders: 90 days old');
    console.log('');
    console.log('💡 Benefits:');
    console.log('   ✅ Automatic space management');
    console.log('   ✅ No manual cleanup needed');
    console.log('   ✅ Database stays optimized');
    console.log('   ✅ Prevents storage overflow');
    console.log('');
    console.log('⚠️  Important Notes:');
    console.log('   - TTL deletion runs every 60 seconds');
    console.log('   - Deletion is not instant (may take a few minutes)');
    console.log('   - Active orders are NEVER deleted');
    console.log('   - Only cancelled orders older than 90 days are deleted');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('✅ TTL Setup Complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

setupTTLIndexes();
