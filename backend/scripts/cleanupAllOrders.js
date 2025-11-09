/**
 * Clean up all orders from database
 * WARNING: This will delete ALL orders permanently!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');

async function cleanupAllOrders() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count orders before deletion
    const orderCount = await Order.countDocuments();
    console.log(`📊 Found ${orderCount} orders in database\n`);

    if (orderCount === 0) {
      console.log('✅ No orders to delete!');
      return;
    }

    // Show some order details before deletion
    const orders = await Order.find().limit(5).select('orderNumber orderStatus totalPrice createdAt');
    console.log('📋 Sample orders (showing first 5):');
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.orderStatus} - ₹${order.totalPrice}`);
    });
    console.log('');

    // Delete all orders
    console.log('🗑️  Deleting all orders...');
    const result = await Order.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} orders!`);
    console.log('');
    console.log('📊 Database is now clean!');
    console.log('   - All orders removed');
    console.log('   - Ready for fresh start');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
console.log('═══════════════════════════════════════════════════════');
console.log('  ⚠️  WARNING: ORDER CLEANUP SCRIPT');
console.log('═══════════════════════════════════════════════════════');
console.log('This will DELETE ALL ORDERS from the database!');
console.log('This action CANNOT be undone!');
console.log('═══════════════════════════════════════════════════════\n');

cleanupAllOrders();
