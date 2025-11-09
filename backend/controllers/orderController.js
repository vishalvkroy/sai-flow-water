const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const { createNotification } = require('./notificationController');

// Get Socket.IO instance for real-time updates
let io;
try {
  const server = require('../server');
  io = server.io;
} catch (err) {
  // io will be undefined if server module is not loaded yet
  console.log('⚠️  Socket.IO not available yet');
}

// @desc    Create order from cart
// @route   POST /api/orders/checkout
// @access  Private
const createOrderFromCart = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      // Get product ID - handle both populated and non-populated cases
      const productId = item.product._id || item.product;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productName || 'Unknown'} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is no longer available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available`
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price || product.price,
        name: item.productName || product.name,
        image: item.productImage || product.images?.[0] || '/default-product.jpg'
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate prices
    const itemsPrice = cart.totalPrice;
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST
    
    // Use delivery info from request (calculated on frontend)
    const deliveryInfo = req.body.deliveryInfo;
    let shippingPrice = 0;
    
    if (deliveryInfo) {
      shippingPrice = deliveryInfo.isFreeDelivery ? 0 : (deliveryInfo.deliveryChargeBreakdown?.total || 0);
    } else {
      // Fallback to simple calculation if delivery info not provided
      shippingPrice = itemsPrice > 10000 ? 0 : 500;
    }
    
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Generate unique order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'pending',
      // Store delivery info for reference
      deliveryInfo: deliveryInfo ? {
        distanceFromWarehouse: deliveryInfo.distanceFromWarehouse,
        totalWeight: deliveryInfo.totalWeight,
        isFreeDelivery: deliveryInfo.isFreeDelivery,
        estimatedDeliveryDays: deliveryInfo.estimatedDeliveryDays
      } : null
    });

    const createdOrder = await order.save();

    // DON'T clear cart yet - only clear after successful payment
    // For COD orders, cart will be cleared when order is delivered
    // For online payment, cart will be cleared after payment verification

    // Populate order for response
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    // Create real-time notification for seller
    try {
      // Get seller user ID (you may need to adjust this based on your user model)
      const User = require('../models/User');
      const sellers = await User.find({ role: 'seller' });
      
      for (const seller of sellers) {
        await createNotification(
          seller._id,
          'order',
          '🛒 New Order Received!',
          `Order #${populatedOrder.orderNumber} placed by ${req.user.name} - ₹${populatedOrder.totalPrice}`,
          `/seller/orders`,
          { orderId: populatedOrder._id, orderNumber: populatedOrder.orderNumber }
        );
      }
    } catch (notifError) {
      console.log('Notification creation failed:', notifError.message);
    }

    // Send confirmation email (if email service is working)
    try {
      await sendEmail({
        email: req.user.email,
        subject: emailTemplates.orderConfirmation(populatedOrder, req.user).subject,
        html: emailTemplates.orderConfirmation(populatedOrder, req.user).html
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    // Emit real-time notification to sellers
    const io = req.app.get('io');
    if (io) {
      io.to('sellers').emit('new_order', {
        orderId: populatedOrder._id,
        orderNumber: populatedOrder.orderNumber,
        customerName: req.user.name,
        customerEmail: req.user.email,
        totalAmount: populatedOrder.totalPrice,
        itemsCount: populatedOrder.orderItems.length,
        status: 'pending',
        message: `New order received from ${req.user.name}`,
        timestamp: new Date()
      });
      console.log(`✅ New order notification sent to sellers: ${populatedOrder.orderNumber}`);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order from cart error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating order',
      error: process.env.NODE_ENV === 'development' ? error.stack : error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    // Validate order items and update stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${item.name}`
        });
      }

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    // Send confirmation email
    await sendEmail({
      email: req.user.email,
      subject: emailTemplates.orderConfirmation(populatedOrder, req.user).subject,
      html: emailTemplates.orderConfirmation(populatedOrder, req.user).html
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price weightInKg specifications sku')
      .populate('cancelledBy', 'name email role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order, is admin, or is seller
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';
    
    if (!isOwner && !isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address
    };

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order paid successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order to paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order payment'
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = 'delivered';

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order delivered successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order to delivered error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order delivery'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user orders'
    });
  }
};

