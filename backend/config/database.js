const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Optimized for 100+ concurrent users
      serverSelectionTimeoutMS: 30000, // 30s timeout for server selection
      socketTimeoutMS: 60000, // 60s socket timeout (was 45s)
      maxPoolSize: 50, // Support up to 50 concurrent connections (was 10)
      minPoolSize: 5, // Maintain at least 5 connections (was 2)
      retryWrites: true, // Retry write operations
      retryReads: true, // Retry read operations
      connectTimeoutMS: 20000, // 20s connection timeout (was 10s)
      family: 4, // Use IPv4, skip trying IPv6
      maxIdleTimeMS: 60000, // Close idle connections after 60s
      heartbeatFrequencyMS: 10000, // Check server health every 10s
      compressors: ['zlib'], // Enable compression for better performance
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected - will attempt to reconnect automatically');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('⛔ MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️ Server will continue without database (using mock data)');
    // Don't exit, let server run with mock data
  }
};

module.exports = connectDB;