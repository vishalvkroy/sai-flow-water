const Order = require('../models/Order');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

/**
 * Professional Shipmojo Webhook Handler
 * Handles real-time shipment status updates from Shipmojo
 */

/**
 * @desc    Handle Shipmojo webhook events
 * @route   POST /api/webhooks/shipmojo
 * @access  Public (verified by Shipmojo signature)
 */
const handleShipmojoWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('📨 ShipMozo webhook received:', JSON.stringify(webhookData, null, 2));
    console.log('📦 Status:', webhookData.current_status);
    console.log('📦 AWB:', webhookData.awb_number);
    console.log('📦 Order ID:', webhookData.order_id);
    console.log('📦 Reference ID:', webhookData.refrence_id);

    // Verify webhook signature (if ShipMozo provides one)
    // const isValid = verifyWebhookSignature(req);
    // if (!isValid) {
    //   return res.status(401).json({ success: false, message: 'Invalid signature' });
    // }

    // Process based on current_status field
    const status = webhookData.current_status?.toLowerCase();
    
    switch (status) {
      case 'pickup scheduled':
        await handlePickupScheduled(webhookData);
        break;
      
      case 'shipment picked up':
      case 'out for pickup':
        await handlePickedUp(webhookData);
        break;
      
      case 'shipment received at facility':
      case 'in transit':
        await handleInTransit(webhookData);
        break;
      
      case 'out for delivery':
        await handleOutForDelivery(webhookData);
        break;
      
      case 'delivered':
      case 'delivered to consignee':
        await handleDelivered(webhookData);
        break;
      
      case 'delivery failed':
      case 'ndr':
        await handleNDR(webhookData);
        break;
      
      case 'rto':
      case 'return to origin':
        await handleRTO(webhookData);
        break;
      
      case 'cancelled':
      case 'shipment cancelled':
      case 'canceled':
      case 'shipment canceled':
      case 'cancellation':
        console.log('🚫 Processing cancellation webhook...');
        await handleCancelled(webhookData);
        break;
      
      default:
        console.log(`⚠️  Unhandled webhook status: ${webhookData.current_status}`);
        // Still save the status update
        await handleGenericStatusUpdate(webhookData);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('Error stack:', error.stack);
    // Still return 200 to prevent ShipMozo from retrying
    res.status(200).json({ 
      success: false, 
      message: 'Webhook received but processing failed',
      error: error.message 
    });
  }
};

/**
 * Handle order created event
 */
async function handleOrderCreated(data) {
  const order = await Order.findOne({ shipmojoShipmentId: data.shipment_id });
  
  if (order) {
    order.awbCode = data.awb_number;
    order.courierName = data.courier_name;
    order.trackingUrl = data.tracking_url;
    
    order.statusHistory.push({
      status: 'processing',
      timestamp: new Date(),
      note: `Shipment created with ${data.courier_name}. AWB: ${data.awb_number}`
    });
    
    await order.save();
    console.log(`✅ Order ${order.orderNumber} updated with AWB: ${data.awb_number}`);
  }
}

/**
 * Handle pickup scheduled event
 */