// @desc    Get seller dashboard statistics with growth
// @route   GET /api/orders/seller/stats
// @access  Private/Seller
const getSellerStats = async (req, res) => {
  try {
    console.log('Fetching seller statistics with growth...');
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Get all orders
    const allOrders = await Order.find().sort({ createdAt: -1 });
    
    // Today's orders
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfToday);
    const yesterdayOrders = allOrders.filter(o => 
      new Date(o.createdAt) >= startOfYesterday && new Date(o.createdAt) < startOfToday
    );
    
    // This month's orders
    const thisMonthOrders = allOrders.filter(o => new Date(o.createdAt) >= startOfThisMonth);
    const lastMonthOrders = allOrders.filter(o => 
      new Date(o.createdAt) >= startOfLastMonth && new Date(o.createdAt) <= endOfLastMonth
    );
    
    // Calculate revenue - ONLY COUNT WHEN MONEY IS ACTUALLY RECEIVED
    // For Razorpay: order must be isPaid=true (payment received online)
    // For COD: order must be delivered (cash received from customer)
    const isOrderPaid = (order) => {
      const isCOD = ['cash_on_delivery', 'cod', 'COD'].includes(order.paymentMethod);
      const status = order.status || order.orderStatus;
      
      // Razorpay/Prepaid orders: must be actually paid (money received)
      if (!isCOD) {
        return order.isPaid === true;
      }
      
      // COD orders: only count when delivered (cash received from customer)
      return status === 'delivered';
    };
    
    const totalRevenue = allOrders
      .filter(o => {
        const paid = isOrderPaid(o);
        if (paid) {
          console.log(`✅ Counting order ${o.orderNumber}: ₹${o.totalPrice || o.totalAmount} (isPaid=${o.isPaid}, status=${o.orderStatus}, method=${o.paymentMethod})`);
        } else {
          console.log(`❌ NOT counting order ${o.orderNumber}: (isPaid=${o.isPaid}, status=${o.orderStatus}, method=${o.paymentMethod})`);
        }
        return paid;
      })
      .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
    const todayRevenue = todayOrders
      .filter(o => isOrderPaid(o))
      .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
    const yesterdayRevenue = yesterdayOrders
      .filter(o => isOrderPaid(o))
      .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
    const thisMonthRevenue = thisMonthOrders
      .filter(o => isOrderPaid(o))
      .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
    const lastMonthRevenue = lastMonthOrders
      .filter(o => isOrderPaid(o))
      .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
    
    // Calculate growth percentages
    const revenueGrowth = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : todayRevenue > 0 ? 100 : 0;
      
    const ordersGrowth = yesterdayOrders.length > 0
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(1)
      : todayOrders.length > 0 ? 100 : 0;
      
    const monthlyRevenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : thisMonthRevenue > 0 ? 100 : 0;
    
    // Order status counts
    const pendingOrders = allOrders.filter(o => (o.status || o.orderStatus) === 'pending').length;
    const confirmedOrders = allOrders.filter(o => (o.status || o.orderStatus) === 'confirmed').length;
    const processingOrders = allOrders.filter(o => (o.status || o.orderStatus) === 'processing').length;
    const shippedOrders = allOrders.filter(o => (o.status || o.orderStatus) === 'shipped').length;
    const deliveredOrders = allOrders.filter(o => (o.status || o.orderStatus) === 'delivered').length;
    const cancelledOrders = allOrders.filter(o => (o.status || o.orderStatus) === 'cancelled').length;
    
    // Count paid orders (including valid COD orders)
    const paidOrdersCount = allOrders.filter(o => isOrderPaid(o)).length;
    
    const stats = {
      totalOrders: allOrders.length,
      totalRevenue,
      paidOrders: paidOrdersCount,
      todayOrders: todayOrders.length,
      todayRevenue,
      thisMonthOrders: thisMonthOrders.length,
      thisMonthRevenue,
      revenueGrowth: parseFloat(revenueGrowth),
      ordersGrowth: parseFloat(ordersGrowth),
      monthlyRevenueGrowth: parseFloat(monthlyRevenueGrowth),
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      averageOrderValue: paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0
    };
    
    console.log('Seller stats calculated:', stats);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching seller stats'
    });
  }
};

// @desc    Confirm order
// @route   PUT /api/orders/:id/confirm
// @access  Private/Seller
const confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be confirmed'
      });
    }
    
    order.orderStatus = 'processing';
    order.statusHistory.push({
      status: 'processing',
      timestamp: new Date(),
      note: 'Order confirmed and processing',
      updatedBy: req.user._id
    });
    
    await order.save();
    
    // Send confirmation email to customer
    try {
      const emailService = require('../services/emailService');
      await emailService.sendOrderConfirmation(order, order.user);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Order confirmed successfully',
      data: order
    });
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming order'
    });
  }
};

