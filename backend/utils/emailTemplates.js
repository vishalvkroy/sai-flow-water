/**
 * Professional Email Templates for Service Bookings
 */

const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const getBookingConfirmationEmail = (booking, user) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (slot) => {
    const slots = {
      morning: '9:00 AM - 12:00 PM',
      afternoon: '12:00 PM - 4:00 PM',
      evening: '4:00 PM - 7:00 PM'
    };
    return slots[slot] || slot;
  };

  return {
    subject: `✅ Service Booking Confirmed - ${booking.bookingNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .success-badge {
      background-color: #10b981;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      display: inline-block;
      margin-top: 10px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
    }
    .booking-number {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background-color: #f8fafc;
      border-radius: 8px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
    }
    .section-title::before {
      content: "●";
      color: #3b82f6;
      margin-right: 10px;
      font-size: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
    }
    .info-value {
      color: #1e293b;
      font-weight: 600;
      text-align: right;
    }
    .payment-box {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .payment-amount {
      font-size: 32px;
      font-weight: bold;
      text-align: center;
      margin: 10px 0;
    }
    .payment-status {
      text-align: center;
      font-size: 14px;
      opacity: 0.9;
    }
    .important-note {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .important-note strong {
      color: #92400e;
    }
    .footer {
      background-color: #1e293b;
      color: white;
      padding: 25px;
      text-align: center;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #60a5fa;
      text-decoration: none;
      margin: 0 10px;
    }
    .social-links {
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 15px 0;
      font-weight: bold;
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .content {
        padding: 20px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-value {
        text-align: left;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
      <div class="success-badge">✓ PAYMENT RECEIVED</div>
    </div>

    <!-- Content -->
    <div class="content">
      <p>Dear <strong>${booking.address.fullName}</strong>,</p>
      
      <p>Thank you for choosing <strong>Sai Enterprises</strong>! Your service booking has been confirmed and payment received successfully.</p>

      <div class="booking-number">
        📋 Booking Number: ${booking.bookingNumber}
      </div>

      <!-- Service Details -->
      <div class="section">
        <div class="section-title">Service Details</div>
        <div class="info-row">
          <span class="info-label">Service Type</span>
          <span class="info-value">${booking.serviceType.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Product</span>
          <span class="info-value">${booking.productType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Issue Description</span>
          <span class="info-value">${booking.issueDescription}</span>
        </div>
      </div>

      <!-- Schedule -->
      <div class="section">
        <div class="section-title">Schedule</div>
        <div class="info-row">
          <span class="info-label">📅 Date</span>
          <span class="info-value">${formatDate(booking.preferredDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Time Slot</span>
          <span class="info-value">${formatTime(booking.preferredTimeSlot)}</span>
        </div>
      </div>

      <!-- Service Address -->
      <div class="section">
        <div class="section-title">Service Address</div>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-value">${booking.address.fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone</span>
          <span class="info-value">${booking.address.phone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Address</span>
          <span class="info-value">${booking.address.address}, ${booking.address.city}, ${booking.address.state} - ${booking.address.postalCode}</span>
        </div>
      </div>

      <!-- Payment Details -->
      <div class="payment-box">
        <div class="payment-status">💳 PAYMENT DETAILS</div>
        <div class="payment-amount">₹${booking.advanceAmount}</div>
        <div class="payment-status">Advance Payment Received ✓</div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
          <div class="info-row" style="border: none; color: white;">
            <span>Total Service Cost</span>
            <span>₹${booking.serviceCost}</span>
          </div>
          <div class="info-row" style="border: none; color: white;">
            <span>Advance Paid</span>
            <span>₹${booking.advanceAmount} ✓</span>
          </div>
          <div class="info-row" style="border: none; color: white;">
            <span>Remaining Amount</span>
            <span>₹${booking.remainingAmount}</span>
          </div>
        </div>
        <div class="payment-status" style="margin-top: 10px; font-size: 12px;">
          Payment ID: ${booking.advancePayment?.razorpayPaymentId || 'Processing...'}
        </div>
      </div>

      <!-- Important Note -->
      <div class="important-note">
        <strong>⚠️ Important:</strong> The remaining amount of <strong>₹${booking.remainingAmount}</strong> will be collected after service completion. You can pay via cash or online.
      </div>

      <!-- Cancellation Policy -->
      <div class="section">
        <div class="section-title">Cancellation Policy</div>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          • Free cancellation before technician assignment<br>
          • ₹100 cancellation fee if cancelled after technician visit or while on the way<br>
          • Refund will be processed within 5-7 business days
        </p>
      </div>

      <!-- Next Steps -->
      <div class="section">
        <div class="section-title">What Happens Next?</div>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          1️⃣ We'll assign a technician to your booking<br>
          2️⃣ You'll receive technician details via SMS/Email<br>
          3️⃣ Technician will visit on scheduled date & time<br>
          4️⃣ Service will be completed professionally<br>
          5️⃣ Pay remaining amount after service completion
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_BASE_URL}/customer-dashboard" class="button">
          View Booking Details
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px; text-align: center;">
        If you have any questions, feel free to contact us at<br>
        📞 ${process.env.COMPANY_PHONE} | 📧 ${process.env.COMPANY_EMAIL}
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <h3 style="margin: 0 0 10px 0;">Sai Enterprises</h3>
      <p style="margin: 5px 0; opacity: 0.8;">Professional Water Purifier Services</p>
      <p style="margin: 5px 0; opacity: 0.8;">${process.env.COMPANY_LOCATION}</p>
      
      <div class="footer-links">
        <a href="${FRONTEND_BASE_URL}">Website</a> |
        <a href="${FRONTEND_BASE_URL}/services">Services</a> |
        <a href="${FRONTEND_BASE_URL}/contact">Contact</a>
      </div>

      <p style="font-size: 12px; opacity: 0.7; margin-top: 20px;">
        © ${new Date().getFullYear()} Sai Enterprises. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Service Booking Confirmed - ${booking.bookingNumber}

Dear ${booking.address.fullName},

Thank you for choosing Sai Enterprises! Your service booking has been confirmed.

Booking Number: ${booking.bookingNumber}

Service Details:
- Type: ${booking.serviceType.replace(/_/g, ' ').toUpperCase()}
- Product: ${booking.productType}
- Date: ${formatDate(booking.preferredDate)}
- Time: ${formatTime(booking.preferredTimeSlot)}

Payment Details:
- Total Cost: ₹${booking.serviceCost}
- Advance Paid: ₹${booking.advanceAmount} ✓
- Remaining: ₹${booking.remainingAmount}

Service Address:
${booking.address.address}
${booking.address.city}, ${booking.address.state} - ${booking.address.postalCode}

The remaining amount will be collected after service completion.

For any queries, contact us:
Phone: ${process.env.COMPANY_PHONE}
Email: ${process.env.COMPANY_EMAIL}

Thank you!
Sai Enterprises
    `
  };
};

