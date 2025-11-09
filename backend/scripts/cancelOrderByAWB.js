const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');

dotenv.config();

const cancelOrderByAWB = async (awbCode) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const order = await Order.findOne({ awbCode: awbCode });

    if (!order) {
      console.log(`❌ No order found with AWB: ${awbCode}`);
      process.exit(1);
    }

    console.log(`📦 Found order: ${order.orderNumber}`);
    console.log(`   Current status: ${order.orderStatus}`);
    console.log(`   AWB: ${order.awbCode}`);

    // Clear Shipmozo shipment data
    order.shipmojoShipmentId = null;
    order.shipmojoOrderId = null;
    order.awbCode = null;
    order.trackingNumber = null;
    order.courierName = null;
    order.carrier = null;
    order.courierId = null;
    order.trackingUrl = null;
    order.labelUrl = null;
    order.manifestUrl = null;
    order.pickupScheduledDate = null;
    order.expectedDeliveryDate = null;
    order.shippedAt = null;

    // Set order status to cancelled
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = 'Shipment cancelled from ShipMozo (manual sync)';

    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Shipment cancelled from ShipMozo (manual sync)'
    });

    await order.save();

    console.log(`✅ Order ${order.orderNumber} cancelled successfully!`);
    console.log(`   New status: ${order.orderStatus}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Get AWB from command line argument
const awbCode = process.argv[2];

if (!awbCode) {
  console.log('Usage: node cancelOrderByAWB.js <AWB_CODE>');
  console.log('Example: node cancelOrderByAWB.js 365001727685');
  process.exit(1);
}

cancelOrderByAWB(awbCode);
