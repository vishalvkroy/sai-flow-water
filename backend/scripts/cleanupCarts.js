const mongoose = require('mongoose');
const Cart = require('../models/Cart');
require('dotenv').config();

const cleanupCarts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MongoDB URI not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find all carts
    const carts = await Cart.find({});
    console.log(`📦 Found ${carts.length} carts to check`);

    let cleanedCount = 0;
    let itemsRemovedCount = 0;

    for (const cart of carts) {
      const originalItemsCount = cart.items.length;
      
      // Filter out items with null/undefined products
      cart.items = cart.items.filter(item => {
        if (!item.product) {
          console.log(`🗑️  Removing null product item from cart ${cart._id}`);
          itemsRemovedCount++;
          return false;
        }
        return true;
      });

      // If items were removed, save the cart
      if (cart.items.length !== originalItemsCount) {
        await cart.save();
        cleanedCount++;
        console.log(`✅ Cleaned cart ${cart._id}: removed ${originalItemsCount - cart.items.length} null items`);
      }
    }

    console.log(`\n🎯 Cleanup Summary:`);
    console.log(`   Carts cleaned: ${cleanedCount}`);
    console.log(`   Items removed: ${itemsRemovedCount}`);
    console.log(`   Total carts: ${carts.length}`);

  } catch (error) {
    console.error('❌ Error cleaning up carts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  cleanupCarts();
}

module.exports = { cleanupCarts };
