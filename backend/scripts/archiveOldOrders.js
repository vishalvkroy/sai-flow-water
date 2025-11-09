/**
 * Archive Old Orders Script
 * Moves old delivered orders to archive collection
 * Frees up space in main orders collection
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

// Archive collection schema (same as Order but separate collection)
const archiveSchema = new mongoose.Schema({}, { strict: false, collection: 'orders_archive' });
const OrderArchive = mongoose.model('OrderArchive', archiveSchema);

async function archiveOldOrders() {
  try {
    console.log('📦 Starting Order Archiving Process...\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find old delivered orders (> 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    
    console.log(`📅 Archiving orders delivered before: ${sixMonthsAgo.toLocaleDateString()}\n`);
    
    const oldOrders = await Order.find({
      orderStatus: 'delivered',
      deliveredAt: { $lt: sixMonthsAgo }
    }).lean();
    
    if (oldOrders.length === 0) {
      console.log('✅ No old orders to archive!');
      return;
    }
    
    console.log(`📦 Found ${oldOrders.length} orders to archive\n`);
    
    // Show sample orders
    console.log('📋 Sample orders being archived:');
    oldOrders.slice(0, 5).forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - Delivered: ${new Date(order.deliveredAt).toLocaleDateString()}`);
    });
    if (oldOrders.length > 5) {
      console.log(`   ... and ${oldOrders.length - 5} more`);
    }
    console.log('');
    
    // Calculate space to be freed
    const avgOrderSize = 15; // KB (estimated)
    const spaceSaved = (oldOrders.length * avgOrderSize / 1024).toFixed(2);
    console.log(`💾 Estimated space to be freed: ${spaceSaved} MB\n`);
    
    // Archive process
    console.log('🔄 Archiving orders...');
    let archived = 0;
    let failed = 0;
    
    for (const order of oldOrders) {
      try {
        // Add archive metadata
        const archiveData = {
          ...order,
          archivedAt: new Date(),
          archivedReason: 'Auto-archived after 6 months'
        };
        
        // Insert into archive collection
        await OrderArchive.create(archiveData);
        
        // Delete from main collection
        await Order.deleteOne({ _id: order._id });
        
        archived++;
        
        // Progress indicator
        if (archived % 10 === 0) {
          process.stdout.write(`\r   Archived: ${archived}/${oldOrders.length}`);
        }
      } catch (error) {
        console.error(`\n❌ Failed to archive order ${order.orderNumber}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n\n✅ Archiving Complete!`);
    console.log(`   - Successfully archived: ${archived} orders`);
    console.log(`   - Failed: ${failed} orders`);
    console.log(`   - Space freed: ~${spaceSaved} MB\n`);
    
    // Verify archive
    const archiveCount = await OrderArchive.countDocuments();
    console.log(`📊 Archive Collection Stats:`);
    console.log(`   - Total archived orders: ${archiveCount}`);
    console.log(`   - Latest archive: ${new Date().toLocaleString()}\n`);
    
    // Show remaining orders
    const remainingOrders = await Order.countDocuments();
    console.log(`📦 Main Orders Collection:`);
    console.log(`   - Active orders: ${remainingOrders}\n`);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('💡 NOTES:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('1. Archived orders are stored in "orders_archive" collection');
    console.log('2. You can query archived orders if needed');
    console.log('3. Archived orders are not shown in dashboard by default');
    console.log('4. Run this script monthly to keep database optimized');
    console.log('5. To restore an order, move it back from archive collection');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('✅ Archive Process Complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Query archived orders function (for reference)
async function queryArchivedOrders(orderNumber) {
  await mongoose.connect(process.env.MONGODB_URI);
  const archivedOrder = await OrderArchive.findOne({ orderNumber });
  await mongoose.connection.close();
  return archivedOrder;
}

// Run archiving
archiveOldOrders();

// Export for use in other scripts
module.exports = { archiveOldOrders, queryArchivedOrders };
