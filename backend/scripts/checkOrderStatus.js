const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');

dotenv.config();

const checkOrderStatus = async (orderNumber) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const order = await Order.findOne({ orderNumber: orderNumber });

    if (!order) {
      console.log(`❌ Order not found: ${orderNumber}`);
      process.exit(1);
    }

    console.log(`📦 Order: ${order.orderNumber}`);
    console.log(`   Status: ${order.orderStatus}`);
    console.log(`   AWB: ${order.awbCode || 'N/A'}`);
    console.log(`   Courier: ${order.courierName || 'N/A'}`);
    console.log(`   Delivered: ${order.isDelivered ? 'Yes' : 'No'}`);
    console.log(`   Delivered At: ${order.deliveredAt || 'N/A'}`);
    console.log('\n📋 Status History:');
    
    order.statusHistory.slice(-5).forEach((history, index) => {
      console.log(`   ${index + 1}. ${history.status} - ${history.note}`);
      console.log(`      Time: ${history.timestamp}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const orderNumber = process.argv[2];

if (!orderNumber) {
  console.log('Usage: node checkOrderStatus.js <ORDER_NUMBER>');
  console.log('Example: node checkOrderStatus.js ARROH-1762677546364-559');
  process.exit(1);
}

checkOrderStatus(orderNumber);
