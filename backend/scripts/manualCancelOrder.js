/**
 * Manually cancel a specific order
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

async function manualCancelOrder() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // The order you want to cancel
    const orderNumber = 'ARROH-1762693657410-595';
    const awb = '365002901442';

    console.log(`📋 Finding order: ${orderNumber}`);
    const order = await Order.findOne({ orderNumber }).populate('user', 'name email');

    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log(`✅ Found order: ${order.orderNumber}`);
    console.log(`   Current Status: ${order.orderStatus}`);
    console.log(`   Customer: ${order.user?.name}`);
    console.log(`   AWB: ${order.awbCode}\n`);

    // Update to cancelled
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = 'Cancelled in ShipMozo (manual sync)';
    
    // Clear shipping data
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

    // Add to status history
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Shipment cancelled from ShipMozo (manual sync)'
    });

    await order.save();
    console.log('✅ Order updated to cancelled\n');

    // Send email
    if (order.user && order.user.email) {
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
                  <p style="margin: 5px 0 0 0; color: #7f1d1d;">${order.cancellationReason}</p>
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
              </div>
              <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Sai Flow Water. All rights reserved.</p>
              </div>
            </div>
          `
        });
        console.log(`📧 Cancellation email sent to ${order.user.email}\n`);
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError.message);
      }
    }

    console.log('✅ Done! Refresh your dashboard to see the update.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

manualCancelOrder();
