/**
 * Test Script: Check Order Cancellation Flow
 * This script helps diagnose why cancelled orders don't update in seller dashboard
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

async function testCancellation() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all orders with processing status
    console.log('📋 Finding processing orders...');
    const processingOrders = await Order.find({ orderStatus: 'processing' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    if (processingOrders.length === 0) {
      console.log('❌ No processing orders found');
    } else {
      console.log(`✅ Found ${processingOrders.length} processing orders:\n`);
      
      processingOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order: ${order.orderNumber}`);
        console.log(`   Status: ${order.orderStatus}`);
        console.log(`   Customer: ${order.user?.name || 'N/A'}`);
        console.log(`   AWB: ${order.awbCode || 'N/A'}`);
        console.log(`   ShipMozo Order ID: ${order.shipmojoOrderId || 'N/A'}`);
        console.log(`   Created: ${order.createdAt}`);
        console.log('');
      });
    }

    // Find all cancelled orders
    console.log('📋 Finding cancelled orders...');
    const cancelledOrders = await Order.find({ orderStatus: 'cancelled' })
      .populate('user', 'name email')
      .sort({ cancelledAt: -1 })
      .limit(5);

    if (cancelledOrders.length === 0) {
      console.log('❌ No cancelled orders found\n');
    } else {
      console.log(`✅ Found ${cancelledOrders.length} cancelled orders:\n`);
      
      cancelledOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order: ${order.orderNumber}`);
        console.log(`   Status: ${order.orderStatus}`);
        console.log(`   Customer: ${order.user?.name || 'N/A'}`);
        console.log(`   Cancelled At: ${order.cancelledAt || 'N/A'}`);
        console.log(`   Reason: ${order.cancellationReason || 'N/A'}`);
        console.log('');
      });
    }

    // Check recent status history
    console.log('📋 Checking recent status changes...');
    const recentOrders = await Order.find()
      .sort({ updatedAt: -1 })
      .limit(3);

    recentOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   Current Status: ${order.orderStatus}`);
      console.log(`   Status History (last 3):`);
      
      const history = order.statusHistory.slice(-3);
      history.forEach((h, i) => {
        console.log(`   ${i + 1}. ${h.status} - ${h.timestamp} - ${h.note || 'No note'}`);
      });
    });

    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testCancellation();