const getTechnicianAssignedEmail = (booking, technician) => {
  return {
    subject: `👨‍🔧 Technician Assigned - ${booking.bookingNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .technician-card { background-color: #f8fafc; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👨‍🔧 Technician Assigned!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${booking.address.fullName}</strong>,</p>
      <p>Great news! We've assigned a technician to your service booking.</p>
      
      <div class="technician-card">
        <h3 style="margin-top: 0; color: #8b5cf6;">Technician Details</h3>
        <div class="info-row">
          <span>Name</span>
          <strong>${technician.name}</strong>
        </div>
        <div class="info-row">
          <span>Phone</span>
          <strong>${technician.phone}</strong>
        </div>
        <div class="info-row" style="border: none;">
          <span>ID</span>
          <strong>${technician.id}</strong>
        </div>
      </div>

      <p>The technician will visit you on the scheduled date and time. Please ensure someone is available at the service location.</p>
      
      <p style="color: #64748b; font-size: 14px;">
        Booking: ${booking.bookingNumber}<br>
        Date: ${new Date(booking.preferredDate).toLocaleDateString('en-IN')}<br>
        Time: ${booking.preferredTimeSlot}
      </p>
    </div>
  </div>
</body>
</html>
    `
  };
};

const getServiceCompletedEmail = (booking) => {
  return {
    subject: `✅ Service Completed - ${booking.bookingNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .rating-box { background-color: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Service Completed!</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${booking.address.fullName}</strong>,</p>
      <p>Your service has been completed successfully!</p>
      
      <div class="rating-box">
        <h3>How was your experience?</h3>
        <p>We'd love to hear your feedback!</p>
        <a href="${FRONTEND_BASE_URL}/customer-dashboard" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          Rate Our Service
        </a>
      </div>

      <p>Thank you for choosing Sai Enterprises!</p>
    </div>
  </div>
</body>
</html>
    `
  };
};

/**
 * Order Shipped Email Template
 */
const orderShipped = (order, user) => {
  return {
    subject: `📦 Your Order #${order.orderNumber} Has Been Shipped!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .shipping-icon {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
    }
    .tracking-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .tracking-number {
      font-size: 24px;
      font-weight: bold;
      color: #059669;
      margin: 10px 0;
      letter-spacing: 2px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
      font-weight: 500;
    }
    .track-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: 600;
      text-align: center;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="shipping-icon">🚚</div>
      <h1>Your Order is On The Way!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${order.orderNumber}</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${user.name}</strong>,</p>
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      
      <div class="tracking-box">
        <h3 style="margin-top: 0; color: #059669;">📍 Tracking Information</h3>
        <div class="info-row">
          <span class="info-label">Tracking Number:</span>
          <span class="info-value tracking-number">${order.trackingNumber || order.awbCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Courier Partner:</span>
          <span class="info-value">${order.courierName || order.carrier || 'Standard Shipping'}</span>
        </div>
        ${order.expectedDeliveryDate ? `
        <div class="info-row">
          <span class="info-label">Expected Delivery:</span>
          <span class="info-value">${new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        ` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${FRONTEND_BASE_URL}/track-order/${order.orderNumber}" class="track-button">
          🔍 Track Your Order
        </a>
      </div>

      <h3>📦 Order Details</h3>
      <div class="info-row">
        <span class="info-label">Order Number:</span>
        <span class="info-value">${order.orderNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Order Date:</span>
        <span class="info-value">${new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Amount:</span>
        <span class="info-value">₹${order.totalPrice.toLocaleString()}</span>
      </div>

      <h3>📍 Shipping Address</h3>
      <p style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 10px 0;">
        <strong>${order.shippingAddress.fullName}</strong><br>
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.landmark ? order.shippingAddress.landmark + '<br>' : ''}
        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br>
        📞 ${order.shippingAddress.phone}
      </p>

      <p style="margin-top: 30px;">If you have any questions about your order, please contact us at:</p>
      <p style="text-align: center;">
        📧 ${process.env.COMPANY_EMAIL || 'support@saienterprises.com'}<br>
        📞 ${process.env.COMPANY_PHONE || '+91 8084924834'}
      </p>
    </div>

    <div class="footer">
      <p>Thank you for shopping with <strong>Sai Enterprises</strong></p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
    `
  };
};

module.exports = {
  getBookingConfirmationEmail,
  getTechnicianAssignedEmail,
  getServiceCompletedEmail,
  orderShipped
};