// @desc    Get courier rates for an order
// @route   GET /api/orders/:id/courier-rates
// @access  Private/Seller
const getCourierRates = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'name weightInKg specifications sku');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const shipmojoService = require('../services/shipmojoService');
    
    if (!shipmojoService.isConfigured()) {
      console.log('⚠️  Shipmojo not configured, returning empty rates');
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Shipmojo not configured. Using simulation mode.'
      });
    }

    console.log(`📊 Fetching courier rates for order ${order.orderNumber}`);
    
    // Allow custom weight/dimensions from query params for recalculation
    const customWeight = req.query.weight ? parseFloat(req.query.weight) : null;
    const customLength = req.query.length ? parseFloat(req.query.length) : null;
    const customBreadth = req.query.breadth ? parseFloat(req.query.breadth) : null;
    const customHeight = req.query.height ? parseFloat(req.query.height) : null;
    
    // Create order data with custom dimensions if provided
    const orderData = {
      ...order.toObject(),
      packageWeight: customWeight || order.packageWeight,
      packageLength: customLength || order.packageLength || 30,
      packageBreadth: customBreadth || order.packageBreadth || 20,
      packageHeight: customHeight || order.packageHeight || 15
    };
    
    if (customWeight) {
      console.log(`📦 Using custom weight: ${customWeight} kg`);
    }
    
    try {
      // Add timeout to prevent hanging
      const ratesPromise = shipmojoService.getCourierRates(orderData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), 8000)
      );
      
      const rates = await Promise.race([ratesPromise, timeoutPromise]);
      
      res.status(200).json({
        success: true,
        data: rates
      });
    } catch (rateError) {
      console.error('❌ Courier rates API error:', rateError.message);
      
      // Return empty rates on error - don't block shipment creation
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Unable to fetch courier rates. You can still create shipment in simulation mode.',
        error: rateError.message
      });
    }
  } catch (error) {
    console.error('❌ Get courier rates error:', error);
    console.error('Error details:', error.message);
    
    // Always return success with empty rates - don't block the UI
    res.status(200).json({
      success: true,
      data: [],
      message: 'Courier rates unavailable. Using simulation mode.'
    });
  }
};

