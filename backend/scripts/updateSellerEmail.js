const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const updateSellerEmail = async () => {
  try {
    console.log('📧 Updating Seller Email...\n');
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!\n');

    const User = require('../models/User');

    // Find the seller
    const seller = await User.findOne({ role: 'seller' });

    if (!seller) {
      console.log('❌ No seller found in database!');
      console.log('💡 Run createSeller.js first to create a seller account.\n');
      process.exit(1);
    }

    console.log('👤 Current Seller:');
    console.log(`   Name: ${seller.name}`);
    console.log(`   Email: ${seller.email}`);
    console.log(`   Phone: ${seller.phone}\n`);

    // Update email
    const oldEmail = seller.email;
    const newEmail = 'saiflowwater2025@gmail.com';

    seller.email = newEmail;
    await seller.save();

    console.log('✅ Seller email updated successfully!');
    console.log(`   Old: ${oldEmail}`);
    console.log(`   New: ${newEmail}\n`);

    console.log('🔐 Login Credentials:');
    console.log(`   Email: ${newEmail}`);
    console.log(`   Password: seller123 (default)\n`);

    console.log('💡 You can now login with the new email address!\n');

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
updateSellerEmail();
