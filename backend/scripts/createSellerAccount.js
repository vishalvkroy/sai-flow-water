/**
 * Create a Seller Account with Known Credentials
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createSeller() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Seller credentials
    const sellerData = {
      name: 'Sai Flow Water Admin',
      email: 'saiflowwater2025@gmail.com',
      password: 'Admin@123',
      phone: '8084924834',
      role: 'seller',
      isVerified: true
    };

    // Check if seller already exists
    const existingSeller = await User.findOne({ email: sellerData.email });
    
    if (existingSeller) {
      console.log('⚠️  Seller account already exists!');
      console.log(`📧 Email: ${existingSeller.email}`);
      console.log(`👤 Name: ${existingSeller.name}`);
      console.log(`🔑 Role: ${existingSeller.role}`);
      
      // Update password
      console.log('\n🔄 Updating password to: Admin@123');
      const salt = await bcrypt.genSalt(10);
      existingSeller.password = await bcrypt.hash('Admin@123', salt);
      await existingSeller.save();
      console.log('✅ Password updated successfully!');
    } else {
      // Create new seller
      console.log('🆕 Creating new seller account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(sellerData.password, salt);

      const seller = new User({
        name: sellerData.name,
        email: sellerData.email,
        password: hashedPassword,
        phone: sellerData.phone,
        role: sellerData.role,
        isVerified: sellerData.isVerified
      });

      await seller.save();
      console.log('✅ Seller account created successfully!');
    }

    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${sellerData.email}`);
    console.log(`🔑 Password: ${sellerData.password}`);
    console.log(`🌐 Login at: https://yourdomain.com/seller-login`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show all sellers
    console.log('👥 All Seller Accounts:');
    const allSellers = await User.find({ role: 'seller' }).select('name email phone');
    allSellers.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.name} (${seller.email}) - ${seller.phone}`);
    });

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSeller();