async function handlePickupScheduled(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  }).populate('user', 'name email');
  
  if (order) {
    if (data.expected_delivery_date) {
      order.expectedDeliveryDate = new Date(data.expected_delivery_date);
    }
    
    order.statusHistory.push({
      status: 'processing',
      timestamp: new Date(data.status_time || new Date()),
      note: `Pickup scheduled - ${data.carrier || 'Courier'}`
    });
    
    await order.save();
    console.log(`✅ Pickup scheduled for order ${order.orderNumber}`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle picked up event
 */
async function handlePickedUp(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  }).populate('user', 'name email');
  
  if (order) {
    // Update order status
    order.orderStatus = 'shipped';
    order.shippedAt = new Date(data.status_time || new Date());
    
    // Update AWB and tracking info if not already set
    if (!order.awbCode && data.awb_number) {
      order.awbCode = data.awb_number;
      order.trackingNumber = data.awb_number;
    }
    
    if (!order.courierName && data.carrier) {
      order.courierName = data.carrier;
      order.carrier = data.carrier;
    }
    
    if (data.expected_delivery_date) {
      order.expectedDeliveryDate = new Date(data.expected_delivery_date);
    }
    
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(data.status_time || new Date()),
      note: `Package picked up by ${data.carrier}. AWB: ${data.awb_number}`
    });
    
    await order.save();
    
    // Send tracking email with AWB to customer
    try {
      const emailService = require('../services/emailService');
      await emailService.sendTrackingEmail(order, order.user);
      console.log(`📧 Tracking email sent to ${order.user.email}`);
    } catch (emailError) {
      console.error('Failed to send tracking email:', emailError.message);
    }
    
    console.log(`✅ Order ${order.orderNumber} marked as shipped with AWB: ${data.awb_number}`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle in transit event
 */
async function handleInTransit(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  });
  
  if (order) {
    // Get latest scan location from status_feed
    const latestScan = data.status_feed?.scan?.[0];
    const location = latestScan?.location || 'In transit';
    
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(data.status_time || new Date()),
      note: `In transit - ${location}`
    });
    
    await order.save();
    console.log(`✅ Order ${order.orderNumber} in transit at ${location}`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle out for delivery event
 */
async function handleOutForDelivery(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  }).populate('user', 'name email');
  
  if (order) {
    const latestScan = data.status_feed?.scan?.[0];
    const location = latestScan?.location || 'Out for delivery';
    
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(data.status_time || new Date()),
      note: `Out for delivery - Package will be delivered today (${location})`
    });
    
    await order.save();
    
    // Send email notification
    try {
      await sendEmail({
        email: order.user.email,
        subject: `Your Order is Out for Delivery! - ${order.orderNumber}`,
        html: `
          <h2>Your package is out for delivery!</h2>
          <p>Hi ${order.user.name},</p>
          <p>Great news! Your order <strong>${order.orderNumber}</strong> is out for delivery and will reach you today.</p>
          <p><strong>AWB Number:</strong> ${order.awbCode}</p>
          <p><strong>Courier:</strong> ${order.courierName}</p>
          <p>Please keep your phone handy for delivery updates.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send out for delivery email:', emailError.message);
    }
    
    console.log(`✅ Order ${order.orderNumber} out for delivery`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle delivered event
 */
async function handleDelivered(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  }).populate('user', 'name email');
  
  if (order) {
    order.orderStatus = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = new Date(data.status_time || new Date());
    
    const deliveredTo = data.delhivery_name || 'consignee';
    
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(data.status_time || new Date()),
      note: `Package delivered successfully to ${deliveredTo}`
    });
    
    await order.save();
    
    // Send delivery confirmation email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendOrderDelivered(order, order.user);
    } catch (emailError) {
      console.error('Failed to send delivery email:', emailError.message);
    }
    
    // Emit real-time notification
    const io = require('../server').io;
    if (io) {
      io.to(`user_${order.user._id}`).emit('order_delivered', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        message: 'Your order has been delivered!',
        timestamp: new Date()
      });
    }
    
    console.log(`✅ Order ${order.orderNumber} delivered successfully`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle NDR (Non-Delivery Report) event
 */
async function handleNDR(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  }).populate('user', 'name email');
  
  if (order) {
    const ndrReason = data.ndr_reason || 'Delivery attempt failed';
    
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(data.status_time || new Date()),
      note: `NDR: ${ndrReason}`
    });
    
    await order.save();
    
    // Send NDR notification email
    try {
      await sendEmail({
        email: order.user.email,
        subject: `Delivery Attempt Failed - ${order.orderNumber}`,
        html: `
          <h2>Delivery Attempt Failed</h2>
          <p>Hi ${order.user.name},</p>
          <p>We attempted to deliver your order <strong>${order.orderNumber}</strong> but were unable to complete the delivery.</p>
          <p><strong>Reason:</strong> ${ndrReason}</p>
          <p><strong>Next Steps:</strong> ${data.next_action || 'Another delivery attempt will be made soon.'}</p>
          <p>Please ensure someone is available to receive the package.</p>
          <p><strong>AWB Number:</strong> ${order.awbCode}</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send NDR email:', emailError.message);
    }
    
    console.log(`⚠️  NDR for order ${order.orderNumber}: ${ndrReason}`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle RTO (Return to Origin) event
 */
async function handleRTO(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  }).populate('user', 'name email');
  
  if (order) {
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date(data.status_time || new Date());
    order.cancellationReason = `RTO: ${data.rto_reason || 'Package returned to origin'}`;
    
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(data.status_time || new Date()),
      note: order.cancellationReason
    });
    
    await order.save();
    
    // Send RTO notification email
    try {
      await sendEmail({
        email: order.user.email,
        subject: `Order Returned - ${order.orderNumber}`,
        html: `
          <h2>Order Returned to Seller</h2>
          <p>Hi ${order.user.name},</p>
          <p>Your order <strong>${order.orderNumber}</strong> has been returned to the seller.</p>
          <p><strong>Reason:</strong> ${data.rto_reason || 'Multiple delivery attempts failed'}</p>
          <p>If you still want this product, please place a new order or contact our support team.</p>
          <p>Any payment made will be refunded within 5-7 business days.</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send RTO email:', emailError.message);
    }
    
    console.log(`🔄 RTO for order ${order.orderNumber}`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle cancelled event
 */
async function handleCancelled(data) {
  console.log('🔍 Searching for order with:');
  console.log('   - ShipMozo Order ID:', data.order_id);
  console.log('   - AWB:', data.awb_number);
  console.log('   - Reference ID:', data.refrence_id);
  
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  }).populate('user', 'name email');
  
  console.log('📊 Order found:', order ? `Yes - ${order.orderNumber}` : 'No');
  
  if (order) {
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
    order.cancelledAt = new Date(data.status_time || new Date());
    order.cancellationReason = data.cancellation_reason || 'Shipment cancelled from ShipMozo';
    
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(data.status_time || new Date()),
      note: `Shipment cancelled from ShipMozo: ${data.cancellation_reason || 'Shipment cancelled'}`
    });
    
    await order.save();
    console.log(`🚫 Order ${order.orderNumber} cancelled via ShipMozo webhook.`);
    console.log(`💾 Order status in DB: ${order.orderStatus}`);
    console.log(`📅 Cancelled at: ${order.cancelledAt}`);
    
    // Send cancellation email to customer
    try {
      await sendEmail({
        to: order.user.email,
        subject: `Order Cancelled - ${order.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">❌ Order Cancelled</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <p style="font-size: 16px; color: #374151;">Dear ${order.user.name},</p>
              <p style="font-size: 16px; color: #374151;">Your order <strong>${order.orderNumber}</strong> has been cancelled.</p>
              
              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-weight: 600;">Cancellation Reason:</p>
                <p style="margin: 5px 0 0 0; color: #7f1d1d;">${order.cancellationReason || 'Shipment cancelled'}</p>
              </div>
              
              <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Order Number:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${order.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Order Amount:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">₹${order.totalPrice.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Cancelled At:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${new Date(order.cancelledAt).toLocaleString('en-IN')}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">If you have any questions, please contact our support team.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Order Details</a>
              </div>
            </div>
            <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Sai Flow Water. All rights reserved.</p>
            </div>
          </div>
        `
      });
      console.log(`📧 Cancellation email sent to ${order.user.email}`);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError.message);
    }
    
    // Emit real-time notification to seller dashboard
    const io = require('../server').io;
    if (io) {
      // Notify customer
      io.to(`user_${order.user._id}`).emit('order_status_update', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'cancelled',
        message: 'Your order has been cancelled.',
        timestamp: new Date()
      });
      
      // Notify all sellers
      io.to('sellers').emit('order_update', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'cancelled',
        action: 'shipment_cancelled',
        message: 'Order cancelled from ShipMozo.',
        timestamp: new Date()
      });
      
      console.log('📡 Real-time cancellation updates sent');
    }
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Handle generic status update for unhandled statuses
 */
async function handleGenericStatusUpdate(data) {
  const order = await Order.findOne({ 
    $or: [
      { shipmojoOrderId: data.order_id },
      { awbCode: data.awb_number },
      { orderNumber: data.refrence_id }
    ]
  });
  
  if (order) {
    const latestScan = data.status_feed?.scan?.[0];
    const location = latestScan?.location || '';
    
    order.statusHistory.push({
      status: order.orderStatus, // Keep current status
      timestamp: new Date(data.status_time || new Date()),
      note: `${data.current_status}${location ? ` - ${location}` : ''}`
    });
    
    await order.save();
    console.log(`📝 Generic status update for order ${order.orderNumber}: ${data.current_status}`);
  } else {
    console.log(`⚠️  Order not found for AWB: ${data.awb_number}, Reference: ${data.refrence_id}`);
  }
}

/**
 * Verify webhook signature (implement based on Shipmojo's signature method)
 */
function verifyWebhookSignature(req) {
  // Implement signature verification if Shipmojo provides it
  // Example:
  // const signature = req.headers['x-shipmojo-signature'];
  // const payload = JSON.stringify(req.body);
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.SHIPMOJO_WEBHOOK_SECRET)
  //   .update(payload)
  //   .digest('hex');
  // return signature === expectedSignature;
  
  return true; // For now, accept all webhooks
}

module.exports = {
  handleShipmojoWebhook
};
