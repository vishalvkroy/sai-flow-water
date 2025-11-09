/**
 * Remove TTL Index for Cancelled Orders
 * Cancelled orders should NOT be auto-deleted
 * They may be needed for refunds, disputes, or records
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function removeCancelledOrdersTTL() {
  try {
    console.log('🔧 Removing Cancelled Orders TTL Index...\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Check if TTL index exists
    const indexes = await db.collection('orders').indexes();
    const ttlIndex = indexes.find(idx => idx.name === 'cancelled_orders_ttl');

    if (ttlIndex) {
      console.log('📊 Found TTL index for cancelled orders');
      console.log('🗑️  Removing TTL index...\n');
      
      await db.collection('orders').dropIndex('cancelled_orders_ttl');
      
      console.log('✅ TTL index removed successfully!');
      console.log('');
      console.log('🔒 Cancelled orders will NO LONGER be auto-deleted');
      console.log('   - Orders are now protected');
      console.log('   - Manual cleanup only');
      console.log('   - Needed for refunds/disputes\n');
    } else {
      console.log('✅ No TTL index found for cancelled orders');
      console.log('   - Orders are already protected');
      console.log('   - No action needed\n');
    }

    // Verify removal
    const updatedIndexes = await db.collection('orders').indexes();
    const stillExists = updatedIndexes.find(idx => idx.name === 'cancelled_orders_ttl');

    if (stillExists) {
      console.log('⚠️  WARNING: TTL index still exists!');
    } else {
      console.log('✅ Verification: TTL index successfully removed\n');
    }

    // Show remaining indexes
    console.log('📋 Current Orders Indexes:');
    updatedIndexes.forEach(index => {
      const ttlInfo = index.expireAfterSeconds ? ` (TTL: ${index.expireAfterSeconds / 86400} days)` : '';
      console.log(`   - ${index.name}${ttlInfo}`);
    });
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ CANCELLED ORDERS ARE NOW PROTECTED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('🔒 Protected Data:');
    console.log('   ✅ All user accounts');
    console.log('   ✅ All products');
    console.log('   ✅ All active orders');
    console.log('   ✅ All cancelled orders (NEW!)');
    console.log('   ✅ All payment records');
    console.log('   ✅ All service bookings');
    console.log('');
    console.log('🗑️  Auto-Deleted Data:');
    console.log('   ❌ Notifications (30 days old)');
    console.log('   ❌ Expired sessions');
    console.log('');
    console.log('📦 Archived Data (Not Deleted):');
    console.log('   📦 Old delivered orders (6+ months)');
    console.log('   📦 Still accessible in archive');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

removeCancelledOrdersTTL();
