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
console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET'}`);
console.log('');

const app = express();

// Security Middleware with relaxed CSP for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(compression());

// Rate Limiting - Optimized for 100+ concurrent users
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per 15 minutes (~133 per minute) - Supports 100 concurrent users
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/api/health' || 
           req.path.startsWith('/uploads/') ||
           req.path.startsWith('/static/');
  },
  // Don't count successful requests against the limit as heavily
  skipSuccessfulRequests: false,
  skipFailedRequests: true, // Don't count failed requests
  // Store in memory (Redis would be better for production cluster)
  store: undefined // Uses default memory store
});
app.use(limiter);

// CORS Configuration - Allow specific origins
const allowedOrigins = [
  'https://saiflowwater.com',
  'https://www.saiflowwater.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow for now, just log
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-JSON', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Additional CORS headers for all responses (Fallback)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all for now
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    return res.sendStatus(200);
  }
  next();
});

// Body Parser Middleware - Increased for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 }));

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
app.use('/api/services', require('./routes/services'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/seller', require('./routes/seller'));
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
app.use('/api/contact', require('./routes/contact'));
console.log('✅ All routes loaded!');

// Verify Cloudinary Configuration
console.log('🔍 Verifying Cloudinary configuration...');
const { verifyCloudinaryConfig } = require('./config/cloudinary');
try {
  verifyCloudinaryConfig();
  console.log('✅ Cloudinary configuration verified!');
} catch (error) {
  console.error('❌ Cloudinary configuration error:', error.message);
  console.error('⚠️  Image uploads will fail without proper Cloudinary setup!');
}

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
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

// Create HTTP server and Socket.IO - Optimized for 100+ concurrent users
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Use same origins as REST API
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Performance optimizations for handling many concurrent connections
  pingTimeout: 60000, // 60 seconds - time to wait for pong response
  pingInterval: 25000, // 25 seconds - how often to send ping packets
  upgradeTimeout: 30000, // 30 seconds - time to wait for upgrade
  maxHttpBufferSize: 1e6, // 1MB - max message size
  // Connection limits
  transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
  allowUpgrades: true, // Allow transport upgrades
  // Performance tuning
  perMessageDeflate: {
    threshold: 1024 // Only compress messages > 1KB
  },
  httpCompression: {
    threshold: 1024 // Only compress > 1KB
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  const { userId, userType } = socket.handshake.auth;
  
  if (userId) {
    console.log(`👤 ${userType || 'User'} ${userId} connected`);
  }

  // Join user-specific room (for customers)
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`👤 Customer ${userId} joined room user_${userId}`);
    }
  });

  // Join seller room for real-time updates
  socket.on('join_seller', (sellerId) => {
    if (sellerId) {
      socket.join(`seller_${sellerId}`);
      socket.join('sellers'); // Join general sellers room
      console.log(`👤 Seller ${sellerId} joined rooms: seller_${sellerId} and sellers`);
    }
  });

  // Join general room
  socket.on('join_room', (roomName) => {
    if (roomName) {
      socket.join(roomName);
      console.log(`🏠 Socket ${socket.id} joined room: ${roomName}`);
    }
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

// HTTP Keep-Alive and Performance Optimizations
server.keepAliveTimeout = 65000; // 65 seconds (must be > load balancer timeout)
server.headersTimeout = 66000; // 66 seconds (must be > keepAliveTimeout)
server.maxConnections = 200; // Support 200 concurrent connections
server.timeout = 120000; // 120 seconds request timeout

// Log server configuration
console.log('⚙️  Server Configuration:');
console.log(`   Keep-Alive: ${server.keepAliveTimeout}ms`);
console.log(`   Max Connections: ${server.maxConnections}`);
console.log(`   Request Timeout: ${server.timeout}ms`);
console.log(`   Headers Timeout: ${server.headersTimeout}ms`);

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
  console.log(`🎯 Optimized for 100+ concurrent users`);
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