const nodemailer = require('nodemailer');

// Create transporter only if email credentials are provided
let transporter = null;

const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Check if all required email environment variables are set
const isEmailConfigured = process.env.EMAIL_SERVICE && 
                         process.env.EMAIL_USER && 
                         process.env.EMAIL_PASS;

if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // For self-signed certificates (remove in production)
      }
    });

    // Verify transporter
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
        transporter = null;
      } else {
        console.log('✅ Email server is ready to send messages');
      }
    });
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    transporter = null;
  }
} else {
  console.warn('⚠️ Email configuration is incomplete. The following environment variables must be set:');
  if (!process.env.EMAIL_SERVICE) console.warn('  - EMAIL_SERVICE (e.g., gmail, outlook)');
  if (!process.env.EMAIL_USER) console.warn('  - EMAIL_USER (your email address)');
  if (!process.env.EMAIL_PASS) console.warn('  - EMAIL_PASS (your email password or app password)');
}

const sendEmail = async (options) => {
  // Check if email is properly configured
  if (!transporter) {
    const errorMsg = 'Email service is not configured';
    console.error(`❌ ${errorMsg}. Email not sent: ${options.subject} to ${options.email}`);
    throw new Error(errorMsg);
  }

  if (!options || !options.email || !options.subject || !options.html) {
    const errorMsg = 'Missing required email options';
    console.error(`❌ ${errorMsg}`, options);
    throw new Error(errorMsg);
  }

  try {
    const mailOptions = {
      from: `"Arroh Water Filters" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      // Add text version for better deliverability
      text: options.text || options.html.replace(/<[^>]*>?/gm, '')
    };

    console.log(`📧 Attempting to send email to: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully:`, {
      messageId: info.messageId,
      to: options.email,
      subject: options.subject
    });
    
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', {
      error: error.message,
      to: options.email,
      subject: options.subject,
      stack: error.stack
    });
    throw error; // Re-throw to allow calling function to handle the error
  }
};

// Email templates
const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Thank you for your order!</h2>
        <p>Dear ${user.name},</p>
        <p>Your order has been received and is being processed.</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
        <p><strong>Shipping Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for choosing Arroh Water Filters!</p>
      </div>
    `
  }),

  bookingConfirmation: (booking) => ({
    subject: `Service Booking Confirmation - ${booking.bookingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Service Booking Confirmed!</h2>
        <p>Dear ${booking.customerInfo.name},</p>
        <p>Your service booking has been confirmed.</p>
        
        <h3>Booking Details:</h3>
        <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
        <p><strong>Service Type:</strong> ${booking.serviceType}</p>
        <p><strong>Date:</strong> ${booking.formattedDate}</p>
        <p><strong>Time:</strong> ${booking.timeSlotDisplay}</p>
        
        <p>Our technician will contact you before the scheduled visit.</p>
        <p>Thank you for choosing Arroh Water Filters!</p>
      </div>
    `
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request - Arroh Water Filters',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        
        <a href="${FRONTEND_BASE_URL}/reset-password/${resetToken}" 
           style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  }),

  returnRequested: (order, user) => ({
    subject: `Return Request Received - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #f59e0b; margin-bottom: 20px;">🔄 Return Request Received</h2>
          <p>Dear ${user.name},</p>
          <p>We've received your return request for order <strong>#${order.orderNumber}</strong>.</p>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Return Details:</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Return Reason:</strong> ${order.returnReason}</p>
            <p style="margin: 5px 0;"><strong>Order Amount:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
            <p style="margin: 5px 0;"><strong>Requested On:</strong> ${new Date(order.returnRequestedAt).toLocaleDateString('en-IN')}</p>
          </div>
          
          <h3 style="color: #374151;">What Happens Next?</h3>
          <ol style="color: #6b7280; line-height: 1.8;">
            <li>Our team will review your return request within 24 hours</li>
            <li>If approved, we'll schedule a free pickup from your address</li>
            <li>Courier will collect the product</li>
            <li>After inspection, refund will be processed within 5-7 business days</li>
          </ol>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>📧 You'll receive an email once your return is approved or if we need more information.</strong></p>
          </div>
          
          <p style="color: #6b7280;">Thank you for your patience!</p>
          <p style="color: #374151; font-weight: 600;">Team Arroh Water Filters</p>
        </div>
      </div>
    `
  }),

  returnApproved: (order, user) => ({
    subject: `Return Approved - Pickup Scheduled - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">✅ Return Approved!</h2>
          <p>Dear ${user.name},</p>
          <p>Great news! Your return request has been <strong>approved</strong>.</p>
          
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Reverse Pickup Details:</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>AWB Number:</strong> ${order.returnAwbCode}</p>
            <p style="margin: 5px 0;"><strong>Courier Partner:</strong> ${order.returnCourierName}</p>
            <p style="margin: 5px 0;"><strong>Pickup Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📦 Pickup Instructions:</h3>
            <ul style="color: #78350f; line-height: 1.8; margin: 10px 0;">
              <li>Courier will visit your address within 24-48 hours</li>
              <li>Please keep the product ready with original packaging (if available)</li>
              <li>Include all accessories and documents</li>
              <li>Courier will provide a pickup receipt</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${order.returnTrackingUrl}" 
               style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              🔍 Track Your Return
            </a>
          </div>
          
          <h3 style="color: #374151;">Refund Timeline:</h3>
          <ol style="color: #6b7280; line-height: 1.8;">
            <li>Product picked up by courier</li>
            <li>Delivered to our warehouse (2-3 days)</li>
            <li>Quality inspection (1-2 days)</li>
            <li>Refund processed (5-7 business days)</li>
          </ol>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>💰 Refund Amount: ₹${order.totalPrice.toLocaleString('en-IN')}</strong></p>
            <p style="margin: 5px 0 0 0; color: #1e40af; font-size: 14px;">Will be credited to your original payment method</p>
          </div>
          
          <p style="color: #6b7280;">If you have any questions, feel free to contact our support team.</p>
          <p style="color: #374151; font-weight: 600;">Team Arroh Water Filters</p>
        </div>
      </div>
    `
  }),

  returnRejected: (order, user) => ({
    subject: `Return Request Update - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #ef4444; margin-bottom: 20px;">❌ Return Request Update</h2>
          <p>Dear ${user.name},</p>
          <p>We've reviewed your return request for order <strong>#${order.orderNumber}</strong>.</p>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Return Status: Not Approved</h3>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${order.returnRejectionReason}</p>
          </div>
          
          <h3 style="color: #374151;">Alternative Options:</h3>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>🛡️ Warranty Claim:</strong> If the product is defective, you can file a warranty claim</p>
            <p style="margin: 5px 0;"><strong>🔧 Service Request:</strong> Book a free service visit for technical issues</p>
            <p style="margin: 5px 0;"><strong>💬 Customer Support:</strong> Chat with our support team for assistance</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_BASE_URL}/support" 
               style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Contact Support
            </a>
          </div>
          
          <p style="color: #6b7280;">We're here to help! Please reach out if you have any questions.</p>
          <p style="color: #374151; font-weight: 600;">Team Arroh Water Filters</p>
        </div>
      </div>
    `
  }),

  refundProcessed: (order, user) => ({
    subject: `Refund Processed - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #10b981; margin-bottom: 20px;">💰 Refund ${order.refundStatus === 'completed' ? 'Completed' : 'Processing'}!</h2>
          <p>Dear ${user.name},</p>
          <p>${order.refundStatus === 'completed' 
            ? 'Great news! Your refund has been processed successfully.' 
            : 'Your refund is being processed and will be credited soon.'}</p>
          
          <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #065f46; margin-top: 0; font-size: 24px;">₹${order.refundAmount.toLocaleString('en-IN')}</h3>
            <p style="margin: 5px 0; color: #047857; font-size: 18px; font-weight: 600;">Refund Amount</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Refund Details:</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Refund Status:</strong> ${order.refundStatus === 'completed' ? '✅ Completed' : '⏳ Processing'}</p>
            <p style="margin: 5px 0;"><strong>Refund Method:</strong> ${order.refundMethod === 'original_payment' ? 'Original Payment Method' : order.refundMethod === 'bank_transfer' ? 'Bank Transfer' : 'Store Credit'}</p>
            ${order.refundTransactionId ? `<p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${order.refundTransactionId}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Processed On:</strong> ${new Date(order.refundInitiatedAt).toLocaleDateString('en-IN')}</p>
          </div>
          
          ${order.refundStatus === 'completed' ? `
            <h3 style="color: #374151;">When Will I Receive My Refund?</h3>
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #1e40af;"><strong>Credit/Debit Card:</strong> 5-7 business days</p>
              <p style="margin: 5px 0; color: #1e40af;"><strong>UPI/Net Banking:</strong> 3-5 business days</p>
              <p style="margin: 5px 0; color: #1e40af;"><strong>Bank Transfer:</strong> 7-10 business days</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">The refund will be credited to the same account/card used for payment.</p>
          ` : `
            <h3 style="color: #374151;">What Happens Next?</h3>
            <ol style="color: #6b7280; line-height: 1.8;">
              ${order.paymentMethod === 'razorpay' ? `
                <li>Refund initiated with payment gateway</li>
                <li>Processing time: 5-7 business days</li>
                <li>Amount will be credited to your original payment method</li>
              ` : `
                <li>Our team will contact you for bank account details</li>
                <li>Refund will be processed via bank transfer</li>
                <li>Processing time: 7-10 business days</li>
              `}
              <li>You'll receive a confirmation email once completed</li>
            </ol>
          `}
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #374151; font-size: 14px;">
              <strong>Note:</strong> ${order.refundNotes || 'Your refund is being processed as per our return policy.'}
            </p>
          </div>
          
          <p style="color: #6b7280;">If you don't receive your refund within the specified time, please contact our support team.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_BASE_URL}/support" 
               style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              Contact Support
            </a>
          </div>
          
          <p style="color: #6b7280;">Thank you for your patience!</p>
          <p style="color: #374151; font-weight: 600;">Team Arroh Water Filters</p>
        </div>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};