const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');

dotenv.config();

const listProcessingOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const orders = await Order.find({ orderStatus: 'processing' })
      .sort({ createdAt: -1 })
      .limit(10);

    if (orders.length === 0) {
      console.log('❌ No processing orders found');
      process.exit(0);
    }

    console.log(`📦 Found ${orders.length} processing orders:\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   Status: ${order.orderStatus}`);
      console.log(`   AWB: ${order.awbCode || 'N/A'}`);
      console.log(`   Shipmozo ID: ${order.shipmojoShipmentId || 'N/A'}`);
      console.log(`   Courier: ${order.courierName || 'N/A'}`);
      console.log(`   Created: ${order.createdAt}`);
      console.log(`   Order ID: ${order._id}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listProcessingOrders();