// @desc    Create Shipmojo shipment
// @route   POST /api/orders/:id/ship
// @access  Private/Seller
const createShipment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name weightInKg specifications sku');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Allow shipping for confirmed or processing orders
    if (!['confirmed', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot ship order with status: ${order.orderStatus}. Order must be confirmed first.`
      });
    }

    // Update shipping address if provided in request body
    if (req.body && Object.keys(req.body).length > 0) {
      if (req.body.fullName) order.shippingAddress.fullName = req.body.fullName;
      if (req.body.phone) order.shippingAddress.phone = req.body.phone;
      if (req.body.email) order.shippingAddress.email = req.body.email;
      if (req.body.address) order.shippingAddress.address = req.body.address;
      if (req.body.city) order.shippingAddress.city = req.body.city;
      if (req.body.state) order.shippingAddress.state = req.body.state;
      if (req.body.postalCode) order.shippingAddress.postalCode = req.body.postalCode;
      if (req.body.country) order.shippingAddress.country = req.body.country;
      
      // Store package details if provided
      if (req.body.weight) order.packageWeight = req.body.weight;
      if (req.body.length) order.packageLength = req.body.length;
      if (req.body.breadth) order.packageBreadth = req.body.breadth;
      if (req.body.height) order.packageHeight = req.body.height;
      if (req.body.notes) order.shippingNotes = req.body.notes;
    }

    // Check if Shipmojo is configured
    const shipmojoService = require('../services/shipmojoService');
    let useShipmojo = false;
    
    try {
      useShipmojo = shipmojoService.isConfigured();
      console.log(`📦 Shipmojo configured: ${useShipmojo}`);
    } catch (error) {
      console.log('⚠️  Error checking Shipmojo configuration:', error.message);
      useShipmojo = false;
    }

    if (useShipmojo) {
      // Use real Shipmojo API
      try {
        console.log('🚀 Attempting Shipmojo API for shipment creation...');
        
        // Get selected courier from request body (if provided)
        const selectedCourier = req.body.courierId || null;
        
        const shipmentData = await shipmojoService.createShipment(order, selectedCourier);
        
        // Update order with shipment details
        order.orderStatus = 'processing'; // Will change to 'shipped' when courier picks up
        order.shipmojoShipmentId = shipmentData.shipmentId; // Store Shipmojo order ID for webhook
        order.courierName = shipmentData.courierName;
        order.carrier = shipmentData.courierName;
        
        // AWB may not be available yet (generated after pickup)
        if (shipmentData.awbCode) {
          order.awbCode = shipmentData.awbCode;
          order.trackingNumber = shipmentData.awbCode;
        }
        
        if (shipmentData.estimatedDelivery) {
          order.expectedDeliveryDate = shipmentData.estimatedDelivery;
        }
        
        // Add to status history
        const statusNote = shipmentData.awbCode 
          ? `Shipment created with ${shipmentData.courierName}. AWB: ${shipmentData.awbCode}. Pickup scheduled.`
          : `Shipment created with ${shipmentData.courierName}. Pickup scheduled. AWB will be generated after pickup.`;
        
        order.statusHistory.push({
          status: 'processing',
          timestamp: new Date(),
          note: statusNote,
          updatedBy: req.user._id
        });
        
        await order.save();
        
        console.log(`✅ Shipmojo shipment created for order ${order.orderNumber}`);
        
        // Send shipment dispatch email
        try {
          await sendEmail({
            email: order.user.email,
            subject: emailTemplates.orderShipped(order, order.user).subject,
            html: emailTemplates.orderShipped(order, order.user).html
          });
        } catch (emailError) {
          console.log('Email notification failed:', emailError.message);
        }
        
        // Emit real-time update to customer and seller
        if (io) {
          // Notify customer
          io.to(`user_${order.user._id}`).emit('order_status_update', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: 'shipped',
            message: `Your order has been shipped via ${shipmentData.courierName}`,
            awbCode: shipmentData.awbCode,
            courierName: shipmentData.courierName,
            trackingUrl: shipmentData.trackingUrl,
            timestamp: new Date()
          });
          
          // Notify all sellers
          io.to('sellers').emit('order_update', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: 'shipped',
            action: 'shipped',
            awbCode: shipmentData.awbCode,
            courierName: shipmentData.courierName,
            timestamp: new Date()
          });
          
          console.log('📡 Real-time updates sent to customer and sellers');
        }
        
        return res.status(200).json({
          success: true,
          message: 'Shipment created successfully via Shipmozo',
          data: {
            order,
            awbCode: shipmentData.awbCode,
            courierName: shipmentData.courierName,
            trackingNumber: shipmentData.awbCode,
            trackingUrl: shipmentData.trackingUrl,
            labelUrl: shipmentData.labelUrl,
            manifestUrl: shipmentData.manifestUrl
          }
        });
      } catch (shipmojoError) {
        console.error('❌ Shipmojo API error:', shipmojoError.message);
        console.error('❌ Full error:', shipmojoError);
        
        // Fall back to simulation mode on API error
        console.log('⚠️  Falling back to simulation mode due to API error');
        useShipmojo = false;
      }
    }
    
    // Simulation mode (Shipmojo not configured)
    console.log('⚠️  Shipmojo not configured, using simulation mode');
    
    const awbCode = `SIM-${Date.now()}`;
    const courierName = 'Manual Shipment';
    
    order.orderStatus = 'processing';
    order.awbCode = awbCode;
    order.courierName = courierName;
    order.trackingNumber = awbCode;
    order.carrier = courierName;
    order.trackingUrl = null; // No tracking URL in simulation mode
    
    // Simulate expected delivery (5-7 days)
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 6);
    order.expectedDeliveryDate = expectedDelivery;
    
    // Add to status history
    order.statusHistory.push({
      status: 'processing',
      timestamp: new Date(),
      note: `Manual shipment created. Reference: ${awbCode}. Configure Shipmojo for automated tracking.`,
      updatedBy: req.user._id
    });
    
    await order.save();
    
    console.log(`✅ Shipment simulated for order ${order.orderNumber}`);
    
    // Send shipment dispatch email
    try {
      const orderWithUser = await Order.findById(order._id).populate('user', 'name email phone');
      const emailService = require('../services/emailService');
      await emailService.sendShipmentDispatch(orderWithUser, orderWithUser.user);
    } catch (emailError) {
      console.error('Failed to send shipment email:', emailError.message);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Shipment created successfully (Manual Mode)',
      data: {
        order,
        awbCode,
        courierName,
        expectedDeliveryDate: expectedDelivery,
        trackingUrl: null,
        note: '⚠️ Manual shipment mode. Configure Shipmojo credentials in .env for automated tracking and real courier integration.'
      }
    });
  } catch (error) {
    console.error('❌ Create shipment error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Server error while creating shipment';
    
    if (error.message === 'SHIPMOJO_NOT_CONFIGURED') {
      errorMessage = 'Shipmojo is not configured. Please add API credentials to .env file.';
    } else if (error.message.includes('postal code')) {
      errorMessage = 'Invalid shipping address. Please check the postal code.';
    } else if (error.message.includes('balance')) {
      errorMessage = 'Insufficient wallet balance in Shipmojo account.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Mark order as paid (for COD orders)
// @route   PUT /api/orders/:id/mark-paid
// @access  Private/Seller
const markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.paymentMethod !== 'COD') {
      return res.status(400).json({
        success: false,
        message: 'Only COD orders can be manually marked as paid'
      });
    }
    
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already marked as paid'
      });
    }
    
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = 'completed';
    
    // Add to status history
    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: 'Payment received (COD)',
      updatedBy: req.user._id
    });
    
    await order.save();
    
    console.log(`Order ${order.orderNumber} marked as paid`);

    // Emit Socket.IO event for real-time analytics update
    try {
      const io = req.app.get('io');
      if (io) {
        // Get all sellers
        const sellers = await User.find({ role: 'seller' });
        sellers.forEach(seller => {
          io.to(seller._id.toString()).emit('order-paid', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            amount: order.totalPrice
          });
        });
      }
    } catch (socketError) {
      console.log('Socket.IO emit failed (non-critical):', socketError.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'Order marked as paid successfully',
      data: order
    });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking order as paid'
    });
  }
};

// @desc    Mark order as delivered
// @route   PUT /api/orders/:id/mark-delivered
// @access  Private/Seller
const markAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (!['processing', 'shipped'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Only shipped or processing orders can be marked as delivered'
      });
    }
    
    order.orderStatus = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = new Date();
    
    // Add to status history
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      note: 'Order delivered to customer',
      updatedBy: req.user._id
    });
    
    await order.save();
    
    // Send delivery confirmation email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendOrderDelivered(order, order.user);
    } catch (emailError) {
      console.error('Failed to send delivery email:', emailError.message);
    }
    
    console.log(`Order ${order.orderNumber} marked as delivered`);
    
    res.status(200).json({
      success: true,
      message: 'Order marked as delivered successfully',
      data: order
    });
  } catch (error) {
    console.error('Mark as delivered error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking order as delivered'
    });
  }
};

// @desc    Mark order as shipped
// @route   PUT /api/orders/:id/mark-shipped
// @access  Private/Seller
const markAsShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.orderStatus = 'shipped';
    order.shippedAt = new Date();
    
    // Add to status history
    order.statusHistory.push({
      status: 'shipped',
      timestamp: new Date(),
      note: 'Order shipped to customer',
      updatedBy: req.user._id
    });
    
    await order.save();
    
    console.log(`Order ${order.orderNumber} marked as shipped`);
    
    res.status(200).json({
      success: true,
      message: 'Order marked as shipped',
      data: order
    });
  } catch (error) {
    console.error('Mark as shipped error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking order as shipped'
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('cancelledBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(query);
    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        orders: orders
      },
      pagination: {
        page: pageNum,
        pages,
        total,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, carrier } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');

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

    if (status === 'shipped' && !order.trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required when shipping order'
      });
    }

    const updatedOrder = await order.save();

    // Clear cart when order is delivered (for COD orders)
    if (status === 'delivered') {
      try {
        const Cart = require('../models/Cart');
        const cart = await Cart.findOne({ user: order.user._id });
        if (cart) {
          await cart.clearCart();
          console.log('✅ Cart cleared after order delivered');
        }
      } catch (cartError) {
        console.log('Cart clear failed (non-critical):', cartError.message);
      }
    }

    // Emit real-time update to both seller and customer
    const io = req.app.get('io');
    if (io) {
      // Emit to customer
      io.to(`user_${order.user._id}`).emit('order_status_updated', {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        oldStatus,
        newStatus: status,
        trackingNumber,
        carrier,
        message: `Your order #${updatedOrder.orderNumber} status changed from ${oldStatus} to ${status}`,
        timestamp: new Date()
      });

      // Emit to all sellers
      io.to('sellers').emit('order_status_updated', {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        customerName: order.user.name,
        oldStatus,
        newStatus: status,
        trackingNumber,
        carrier,
        message: `Order #${updatedOrder.orderNumber} status updated to ${status}`,
        timestamp: new Date()
      });

      console.log(`✅ Real-time update sent: Order #${updatedOrder.orderNumber} - ${oldStatus} → ${status}`);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin/seller
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';
    
    if (!isOwner && !isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Sellers can cancel orders at more stages than customers
    if (isSeller || isAdmin) {
      // Sellers/Admins can cancel orders that are not yet shipped or delivered
      if (['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel order that has been shipped or delivered'
        });
      }
    } else {
      // Customers can only cancel pending/confirmed orders
      if (!order.canBeCancelled()) {
        return res.status(400).json({
          success: false,
          message: 'Order cannot be cancelled at this stage. Please contact support.'
        });
      }
    }

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = req.body.reason;
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;
    
    // Determine who cancelled the order
    const cancelledBy = isSeller ? 'seller' : isAdmin ? 'admin' : 'customer';
    
    // Add to status history
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Order cancelled by ${cancelledBy}. Reason: ${req.body.reason || 'Not specified'}`,
      updatedBy: req.user._id
    });
    
    // Initiate refund if order was paid
    if (order.isPaid && order.totalPrice > 0) {
      order.refundStatus = 'pending';
      order.refundAmount = order.totalPrice;
      order.refundMethod = 'original_payment';
      order.refundInitiatedAt = new Date();
      order.refundNotes = 'Refund initiated automatically upon order cancellation';
    }

    const updatedOrder = await order.save();

    // Emit real-time update to customer and seller
    const io = req.app.get('io');
    if (io) {
      // Notify customer
      io.to(`user_${order.user}`).emit('order_status_update', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'cancelled',
        message: 'Your order has been cancelled',
        timestamp: new Date()
      });
      
      // Notify all sellers
      io.to('sellers').emit('order_update', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'cancelled',
        action: 'cancelled',
        timestamp: new Date()
      });
      
      console.log('📡 Real-time cancellation updates sent');
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get customer statistics
// @route   GET /api/orders/my-stats
// @access  Private
const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('Fetching stats for user:', userId);
    
    // Get all orders for the user - use orderItems not items
    const orders = await Order.find({ user: userId })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for user`);
    
    // Calculate statistics - only count orders where payment is actually received
    // For prepaid: order must be isPaid=true
    // For COD: order must be delivered (customer paid on delivery)
    const totalSpent = orders.reduce((sum, order) => {
      const orderTotal = order.totalPrice || order.totalAmount || 0;
      const status = order.status || order.orderStatus;
      const isCOD = ['cash_on_delivery', 'cod', 'COD'].includes(order.paymentMethod);
      
      // Only count if:
      // 1. Razorpay and isPaid=true (payment received online)
      // 2. COD and delivered (cash received from customer)
      const shouldCount = order.isPaid || (isCOD && status === 'delivered');
      
      if (shouldCount) {
        console.log(`Order ${order._id}: Counting ₹${orderTotal} (isPaid=${order.isPaid}, status=${status}, method=${order.paymentMethod})`);
        return sum + orderTotal;
      } else {
        console.log(`Order ${order._id}: NOT counting (isPaid=${order.isPaid}, status=${status}, method=${order.paymentMethod})`);
        return sum;
      }
    }, 0);
    
    console.log(`Total spent calculated: ₹${totalSpent} (only paid orders)`);
    
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => {
        const status = o.status || o.orderStatus;
        return status === 'pending' || status === 'processing';
      }).length,
      completedOrders: orders.filter(o => {
        const status = o.status || o.orderStatus;
        return status === 'delivered';
      }).length,
      cancelledOrders: orders.filter(o => {
        const status = o.status || o.orderStatus;
        return status === 'cancelled';
      }).length,
      totalSpent: totalSpent,
      paidOrders: orders.filter(o => {
        const status = o.status || o.orderStatus;
        const isCOD = ['cash_on_delivery', 'cod', 'COD'].includes(o.paymentMethod);
        return o.isPaid || (isCOD && status === 'delivered');
      }).length,
      averageOrderValue: orders.filter(o => {
        const status = o.status || o.orderStatus;
        const isCOD = ['cash_on_delivery', 'cod', 'COD'].includes(o.paymentMethod);
        return o.isPaid || (isCOD && status === 'delivered');
      }).length > 0 ? totalSpent / orders.filter(o => {
        const status = o.status || o.orderStatus;
        const isCOD = ['cash_on_delivery', 'cod', 'COD'].includes(o.paymentMethod);
        return o.isPaid || (isCOD && status === 'delivered');
      }).length : 0,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
      memberSince: req.user.createdAt,
      customerStatus: orders.length > 10 ? 'VIP' : orders.length > 5 ? 'Regular' : 'New'
    };
    
    // Get product categories purchased - with safety checks
    const productCategories = new Set();
    let totalProducts = 0;
    
    orders.forEach(order => {
      // Use orderItems not items
      if (order.orderItems && Array.isArray(order.orderItems)) {
        totalProducts += order.orderItems.length;
        order.orderItems.forEach(item => {
          if (item.product && item.product.category) {
            productCategories.add(item.product.category);
          }
        });
      }
    });
    
    stats.categoriesPurchased = Array.from(productCategories);
    stats.totalProducts = totalProducts;
    
    console.log('Stats calculated:', stats);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get my stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Calculate delivery charges
