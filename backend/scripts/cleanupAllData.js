/**
 * Clean up all test data from database
 * WARNING: This will delete ALL orders, bookings, and related data!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const ServiceBooking = require('../models/ServiceBooking');
const CallRequest = require('../models/CallRequest');
const Notification = require('../models/Notification');

async function cleanupAllData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let totalDeleted = 0;

    // Clean up Orders
    const orderCount = await Order.countDocuments();
    if (orderCount > 0) {
      const orderResult = await Order.deleteMany({});
      console.log(`✅ Deleted ${orderResult.deletedCount} orders`);
      totalDeleted += orderResult.deletedCount;
    } else {
      console.log('✅ No orders to delete');
    }

    // Clean up Service Bookings
    const bookingCount = await ServiceBooking.countDocuments();
    if (bookingCount > 0) {
      const bookingResult = await ServiceBooking.deleteMany({});
      console.log(`✅ Deleted ${bookingResult.deletedCount} service bookings`);
      totalDeleted += bookingResult.deletedCount;
    } else {
      console.log('✅ No service bookings to delete');
    }

    // Clean up Call Requests
    const callCount = await CallRequest.countDocuments();
    if (callCount > 0) {
      const callResult = await CallRequest.deleteMany({});
      console.log(`✅ Deleted ${callResult.deletedCount} call requests`);
      totalDeleted += callResult.deletedCount;
    } else {
      console.log('✅ No call requests to delete');
    }

    // Clean up Notifications
    const notifCount = await Notification.countDocuments();
    if (notifCount > 0) {
      const notifResult = await Notification.deleteMany({});
      console.log(`✅ Deleted ${notifResult.deletedCount} notifications`);
      totalDeleted += notifResult.deletedCount;
    } else {
      console.log('✅ No notifications to delete');
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`✅ CLEANUP COMPLETE! Total items deleted: ${totalDeleted}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Database is now clean and ready for fresh start!');

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
console.log('  ⚠️  WARNING: COMPLETE DATABASE CLEANUP');
console.log('═══════════════════════════════════════════════════════');
console.log('This will DELETE:');
console.log('  - All orders');
console.log('  - All service bookings');
console.log('  - All call requests');
console.log('  - All notifications');
console.log('\nThis action CANNOT be undone!');
console.log('═══════════════════════════════════════════════════════\n');

cleanupAllData();
