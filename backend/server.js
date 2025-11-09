const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load dotenv only in development (Render sets env vars directly)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Log environment check
console.log('🔍 Environment Check:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   SHIPMOJO_PUBLIC_KEY: ${process.env.SHIPMOJO_PUBLIC_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET'}`);
console.log('');

const app = express();

// Security Middleware with relaxed CSP for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(compression());

// Rate Limiting (More permissive for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests in dev, 100 in production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:52584', // Browser preview URL
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Allow any origin from local network (192.168.x.x) on port 3000 or 3001
    const localNetworkPattern = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(3000|3001)$/;
    
    if (allowedOrigins.indexOf(origin) !== -1 || localNetworkPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Database Connection
const connectDB = require('./config/database');
connectDB();

// Initialize Cloudinary
console.log('\n📸 Initializing Cloudinary...');
const { verifyCloudinaryConfig } = require('./config/cloudinary');
verifyCloudinaryConfig();

// Initialize Shipmozo Service
console.log('\n🚀 Initializing Shipmozo Service...');
const shipmojoService = require('./services/shipmojoService');
if (shipmojoService.isConfigured()) {
  shipmojoService.verifyCredentials().then(verified => {
    if (verified) {
      console.log('✅ Shipmozo is ready for production use!\n');
    } else {
      console.log('⚠️  Shipmozo credentials invalid - using simulation mode\n');
    }
  }).catch(err => {
    console.log('⚠️  Shipmozo verification failed - using simulation mode\n');
  });
} else {
  console.log('⚠️  Shipmozo not configured - using simulation mode\n');
}

// Routes
console.log('🔧 Loading routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/bookings', require('./routes/bookings'));
console.log('✅ Loading services route...');
app.use('/api/services', require('./routes/services'));
console.log('✅ Services route loaded successfully!');
app.use('/api/payments', require('./routes/payments'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/call-requests', require('./routes/callRequest'));
app.use('/api/saved-addresses', require('./routes/savedAddress'));
app.use('/api/location', require('./routes/location'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/webhooks', require('./routes/shipmojoWebhook'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
console.log('✅ All routes loaded!');

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// Test route to verify services route is loaded
app.get('/api/test-services', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Services route is loaded! Backend has been restarted.',
    timestamp: new Date().toISOString()
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Join user-specific room (for customers)
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Customer ${userId} joined room`);
  });

  // Join seller room for real-time updates
  socket.on('join_seller', (sellerId) => {
    socket.join(`seller_${sellerId}`);
    socket.join('sellers'); // Join general sellers room
    console.log(`👤 Seller ${sellerId} joined rooms: seller_${sellerId} and sellers`);
  });

  // Handle new orders from client
  socket.on('new_order', (orderData) => {
    // Broadcast to all sellers
    io.to('sellers').emit('new_order', orderData);
    console.log('📦 New order broadcasted to sellers:', orderData.orderNumber);
  });

  // Handle order status updates (from Shiprocket/manual)
  socket.on('order_status_update', (updateData) => {
    const { orderId, userId, status, trackingNumber } = updateData;
    
    // Notify specific customer
    io.to(`user_${userId}`).emit('order_status_updated', updateData);
    
    // Notify all sellers
    io.to('sellers').emit('order_status_updated', updateData);
    
    console.log(`✅ Order status update broadcasted: ${orderId} → ${status}`);
  });

  // Handle product updates
  socket.on('product_update', (productData) => {
    // Broadcast to all connected clients
    io.emit('product_update', productData);
    console.log('🔄 Product update broadcasted:', productData.productId);
  });

  // Handle tracking updates from Shiprocket webhook
  socket.on('tracking_update', (trackingData) => {
    const { orderId, userId, status, location } = trackingData;
    
    // Notify customer
    io.to(`user_${userId}`).emit('tracking_updated', trackingData);
    
    // Notify sellers
    io.to('sellers').emit('tracking_updated', trackingData);
    
    console.log(`📍 Tracking update: Order ${orderId} - ${status} at ${location}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Trying to kill existing process...`);
    process.exit(1);
  } else {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Export io for use in controllers
module.exports = { io };