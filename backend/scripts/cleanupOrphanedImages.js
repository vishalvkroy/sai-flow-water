const mongoose = require('mongoose');
const Product = require('../models/Product');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const cleanupOrphanedImages = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MongoDB URI not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all product images from database
    const products = await Product.find({}, 'images');
    const usedImages = new Set();
    
    products.forEach(product => {
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(imageUrl => {
          if (imageUrl && imageUrl.includes('cloudinary.com')) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
              usedImages.add(publicId);
            }
          }
        });
      }
    });

    console.log(`📊 Found ${usedImages.size} images in use across ${products.length} products`);

    // Get all images from Cloudinary folder
    console.log('🔍 Fetching images from Cloudinary...');
    const cloudinaryImages = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.search
        .expression('folder:arroh-water-filter')
        .sort_by([['created_at', 'desc']])
        .max_results(500)
        .next_cursor(nextCursor)
        .execute();

      cloudinaryImages.push(...result.resources);
      nextCursor = result.next_cursor;
      
      console.log(`📥 Fetched ${result.resources.length} images (total: ${cloudinaryImages.length})`);
    } while (nextCursor);

    console.log(`☁️ Total images in Cloudinary: ${cloudinaryImages.length}`);

    // Find orphaned images
    const orphanedImages = cloudinaryImages.filter(image => {
      return !usedImages.has(image.public_id);
    });

    console.log(`🗑️ Found ${orphanedImages.length} orphaned images`);

    if (orphanedImages.length === 0) {
      console.log('🎉 No orphaned images found! Your Cloudinary is clean.');
      return;
    }

    // Ask for confirmation
    console.log('\n📋 Orphaned images to be deleted:');
    orphanedImages.slice(0, 10).forEach((image, index) => {
      console.log(`   ${index + 1}. ${image.public_id} (${(image.bytes / 1024).toFixed(1)} KB)`);
    });
    
    if (orphanedImages.length > 10) {
      console.log(`   ... and ${orphanedImages.length - 10} more`);
    }

    // Calculate space savings
    const totalBytes = orphanedImages.reduce((sum, img) => sum + img.bytes, 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    console.log(`💾 Total space to be freed: ${totalMB} MB`);

    // In production, you might want to add a confirmation prompt here
    console.log('\n🚀 Starting cleanup...');

    let deletedCount = 0;
    let failedCount = 0;

    for (const image of orphanedImages) {
      try {
        const result = await deleteImage(image.public_id);
        if (result.result === 'ok') {
          deletedCount++;
          console.log(`✅ Deleted: ${image.public_id}`);
        } else {
          failedCount++;
          console.log(`❌ Failed to delete: ${image.public_id} - ${result.result}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ Error deleting ${image.public_id}:`, error.message);
      }
    }

    console.log(`\n🎯 Cleanup Summary:`);
    console.log(`   ✅ Successfully deleted: ${deletedCount} images`);
    console.log(`   ❌ Failed to delete: ${failedCount} images`);
    console.log(`   💾 Space freed: ~${((deletedCount / orphanedImages.length) * totalMB).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  cleanupOrphanedImages();
}

module.exports = { cleanupOrphanedImages };