// @route   POST /api/orders/calculate-delivery
// @access  Private
const calculateDelivery = async (req, res) => {
  try {
    const { city, state, pincode, items } = req.body;
    
    if (!city || !state || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'City, state, and items are required'
      });
    }

    const { calculateDeliveryCharges } = require('../utils/deliveryCalculator');

    // Calculate delivery charges based on pincode only
    const deliveryInfo = calculateDeliveryCharges(pincode);

    res.status(200).json({
      success: true,
      data: deliveryInfo
    });

  } catch (error) {
    console.error('Calculate delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate delivery charges',
      error: error.message
    });
  }
};

// @desc    Request product return
// @route   POST /api/orders/:id/return
// @access  Private/Customer
const requestReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to return this order'
      });
    }

    // Check if order can be returned
    if (!order.canBeReturned()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be returned. Returns are only allowed within 7 days of delivery.'
      });
    }

    // Update order with return request
    order.returnRequested = true;
    order.returnReason = req.body.reason || 'Not specified';
    order.returnRequestedAt = new Date();
    order.returnStatus = 'requested';
    order.returnNotes = req.body.notes || '';

    // Add to status history
    order.statusHistory.push({
      status: 'return_requested',
      timestamp: new Date(),
      note: `Return requested by customer. Reason: ${order.returnReason}`,
      updatedBy: req.user._id
    });

    await order.save();

    // Send email notification to customer
    try {
      await sendEmail({
        email: order.user.email,
        subject: emailTemplates.returnRequested(order, order.user).subject,
        html: emailTemplates.returnRequested(order, order.user).html
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    // Emit real-time update to sellers
    const io = req.app.get('io');
    if (io) {
      io.to('sellers').emit('return_requested', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.user.name,
        returnReason: order.returnReason,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Return request submitted successfully. Seller will review your request.',
      data: order
    });
  } catch (error) {
    console.error('Request return error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while requesting return'
    });
  }
};

