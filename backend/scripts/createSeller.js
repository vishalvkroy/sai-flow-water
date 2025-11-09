const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createSellerUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arroh-water-filter');
    console.log('Connected to MongoDB');

    // Check if seller already exists
    const existingSeller = await User.findOne({ email: 'saiflowwater2025@gmail.com' });
    if (existingSeller) {
      console.log('Seller user already exists');
      console.log('Email: saiflowwater2025@gmail.com');
      console.log('Password: seller123');
      process.exit(0);
    }

    // Create seller user
    const sellerUser = await User.create({
      name: 'Sai Flow Water Seller',
      email: 'saiflowwater2025@gmail.com',
      password: 'seller123',
      phone: '+91 8084924835',
      address: {
        street: 'Sai Flow Water Store',
        city: 'Aurangabad',
        state: 'Bihar',
        postalCode: '824101',
        country: 'India'
      },
      role: 'seller',
      emailVerified: true,
      isActive: true
    });

    console.log('✅ Seller user created successfully!');
    console.log('📧 Email: saiflowwater2025@gmail.com');
    console.log('🔑 Password: seller123');
    console.log('👤 Role: seller');
    console.log('📍 Location: Aurangabad, Bihar');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating seller user:', error.message);
    process.exit(1);
  }
};

createSellerUser();
