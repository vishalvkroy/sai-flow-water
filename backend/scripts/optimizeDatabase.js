/**
 * Database Optimization Script
 * Run this to optimize your existing database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

async function optimizeDatabase() {
  try {
    console.log('🔧 Starting Database Optimization...\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let totalSaved = 0;

    // ==================== STEP 1: Optimize Status History ====================
    console.log('📊 Step 1: Optimizing Status History...');
    const orders = await Order.find();
    let statusHistoryOptimized = 0;
    
    for (const order of orders) {
      if (order.statusHistory && order.statusHistory.length > 10) {
        order.statusHistory = order.statusHistory.slice(-10);
        await order.save();
        statusHistoryOptimized++;
      }
    }
    
    console.log(`✅ Optimized ${statusHistoryOptimized} orders (limited status history to 10 entries)`);
    const statusHistorySaved = statusHistoryOptimized * 5; // Assume 5KB per extra entry
    totalSaved += statusHistorySaved;
    console.log(`💾 Estimated space saved: ${statusHistorySaved} KB\n`);

    // ==================== STEP 2: Delete Old Notifications ====================
    console.log('📊 Step 2: Cleaning Old Notifications...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const notifResult = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    console.log(`✅ Deleted ${notifResult.deletedCount} old notifications (> 30 days)`);
    const notifSaved = notifResult.deletedCount * 2; // Assume 2KB per notification
    totalSaved += notifSaved;
    console.log(`💾 Estimated space saved: ${notifSaved} KB\n`);

    // ==================== STEP 3: Archive Old Delivered Orders ====================
    console.log('📊 Step 3: Identifying Old Delivered Orders...');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    
    const oldDeliveredOrders = await Order.find({
      orderStatus: 'delivered',
      deliveredAt: { $lt: sixMonthsAgo }
    });
    
    console.log(`📦 Found ${oldDeliveredOrders.length} old delivered orders (> 6 months)`);
    console.log(`💡 Recommendation: Archive these orders to free up space`);
    console.log(`   Run: node scripts/archiveOldOrders.js\n`);

    // ==================== STEP 4: Delete Very Old Cancelled Orders ====================
    console.log('📊 Step 4: Cleaning Very Old Cancelled Orders...');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldCancelledOrders = await Order.find({
      orderStatus: 'cancelled',
      cancelledAt: { $lt: ninetyDaysAgo }
    });
    
    if (oldCancelledOrders.length > 0) {
      console.log(`🗑️  Found ${oldCancelledOrders.length} old cancelled orders (> 90 days)`);
      console.log(`   These can be safely deleted`);
      
      // Uncomment to actually delete
      // const deleteResult = await Order.deleteMany({
      //   orderStatus: 'cancelled',
      //   cancelledAt: { $lt: ninetyDaysAgo }
      // });
      // console.log(`✅ Deleted ${deleteResult.deletedCount} old cancelled orders`);
    } else {
      console.log(`✅ No old cancelled orders to delete\n`);
    }

    // ==================== STEP 5: Optimize Indexes ====================
    console.log('📊 Step 5: Checking Indexes...');
    const indexes = await Order.collection.getIndexes();
    console.log(`📋 Current indexes: ${Object.keys(indexes).length}`);
    
    // List all indexes
    for (const [name, index] of Object.entries(indexes)) {
      console.log(`   - ${name}`);
    }
    console.log('');

    // ==================== STEP 6: Database Statistics ====================
    console.log('📊 Step 6: Database Statistics...');
    const stats = await mongoose.connection.db.stats();
    
    console.log(`📈 Database Stats:`);
    console.log(`   - Total Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Collections: ${stats.collections}`);
    console.log(`   - Objects: ${stats.objects}`);
    console.log('');

    // Get collection stats
    const orderStats = await Order.collection.stats();
    console.log(`📦 Orders Collection:`);
    console.log(`   - Documents: ${orderStats.count}`);
    console.log(`   - Size: ${(orderStats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Avg Document Size: ${(orderStats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log('');

    // ==================== SUMMARY ====================
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 OPTIMIZATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Status History Optimized: ${statusHistoryOptimized} orders`);
    console.log(`✅ Old Notifications Deleted: ${notifResult.deletedCount}`);
    console.log(`📦 Old Orders to Archive: ${oldDeliveredOrders.length}`);
    console.log(`💾 Total Space Saved: ~${totalSaved} KB`);
    console.log('═══════════════════════════════════════════════════════\n');

    // ==================== RECOMMENDATIONS ====================
    console.log('💡 RECOMMENDATIONS:');
    console.log('');
    console.log('1. ✅ Status history optimized automatically');
    console.log('2. ✅ Old notifications cleaned up');
    console.log('');
    
    if (oldDeliveredOrders.length > 0) {
      console.log(`3. 📦 Archive ${oldDeliveredOrders.length} old delivered orders:`);
      console.log('   Run: node scripts/archiveOldOrders.js');
      console.log('');
    }
    
    if (oldCancelledOrders.length > 0) {
      console.log(`4. 🗑️  Delete ${oldCancelledOrders.length} old cancelled orders:`);
      console.log('   Uncomment delete code in this script and run again');
      console.log('');
    }
    
    console.log('5. 📅 Schedule this script to run monthly:');
    console.log('   Add to cron job or task scheduler');
    console.log('');
    
    console.log('6. 📊 Monitor database size:');
    console.log('   Current: ' + (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB / 512 MB');
    const percentUsed = ((stats.dataSize / 1024 / 1024) / 512 * 100).toFixed(1);
    console.log(`   Usage: ${percentUsed}%`);
    
    if (percentUsed > 80) {
      console.log('   ⚠️  WARNING: Database is over 80% full!');
      console.log('   Consider archiving old data immediately');
    } else if (percentUsed > 60) {
      console.log('   ⚠️  Database is over 60% full');
      console.log('   Plan to archive data soon');
    } else {
      console.log('   ✅ Database usage is healthy');
    }
    
    console.log('\n✅ Optimization Complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

optimizeDatabase();