// @desc    Approve return and create reverse pickup
// @route   POST /api/orders/:id/return/approve
// @access  Private/Seller/Admin
const approveReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name weightInKg specifications sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.returnStatus !== 'requested') {
      return res.status(400).json({
        success: false,
        message: 'No pending return request for this order'
      });
    }

    // Update return status
    order.returnStatus = 'approved';
    order.returnApprovedAt = new Date();
    order.returnApprovedBy = req.user._id;

    // Add to status history
    order.statusHistory.push({
      status: 'return_approved',
      timestamp: new Date(),
      note: 'Return request approved by seller. Reverse pickup will be scheduled.',
      updatedBy: req.user._id
    });

    // Create reverse pickup with Shipmozo
    const shipmojoService = require('../services/shipmojoService');
    
    try {
      if (shipmojoService.isConfigured()) {
        console.log('🚀 Creating reverse pickup with Shipmozo...');
        
        const reversePickup = await shipmojoService.createReversePickup(order);
        
        order.returnShipmentId = reversePickup.shipmentId;
        order.returnAwbCode = reversePickup.awbCode;
        order.returnCourierName = reversePickup.courierName;
        order.returnTrackingUrl = reversePickup.trackingUrl;
        order.returnPickupScheduledAt = reversePickup.pickupScheduledAt;
        order.returnStatus = 'picked_up';

        // Add to status history
        order.statusHistory.push({
          status: 'return_pickup_scheduled',
          timestamp: new Date(),
          note: `Reverse pickup scheduled with ${reversePickup.courierName}. AWB: ${reversePickup.awbCode}`,
          updatedBy: req.user._id
        });

        console.log(`✅ Reverse pickup created for order ${order.orderNumber}`);
      }
    } catch (shipmojoError) {
      console.error('❌ Shipmozo reverse pickup error:', shipmojoError.message);
      // Continue even if Shipmozo fails - seller can arrange pickup manually
    }

    await order.save();

    // Send email notification to customer
    try {
      await sendEmail({
        email: order.user.email,
        subject: emailTemplates.returnApproved(order, order.user).subject,
        html: emailTemplates.returnApproved(order, order.user).html
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    // Emit real-time update to customer
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.user._id}`).emit('return_approved', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        returnAwbCode: order.returnAwbCode,
        returnCourierName: order.returnCourierName,
        returnTrackingUrl: order.returnTrackingUrl,
        message: 'Your return request has been approved. Courier will pick up the product soon.',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Return approved and reverse pickup scheduled successfully',
      data: {
        order,
        returnAwbCode: order.returnAwbCode,
        returnCourierName: order.returnCourierName,
        returnTrackingUrl: order.returnTrackingUrl
      }
    });
  } catch (error) {
    console.error('Approve return error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving return'
    });
  }
};

// @desc    Reject return request
// @route   POST /api/orders/:id/return/reject
// @access  Private/Seller/Admin
const rejectReturn = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.returnStatus !== 'requested') {
      return res.status(400).json({
        success: false,
        message: 'No pending return request for this order'
      });
    }

    order.returnStatus = 'rejected';
    order.returnRejectionReason = req.body.reason || 'Not specified';

    // Add to status history
    order.statusHistory.push({
      status: 'return_rejected',
      timestamp: new Date(),
      note: `Return request rejected. Reason: ${order.returnRejectionReason}`,
      updatedBy: req.user._id
    });

    await order.save();

    // Send email notification to customer
    try {
      await sendEmail({
        email: order.user.email,
        subject: emailTemplates.returnRejected(order, order.user).subject,
        html: emailTemplates.returnRejected(order, order.user).html
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    // Emit real-time update to customer
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.user._id}`).emit('return_rejected', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        rejectionReason: order.returnRejectionReason,
        message: 'Your return request has been rejected.',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Return request rejected',
      data: order
    });
  } catch (error) {
    console.error('Reject return error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting return'
    });
  }
};

