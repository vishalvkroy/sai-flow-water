const Razorpay = require('razorpay');
const crypto = require('crypto');
const ServiceBooking = require('../models/ServiceBooking');
const emailService = require('../services/emailService');
const { createNotification } = require('./notificationController');

// Initialize Razorpay
console.log('🔐 Initializing Razorpay...');
console.log('Key ID:', process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...` : 'NOT SET');
console.log('Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

console.log('✅ Razorpay initialized');

// @desc    Create Razorpay order for service advance payment
// @route   POST /api/services/:id/payment/create-order
// @access  Private
const createServicePaymentOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Service booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'advance_paid' || booking.paymentStatus === 'fully_paid') {
      return res.status(400).json({
        success: false,
        message: 'Advance payment already completed'
      });
    }

    // Check if terms are accepted
    if (!booking.termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Please accept terms and conditions before payment'
      });
    }

    // Ensure pricing is calculated
    if (!booking.advanceAmount || booking.advanceAmount === 0) {
      console.log('⚠️ Advance amount not set, calculating pricing...');
      booking.calculateServiceCost();
      await booking.save();
    }

    console.log(`💰 Creating payment order for ₹${booking.advanceAmount}`);

    // Validate amount
    if (!booking.advanceAmount || booking.advanceAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid advance amount. Please try creating the booking again.'
      });
    }

    let razorpayOrder;
    
    // Check if we're in development mode with invalid/test credentials
    const isDevelopmentMode = process.env.NODE_ENV === 'development';
    const isTestCredentials = process.env.RAZORPAY_KEY_ID?.includes('test') || 
                              process.env.RAZORPAY_KEY_ID === 'rzp_test_RaxhPfGsI6kH89';
    
    if (isDevelopmentMode && isTestCredentials) {
      // Create mock order for development/testing
      console.log('⚠️  Using MOCK payment for development (Razorpay credentials not configured)');
      razorpayOrder = {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(booking.advanceAmount * 100),
        currency: 'INR',
        receipt: `service_${booking._id}`,
        status: 'created'
      };
      console.log(`✅ Mock payment order created: ${razorpayOrder.id}`);
    } else {
      // Create real Razorpay order
      try {
        razorpayOrder = await razorpay.orders.create({
          amount: Math.round(booking.advanceAmount * 100), // Amount in paise
          currency: 'INR',
          receipt: `service_${booking._id}`,
          notes: {
            bookingId: booking._id.toString(),
            bookingNumber: booking.bookingNumber,
            userId: req.user._id.toString(),
            serviceType: booking.serviceType,
            paymentType: 'advance'
          }
        });
        console.log(`✅ Razorpay order created for service booking ${booking.bookingNumber}: ${razorpayOrder.id}`);
      } catch (razorpayError) {
        console.error('❌ Razorpay API Error:', razorpayError);
        throw razorpayError;
      }
    }

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          serviceCost: booking.serviceCost,
          advanceAmount: booking.advanceAmount,
          remainingAmount: booking.remainingAmount
        }
      }
    });
  } catch (error) {
    console.error('❌ Create service payment order error:', error);
    
    // Handle Razorpay specific errors
    if (error.statusCode === 401) {
      console.error('🔐 Razorpay Authentication Failed!');
      console.error('Please check your Razorpay credentials in .env file');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway authentication failed. Please contact support.',
        error: 'Razorpay credentials are invalid or missing'
      });
    }
    
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      statusCode: error.statusCode,
      razorpayError: error.error
    });
    
    res.status(500).json({
      success: false,
      message: error.error?.description || 'Failed to create payment order',
      error: error.message || 'Payment gateway error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// @desc    Verify Razorpay payment for service booking
// @route   POST /api/services/:id/payment/verify
// @access  Private
const verifyServicePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Check if this is a mock payment (development mode)
    const isMockPayment = razorpay_order_id?.startsWith('order_mock_');
    
    if (!isMockPayment) {
      // Verify signature for real Razorpay payments
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed - Invalid signature'
        });
      }
    } else {
      console.log('⚠️  Skipping signature verification for mock payment');
    }

    // Update booking payment status
    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Service booking not found'
      });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update payment details
    booking.paymentStatus = 'advance_paid';
    booking.paymentMethod = 'online';
    booking.advancePayment = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
      amount: booking.advanceAmount
    };

    // Update status to confirmed after payment
    if (booking.status === 'pending') {
      booking.status = 'confirmed';
      booking.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Advance payment received - Service confirmed',
        updatedBy: req.user._id
      });
    }

    await booking.save();

    console.log(`✅ Service payment verified for booking ${booking.bookingNumber}`);

    // Create real-time notification for seller
    try {
      const User = require('../models/User');
      const sellers = await User.find({ role: 'seller' });
      
      for (const seller of sellers) {
        await createNotification(
          seller._id,
          'service',
          '🔧 Service Payment Received!',
          `Service booking #${booking.bookingNumber} - ₹${booking.advanceAmount} advance paid`,
          `/seller/services`,
          { bookingId: booking._id, bookingNumber: booking.bookingNumber }
        );
      }

      // Emit Socket.IO event for real-time analytics update
      const io = require('../server').io;
      if (io) {
        sellers.forEach(seller => {
          io.to(seller._id.toString()).emit('payment-received', {
            bookingId: booking._id,
            amount: booking.advanceAmount,
            type: 'service'
          });
        });
      }
    } catch (notifError) {
      console.log('Notification creation failed:', notifError.message);
    }

    // Send confirmation email to customer
    try {
      const populatedBooking = await ServiceBooking.findById(booking._id).populate('user', 'name email');
      await emailService.sendServiceBookingConfirmation(populatedBooking, populatedBooking.user);
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError.message);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully! Your service is confirmed. Check your email for booking details.',
      data: {
        booking
      }
    });
  } catch (error) {
    console.error('Verify service payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// @desc    Process refund for cancelled service
// @route   POST /api/services/:id/payment/refund
// @access  Private
const processServiceRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Service booking not found'
      });
    }

    // Verify booking belongs to user or is admin/seller
    if (booking.user.toString() !== req.user._id.toString() && 
        !['admin', 'seller'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refund'
      });
    }

    // Check if booking is cancelled
    if (booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled bookings can be refunded'
      });
    }

    // Check if advance payment was made
    if (booking.paymentStatus !== 'advance_paid') {
      return res.status(400).json({
        success: false,
        message: 'No advance payment found to refund'
      });
    }

    // Check if already refunded
    if (booking.paymentStatus === 'refunded' || booking.paymentStatus === 'partially_refunded') {
      return res.status(400).json({
        success: false,
        message: 'Refund already processed'
      });
    }

    // Calculate refund amount
    const refundDetails = booking.calculateRefund();

    if (!refundDetails) {
      return res.status(400).json({
        success: false,
        message: 'Unable to calculate refund'
      });
    }

    // Process refund through Razorpay
    let razorpayRefund = null;
    if (refundDetails.refundedAmount > 0) {
      try {
        razorpayRefund = await razorpay.payments.refund(
          booking.advancePayment.razorpayPaymentId,
          {
            amount: Math.round(refundDetails.refundedAmount * 100), // Amount in paise
            notes: {
              bookingId: booking._id.toString(),
              bookingNumber: booking.bookingNumber,
              reason: reason || 'Service cancelled',
              cancellationFee: refundDetails.deductedAmount
            }
          }
        );
      } catch (razorpayError) {
        console.error('Razorpay refund error:', razorpayError);
        // Continue even if Razorpay refund fails - we'll mark it as pending
      }
    }

    // Update booking with refund details
    booking.refund = {
      amount: refundDetails.amount,
      deductedAmount: refundDetails.deductedAmount,
      refundedAmount: refundDetails.refundedAmount,
      razorpayRefundId: razorpayRefund?.id || null,
      refundedAt: razorpayRefund ? new Date() : null,
      reason: reason || 'Service cancelled',
      status: razorpayRefund ? 'processed' : 'pending'
    };

    booking.paymentStatus = refundDetails.refundedAmount > 0 ? 'partially_refunded' : 'refunded';

    booking.statusHistory.push({
      status: 'refund_processed',
      timestamp: new Date(),
      note: `Refund processed: ₹${refundDetails.refundedAmount} (₹${refundDetails.deductedAmount} cancellation fee deducted)`,
      updatedBy: req.user._id
    });

    await booking.save();

    console.log(`✅ Refund processed for booking ${booking.bookingNumber}: ₹${refundDetails.refundedAmount}`);

    res.json({
      success: true,
      message: `Refund processed successfully. ₹${refundDetails.refundedAmount} will be credited to your account in 5-7 business days.`,
      data: {
        refundDetails: {
          originalAmount: refundDetails.amount,
          cancellationFee: refundDetails.deductedAmount,
          refundedAmount: refundDetails.refundedAmount,
          refundId: razorpayRefund?.id
        },
        booking
      }
    });
  } catch (error) {
    console.error('Process service refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// @desc    Get service pricing based on distance
// @route   POST /api/services/calculate-pricing
// @access  Private
const calculateServicePricing = async (req, res) => {
  try {
    const { distance } = req.body;

    if (!distance || distance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid distance is required'
      });
    }

    let serviceCost = 0;
    let distanceRange = '';

    if (distance <= 10) {
      serviceCost = 300;
      distanceRange = '0-10 km';
    } else if (distance <= 20) {
      serviceCost = 400;
      distanceRange = '10-20 km';
    } else {
      serviceCost = 500;
      distanceRange = '20+ km';
    }

    const advanceAmount = Math.round(serviceCost / 2);
    const remainingAmount = serviceCost - advanceAmount;

    res.json({
      success: true,
      data: {
        distance,
        distanceRange,
        serviceCost,
        advanceAmount,
        remainingAmount,
        cancellationPolicy: {
          fee: 100,
          description: 'If service is cancelled after technician visit or while technician is on the way, ₹100 will be deducted from the refund amount.'
        }
      }
    });
  } catch (error) {
    console.error('Calculate service pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate pricing',
      error: error.message
    });
  }
};

module.exports = {
  createServicePaymentOrder,
  verifyServicePayment,
  processServiceRefund,
  calculateServicePricing
};
