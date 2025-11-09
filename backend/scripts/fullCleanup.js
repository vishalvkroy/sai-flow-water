const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const fullCleanup = async () => {
  try {
    console.log('🧹 Starting Full System Cleanup...\n');
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!\n');

    // Import models
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const User = require('../models/User');

    // ============ STEP 1: Delete All Orders ============
    console.log('📦 STEP 1: Cleaning up orders...');
    const orderCount = await Order.countDocuments();
    console.log(`   Found ${orderCount} orders`);
    
    if (orderCount > 0) {
      await Order.deleteMany({});
      console.log(`   ✅ Deleted all ${orderCount} orders\n`);
    } else {
      console.log('   ✅ No orders to delete\n');
    }

    // ============ STEP 2: Keep Only One Product ============
    console.log('🛍️  STEP 2: Cleaning up products...');
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`   Found ${products.length} products`);
    
    if (products.length > 1) {
      // Keep the first product (most recent)
      const keepProduct = products[0];
      const deleteIds = products.slice(1).map(p => p._id);
      
      await Product.deleteMany({ _id: { $in: deleteIds } });
      
      console.log(`   ✅ Kept product: "${keepProduct.name}"`);
      console.log(`   ✅ Deleted ${deleteIds.length} other products\n`);
    } else if (products.length === 1) {
      console.log(`   ✅ Already have only 1 product: "${products[0].name}"\n`);
    } else {
      console.log('   ⚠️  No products found!\n');
    }

    // ============ STEP 3: Clean up test users (keep only seller and one customer) ============
    console.log('👥 STEP 3: Cleaning up test users...');
    const users = await User.find();
    console.log(`   Found ${users.length} users`);
    
    // Keep seller and one customer
    const seller = users.find(u => u.role === 'seller');
    const customer = users.find(u => u.role === 'customer');
    
    const keepUserIds = [seller?._id, customer?._id].filter(Boolean);
    const deleteUserIds = users.filter(u => !keepUserIds.includes(u._id)).map(u => u._id);
    
    if (deleteUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: deleteUserIds } });
      console.log(`   ✅ Kept ${keepUserIds.length} users (seller + 1 customer)`);
      console.log(`   ✅ Deleted ${deleteUserIds.length} test users\n`);
    } else {
      console.log('   ✅ User database is clean\n');
    }

    // ============ SUMMARY ============
    console.log('═══════════════════════════════════════');
    console.log('✨ CLEANUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`📦 Orders: ${orderCount} → 0`);
    console.log(`🛍️  Products: ${products.length} → 1`);
    console.log(`👥 Users: ${users.length} → ${keepUserIds.length}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('✅ Database is now clean and ready!');
    console.log('🚀 You can restart your application now.\n');

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
fullCleanup();
