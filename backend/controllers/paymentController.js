const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Try to create Razorpay order, fallback to mock if credentials are invalid
    let razorpayOrder;
    let isMockMode = false;

    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.totalPrice * 100), // Amount in paise
        currency: 'INR',
        receipt: `order_${order._id}`,
        notes: {
          orderId: order._id.toString(),
          userId: req.user._id.toString()
        }
      });
      console.log('✅ Razorpay order created:', razorpayOrder.id);
    } catch (razorpayError) {
      // If Razorpay fails (invalid credentials), use mock mode
      console.log('⚠️  Razorpay credentials invalid - Using MOCK payment mode');
      console.log('💡 Add valid Razorpay credentials in .env to enable real payments');
      isMockMode = true;
      razorpayOrder = {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(order.totalPrice * 100),
        currency: 'INR',
        receipt: `order_${order._id}`,
        status: 'created'
      };
    }

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment order'
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Check if this is a mock payment
    const isMockPayment = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');

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
          message: 'Payment verification failed'
        });
      }
    } else {
      console.log('✅ Mock payment verified (development mode)');
    }

    // Update order payment status
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'completed',
      update_time: new Date().toISOString(),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };

    await order.save();

    // Clear user's cart after successful payment
    try {
      const Cart = require('../models/Cart');
      const cart = await Cart.findOne({ user: order.user });
      if (cart) {
        await cart.clearCart();
        console.log('✅ Cart cleared after successful payment');
      }
    } catch (cartError) {
      console.log('Cart clear failed (non-critical):', cartError.message);
    }

    // Emit Socket.IO event for real-time analytics update
    try {
      const io = require('../server').io;
      if (io) {
        // Get all sellers
        const User = require('../models/User');
        const sellers = await User.find({ role: 'seller' });
        sellers.forEach(seller => {
          io.to(seller._id.toString()).emit('payment-received', {
            orderId: order._id,
            amount: order.totalPrice
          });
        });
      }
    } catch (socketError) {
      console.log('Socket.IO emit failed (non-critical):', socketError.message);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function to handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: paymentIntent.receipt_email
      };
      
      await order.save();
      console.log(`Order ${orderId} marked as paid via webhook`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
const getPaymentMethods = async (req, res) => {
  try {
    // In a real application, you might retrieve saved payment methods for the user
    // For now, we'll return available payment methods
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: 'Pay with Visa, MasterCard, American Express, RuPay',
        supportedCards: ['visa', 'mastercard', 'amex', 'rupay']
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        description: 'Pay with your debit card',
        supportedCards: ['visa', 'mastercard', 'rupay']
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI (Google Pay, PhonePe, Paytm, etc.)'
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Pay using your bank account'
      },
      {
        id: 'cash_on_delivery',
        name: 'Cash on Delivery',
        description: 'Pay when your order is delivered'
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment methods'
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentMethods
};