// @desc    Mark return as received and process refund
// @route   POST /api/orders/:id/return/received
// @access  Private/Seller/Admin
const markReturnReceived = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.returnStatus !== 'picked_up' && order.returnStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Return must be picked up before marking as received'
      });
    }

    // Mark as received
    order.returnStatus = 'received';
    order.returnReceivedAt = new Date();

    // Add to status history
    order.statusHistory.push({
      status: 'return_received',
      timestamp: new Date(),
      note: 'Returned product received at warehouse. Inspection in progress.',
      updatedBy: req.user._id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Return marked as received. You can now process the refund.',
      data: order
    });
  } catch (error) {
    console.error('Mark return received error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking return as received'
    });
  }
};

// @desc    Process refund for returned order
// @route   POST /api/orders/:id/refund
// @access  Private/Seller/Admin
const processRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.returnStatus !== 'received') {
      return res.status(400).json({
        success: false,
        message: 'Product must be received before processing refund'
      });
    }

    if (order.refundStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Refund already processed for this order'
      });
    }

    const refundAmount = req.body.refundAmount || order.totalPrice;
    const refundNotes = req.body.notes || 'Product returned and inspected. Refund approved.';

    // Update refund details
    order.refundStatus = 'processing';
    order.refundAmount = refundAmount;
    order.refundMethod = 'original_payment';
    order.refundInitiatedAt = new Date();
    order.refundNotes = refundNotes;
    order.returnStatus = 'refunded';

    // Process refund based on payment method
    if (order.paymentMethod === 'razorpay' && order.paymentResult?.id) {
      try {
        // Razorpay refund integration
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Create refund
        const refund = await razorpay.payments.refund(order.paymentResult.id, {
          amount: Math.round(refundAmount * 100), // Convert to paise
          notes: {
            order_id: order.orderNumber,
            reason: 'Product return'
          }
        });

        order.refundTransactionId = refund.id;
        order.refundStatus = 'completed';
        order.refundCompletedAt = new Date();

        console.log(`✅ Razorpay refund processed: ${refund.id}`);
      } catch (razorpayError) {
        console.error('Razorpay refund error:', razorpayError);
        order.refundStatus = 'failed';
        order.refundNotes += ` | Razorpay error: ${razorpayError.message}`;
      }
    } else if (['cash_on_delivery', 'cod', 'COD'].includes(order.paymentMethod)) {
      // For COD, mark as manual refund (bank transfer)
      order.refundStatus = 'processing';
      order.refundMethod = 'bank_transfer';
      order.refundNotes += ' | COD order - Manual bank transfer required. Please collect customer bank details.';
    } else {
      // For other payment methods, mark as manual processing
      order.refundStatus = 'processing';
      order.refundNotes += ' | Manual refund processing required.';
    }

    // Add to status history
    order.statusHistory.push({
      status: 'refund_processed',
      timestamp: new Date(),
      note: `Refund ${order.refundStatus}: ₹${refundAmount}. ${refundNotes}`,
      updatedBy: req.user._id
    });

    await order.save();

    // Send refund email to customer
    try {
      await sendEmail({
        email: order.user.email,
        subject: emailTemplates.refundProcessed(order, order.user).subject,
        html: emailTemplates.refundProcessed(order, order.user).html
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    // Emit real-time update to customer
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${order.user._id}`).emit('refund_processed', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        refundAmount: refundAmount,
        refundStatus: order.refundStatus,
        message: order.refundStatus === 'completed' 
          ? 'Your refund has been processed successfully!' 
          : 'Your refund is being processed.',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: order.refundStatus === 'completed' 
        ? 'Refund processed successfully!' 
        : 'Refund initiated. Manual processing may be required.',
      data: {
        order,
        refundAmount,
        refundStatus: order.refundStatus,
        refundTransactionId: order.refundTransactionId
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  createOrderFromCart,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  getMyStats,
  getSellerStats,
  confirmOrder,
  getCourierRates,
  createShipment,
  markAsShipped,
  markAsPaid,
  markAsDelivered,
  requestReturn,
  approveReturn,
  rejectReturn,
  markReturnReceived,
  processRefund,
  calculateDelivery
};