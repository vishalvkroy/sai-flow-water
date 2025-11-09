const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      try {
        console.log('📧 Creating email transporter...');
        this.transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        console.log('✅ Email transporter created');
      } catch (error) {
        console.error('❌ Failed to create transporter:', error);
        throw error;
      }
    }
    return this.transporter;
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order, customer) {
    try {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Flow Water'}" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `Order Confirmed - #${order.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .total { font-size: 1.2em; font-weight: bold; color: #667eea; margin-top: 15px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Order Confirmed!</h1>
                <p>Thank you for your order, ${customer.name}!</p>
              </div>
              <div class="content">
                <p>Hi ${customer.name},</p>
                <p>Great news! Your order has been confirmed and is being prepared for shipment.</p>
                
                <div class="order-details">
                  <h2>Order Details</h2>
                  <div class="item">
                    <span><strong>Order Number:</strong></span>
                    <span>#${order.orderNumber}</span>
                  </div>
                  <div class="item">
                    <span><strong>Order Date:</strong></span>
                    <span>${new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div class="item">
                    <span><strong>Payment Method:</strong></span>
                    <span>${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Prepaid'}</span>
                  </div>
                  
                  <h3 style="margin-top: 20px;">Items:</h3>
                  ${order.orderItems.map(item => `
                    <div class="item">
                      <span>${item.name} x ${item.quantity}</span>
                      <span>₹${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  `).join('')}
                  
                  <div class="total">
                    <div class="item">
                      <span>Total Amount:</span>
                      <span>₹${(order.totalAmount || order.totalPrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <strong>📦 What's Next?</strong>
                  <p style="margin: 10px 0 0 0;">Your order will be dispatched soon. You'll receive another email with tracking details once it's shipped.</p>
                </div>
                
                <div class="footer">
                  <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
                  <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Sai Flow Water'}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent to ${customer.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order confirmation email:', error.message);
      return false;
    }
  }

  /**
   * Send shipment dispatch email
   */
  async sendShipmentDispatch(order, customer) {
    try {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Flow Water'}" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `Order Dispatched - #${order.orderNumber} 📦`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .tracking-box { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .tracking-number { font-size: 1.5em; font-weight: bold; color: #1e40af; margin: 10px 0; }
              .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚚 Your Order is On Its Way!</h1>
                <p>Order #${order.orderNumber} has been dispatched</p>
              </div>
              <div class="content">
                <p>Hi ${customer.name},</p>
                <p>Exciting news! Your order has been dispatched and is on its way to you.</p>
                
                <div class="tracking-box">
                  <h3>📦 Tracking Information</h3>
                  <div><strong>Courier:</strong> ${order.courierName || 'N/A'}</div>
                  <div class="tracking-number">AWB: ${order.awbCode || 'N/A'}</div>
                  ${order.trackingNumber ? `
                    <a href="https://shipmojo.com/track/${order.trackingNumber}" class="button">
                      🔍 Track Your Order
                    </a>
                  ` : ''}
                  ${order.expectedDeliveryDate ? `
                    <div style="margin-top: 15px; color: #059669;">
                      <strong>Expected Delivery:</strong> ${new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN')}
                    </div>
                  ` : ''}
                </div>
                
                <div class="order-details">
                  <h3>Delivery Address:</h3>
                  <p>
                    ${order.shippingAddress.fullName}<br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br>
                    Phone: ${order.shippingAddress.phone}
                  </p>
                </div>
                
                <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                  <strong>💡 Pro Tip:</strong>
                  <p style="margin: 10px 0 0 0;">Keep your phone handy! The delivery person will call you before delivery.</p>
                </div>
                
                <div class="footer">
                  <p>For any queries, contact us at ${process.env.EMAIL_USER}</p>
                  <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Sai Flow Water'}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Shipment dispatch email sent to ${customer.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send shipment dispatch email:', error.message);
      return false;
    }
  }

  /**
   * Send order delivered email
   */
  async sendOrderDelivered(order, customer) {
    try {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Flow Water'}" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `Order Delivered - #${order.orderNumber} ✅`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-box { background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #10b981; }
              .button { display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Order Delivered Successfully!</h1>
                <p>Thank you for shopping with us!</p>
              </div>
              <div class="content">
                <p>Hi ${customer.name},</p>
                
                <div class="success-box">
                  <h2 style="color: #10b981; margin: 0;">✅ Delivered!</h2>
                  <p style="margin: 10px 0 0 0;">Your order #${order.orderNumber} has been successfully delivered.</p>
                </div>
                
                <p>We hope you love your purchase! If you have any questions or concerns about your order, please don't hesitate to reach out to us.</p>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                  <strong>💬 We'd Love Your Feedback!</strong>
                  <p style="margin: 10px 0 0 0;">Your opinion matters to us. Share your experience and help us serve you better.</p>
                </div>
                
                <div class="footer">
                  <p>Thank you for choosing ${process.env.COMPANY_NAME || 'Sai Flow Water'}!</p>
                  <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Sai Flow Water'}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Order delivered email sent to ${customer.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send order delivered email:', error.message);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user, resetUrl) {
    try {
      console.log('📧 Preparing password reset email...');
      console.log('To:', user.email);
      console.log('From:', process.env.EMAIL_USER);
      console.log('Reset URL:', resetUrl);
      
      if (!user || !user.email) {
        throw new Error('Invalid user object or missing email');
      }
      
      if (!resetUrl) {
        throw new Error('Reset URL is required');
      }
      
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Flow Water'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request 🔐',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 14px 32px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
              .button:hover { background: #d97706; }
              .warning-box { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.9em; }
              .code-box { background: white; padding: 15px; border-radius: 8px; border: 2px dashed #f59e0b; text-align: center; margin: 20px 0; }
              .reset-code { font-size: 1.5em; font-weight: bold; color: #f59e0b; letter-spacing: 3px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
                <p>We received a request to reset your password</p>
              </div>
              <div class="content">
                <p>Hi ${user.name},</p>
                <p>You requested to reset your password for your ${process.env.COMPANY_NAME || 'Sai Flow Water'} account.</p>
                
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">
                    🔓 Reset Password
                  </a>
                </p>
                
                <p style="text-align: center; color: #6b7280; font-size: 0.9em;">
                  Or copy and paste this link in your browser:<br>
                  <code style="background: #f3f4f6; padding: 8px; border-radius: 4px; display: inline-block; margin-top: 8px; word-break: break-all;">
                    ${resetUrl}
                  </code>
                </p>
                
                <div class="warning-box">
                  <strong>⚠️ Important:</strong>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>This link will expire in <strong>10 minutes</strong></li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Your password won't change until you create a new one</li>
                  </ul>
                </div>
                
                <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                  <strong>🔒 Security Tip:</strong>
                  <p style="margin: 10px 0 0 0;">Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.</p>
                </div>
                
                <div class="footer">
                  <p>If you didn't request a password reset, please contact us immediately at ${process.env.EMAIL_USER}</p>
                  <p>© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Sai Flow Water'}. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      console.log('📤 Sending email...');
      const transporter = this.getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${user.email}`);
      console.log('Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', error);
      throw error; // Re-throw to be caught by controller
    }
  }

  /**
   * Send service booking confirmation email
   */
  async sendServiceBookingConfirmation(booking, user) {
    try {
      const { getBookingConfirmationEmail } = require('../utils/emailTemplates');
      const emailContent = getBookingConfirmationEmail(booking, user);

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Enterprises'}" <${process.env.EMAIL_USER}>`,
        to: booking.address.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      };

      console.log(`📤 Sending service booking confirmation to ${booking.address.email}...`);
      const transporter = this.getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Service booking confirmation sent - Booking: ${booking.bookingNumber}`);
      console.log('Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send service booking confirmation');
      console.error('Error:', error.message);
      // Don't throw - email failure shouldn't break the booking process
      return false;
    }
  }

  /**
   * Send technician assigned email
   */
  async sendTechnicianAssignedEmail(booking, technician) {
    try {
      const { getTechnicianAssignedEmail } = require('../utils/emailTemplates');
      const emailContent = getTechnicianAssignedEmail(booking, technician);

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Enterprises'}" <${process.env.EMAIL_USER}>`,
        to: booking.address.email,
        subject: emailContent.subject,
        html: emailContent.html
      };

      console.log(`📤 Sending technician assignment email to ${booking.address.email}...`);
      const transporter = this.getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Technician assignment email sent - Booking: ${booking.bookingNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send technician assignment email');
      console.error('Error:', error.message);
      return false;
    }
  }

  /**
   * Send service completed email
   */
  async sendServiceCompletedEmail(booking) {
    try {
      const { getServiceCompletedEmail } = require('../utils/emailTemplates');
      const emailContent = getServiceCompletedEmail(booking);

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Enterprises'}" <${process.env.EMAIL_USER}>`,
        to: booking.address.email,
        subject: emailContent.subject,
        html: emailContent.html
      };

      console.log(`📤 Sending service completion email to ${booking.address.email}...`);
      const transporter = this.getTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Service completion email sent - Booking: ${booking.bookingNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send service completion email');
      console.error('Error:', error.message);
      return false;
    }
  }

  /**
   * Send tracking ID email when AWB is generated
   */
  async sendTrackingEmail(order, customer) {
    try {
      const trackingUrl = order.trackingUrl || `https://www.shipmozo.com/track/${order.awbCode}`;
      
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Sai Flow Water'}" <${process.env.EMAIL_USER}>`,
        to: customer.email,
        subject: `🚚 Your Order is Shipped! Track Your Package - #${order.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 10px 0 0 0; opacity: 0.9; }
              .content { background: #f9fafb; padding: 30px; }
              .tracking-box { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981; }
              .tracking-number { font-size: 24px; font-weight: bold; color: #10b981; margin: 15px 0; letter-spacing: 1px; }
              .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .info-label { color: #6b7280; font-weight: 500; }
              .info-value { color: #111827; font-weight: 600; }
              .track-button { display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: 600; font-size: 16px; }
              .track-button:hover { background: #059669; }
              .timeline { margin: 30px 0; }
              .timeline-item { display: flex; gap: 15px; margin-bottom: 20px; }
              .timeline-icon { width: 40px; height: 40px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
              .timeline-content { flex: 1; }
              .timeline-title { font-weight: 600; color: #111827; margin-bottom: 5px; }
              .timeline-desc { color: #6b7280; font-size: 14px; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
              .help-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 Your Order is On Its Way!</h1>
                <p>Hi ${customer.name}, your package has been shipped</p>
              </div>
              
              <div class="content">
                <div class="tracking-box">
                  <h2 style="margin-top: 0; color: #111827;">Tracking Information</h2>
                  <p style="color: #6b7280; margin-bottom: 15px;">Your order has been picked up by our courier partner and is on its way to you!</p>
                  
                  <div class="info-row">
                    <span class="info-label">Order Number:</span>
                    <span class="info-value">${order.orderNumber}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Courier Partner:</span>
                    <span class="info-value">${order.courierName || 'Courier'}</span>
                  </div>
                  <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Tracking ID (AWB):</span>
                    <span class="info-value">${order.awbCode}</span>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #6b7280; margin-bottom: 10px;">Your Tracking Number:</p>
                    <div class="tracking-number">${order.awbCode}</div>
                    <a href="${trackingUrl}" class="track-button">🔍 Track Your Package</a>
                  </div>
                </div>

                <div class="timeline">
                  <h3 style="color: #111827; margin-bottom: 20px;">Shipment Journey</h3>
                  
                  <div class="timeline-item">
                    <div class="timeline-icon">✅</div>
                    <div class="timeline-content">
                      <div class="timeline-title">Order Confirmed</div>
                      <div class="timeline-desc">Your order was successfully placed</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-icon">📦</div>
                    <div class="timeline-content">
                      <div class="timeline-title">Package Picked Up</div>
                      <div class="timeline-desc">Courier has collected your package</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #e5e7eb; color: #6b7280;">🚚</div>
                    <div class="timeline-content">
                      <div class="timeline-title" style="color: #6b7280;">In Transit</div>
                      <div class="timeline-desc">Package is on the way to you</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #e5e7eb; color: #6b7280;">🏠</div>
                    <div class="timeline-content">
                      <div class="timeline-title" style="color: #6b7280;">Out for Delivery</div>
                      <div class="timeline-desc">Package will be delivered soon</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-icon" style="background: #e5e7eb; color: #6b7280;">🎉</div>
                    <div class="timeline-content">
                      <div class="timeline-title" style="color: #6b7280;">Delivered</div>
                      <div class="timeline-desc">Package delivered successfully</div>
                    </div>
                  </div>
                </div>

                <div class="help-box">
                  <h4 style="margin-top: 0; color: #1e40af;">📞 Need Help?</h4>
                  <p style="margin: 10px 0; color: #1e3a8a;">
                    <strong>Customer Support:</strong> ${process.env.COMPANY_PHONE || '+91 8084924834'}<br>
                    <strong>Email:</strong> ${process.env.COMPANY_EMAIL || 'support@saiflowwater.com'}<br>
                    <strong>Hours:</strong> Monday - Saturday, 9 AM - 7 PM
                  </p>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>💡 Tip:</strong> Please keep your phone handy. The delivery partner may call you for address confirmation or delivery instructions.
                  </p>
                </div>
              </div>

              <div class="footer">
                <p>Thank you for shopping with ${process.env.COMPANY_NAME || 'Sai Flow Water'}!</p>
                <p style="margin-top: 10px;">This is an automated email. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      console.log(`📤 Sending tracking email to ${customer.email} for order ${order.orderNumber}`);
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`✅ Tracking email sent successfully - AWB: ${order.awbCode}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send tracking email:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
