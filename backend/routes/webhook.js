const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @desc    Shiprocket webhook for order tracking updates
// @route   POST /api/webhook/shiprocket
// @access  Public (but should be secured with signature verification in production)
router.post('/shiprocket', async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('📦 Shiprocket webhook received:', JSON.stringify(webhookData, null, 2));

    // Extract tracking information from Shiprocket webhook
    const {
      order_id,
      awb_code,
      current_status,
      shipment_status,
      shipment_track_activities,
      delivered_date,
      pickup_scheduled_date,
      pickup_date
    } = webhookData;

    // Find order by tracking number (AWB code)
    const order = await Order.findOne({ trackingNumber: awb_code }).populate('user', 'name email');

    if (!order) {
      console.log(`⚠️ Order not found for tracking number: ${awb_code}`);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Map Shiprocket status to our order status
    const statusMap = {
      'PICKUP SCHEDULED': 'confirmed',
      'PICKED UP': 'processing',
      'IN TRANSIT': 'shipped',
      'OUT FOR DELIVERY': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RTO': 'cancelled',
      'RTO DELIVERED': 'cancelled'
    };

    const newStatus = statusMap[shipment_status] || order.orderStatus;
    const oldStatus = order.orderStatus;

    // Update order status if changed
    if (newStatus !== oldStatus) {
      order.orderStatus = newStatus;
      
      if (newStatus === 'delivered' && delivered_date) {
        order.deliveredAt = new Date(delivered_date);
        order.isPaid = true;
        order.paidAt = new Date();
      }
      
      await order.save();
      console.log(`✅ Order ${order.orderNumber} status updated: ${oldStatus} → ${newStatus}`);
    }

    // Get Socket.IO instance
    const io = req.app.get('io');
    
    if (io) {
      // Prepare tracking update data
      const trackingUpdate = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.user._id,
        oldStatus,
        newStatus,
        trackingNumber: awb_code,
        shipmentStatus: shipment_status,
        currentStatus: current_status,
        activities: shipment_track_activities || [],
        deliveredDate: delivered_date,
        pickupDate: pickup_date,
        message: `Order #${order.orderNumber} - ${shipment_status}`,
        timestamp: new Date()
      };

      // Emit to customer
      io.to(`user_${order.user._id}`).emit('order_status_updated', trackingUpdate);
      io.to(`user_${order.user._id}`).emit('tracking_updated', trackingUpdate);

      // Emit to sellers
      io.to('sellers').emit('order_status_updated', {
        ...trackingUpdate,
        customerName: order.user.name
      });
      io.to('sellers').emit('tracking_updated', {
        ...trackingUpdate,
        customerName: order.user.name
      });

      console.log(`✅ Real-time tracking update sent for order: ${order.orderNumber}`);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Shiprocket webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// @desc    Generic order status update webhook (for other services)
// @route   POST /api/webhook/order-status
// @access  Public (should be secured in production)
router.post('/order-status', async (req, res) => {
  try {
    const { orderId, status, trackingNumber, carrier, location } = req.body;

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (carrier) {
      order.carrier = carrier;
    }

    await order.save();

    // Emit real-time updates
    const io = req.app.get('io');
    if (io) {
      const updateData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: order.user._id,
        oldStatus,
        newStatus: status,
        trackingNumber,
        carrier,
        location,
        message: `Order #${order.orderNumber} status updated to ${status}`,
        timestamp: new Date()
      };

      // Notify customer
      io.to(`user_${order.user._id}`).emit('order_status_updated', updateData);

      // Notify sellers
      io.to('sellers').emit('order_status_updated', {
        ...updateData,
        customerName: order.user.name
      });

      console.log(`✅ Webhook update processed: Order ${order.orderNumber} - ${oldStatus} → ${status}`);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

module.exports = router;
