/**
 * Cleanup Script - Delete all customers (keep sellers) and all chatbot data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function cleanupDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Delete all customers (keep sellers and admins)
    console.log('🗑️  Deleting all customer accounts...');
    const customerResult = await User.deleteMany({ 
      role: { $nin: ['seller', 'admin'] } 
    });
    console.log(`✅ Deleted ${customerResult.deletedCount} customer accounts\n`);

    // 2. Delete all chatbot sessions
    console.log('🗑️  Deleting all chatbot sessions...');
    const ChatSession = mongoose.connection.collection('chatsessions');
    const chatResult = await ChatSession.deleteMany({});
    console.log(`✅ Deleted ${chatResult.deletedCount} chatbot sessions\n`);

    // 3. Show remaining users
    console.log('📊 Remaining users in database:');
    const remainingUsers = await User.find({}).select('name email role');
    console.log(`Total: ${remainingUsers.length} users\n`);
    
    remainingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDatabase();
