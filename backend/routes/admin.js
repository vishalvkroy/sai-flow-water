const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { protect, authorize } = require('../middleware/auth');

// Sample products data
const sampleProducts = [
  {
    name: 'RO Water Purifier 7L',
    description: 'Advanced RO technology with 7-stage purification process. Removes 99.9% of contaminants including bacteria, viruses, heavy metals, and dissolved salts. Perfect for homes with high TDS water.',
    shortDescription: 'Advanced RO technology with 7-stage purification process',
    price: 12999,
    originalPrice: 15999,
    category: 'reverse-osmosis',
    features: [
      '7-stage purification process',
      'RO + UV + UF technology',
      'TDS controller',
      'Mineral cartridge',
      'Auto-flush system',
      'Storage tank: 7 liters'
    ],
    specifications: {
      filtrationStages: 7,
      filterLife: '6-12 months',
      flowRate: '15 LPH',
      dimensions: '350 x 180 x 450 mm',
      weight: '8 kg',
      warranty: '1 year comprehensive + 5 years free service',
      technology: 'RO + UV + UF'
    },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=400&fit=crop&crop=center&auto=format&q=80'
    ],
    stock: 25,
    weightInKg: 8,
    shipping: {
      isFreeShipping: true,
      shippingCharge: 0
    },
    sku: 'RO-7L-001',
    brand: 'Sai Flow Water',
    rating: {
      average: 4.5,
      count: 128
    },
    tags: ['RO', 'UV', 'UF', 'TDS Controller', 'Home'],
    isFeatured: true,
    isActive: true,
    meta: {
      title: 'RO Water Purifier 7L - Advanced 7-Stage Purification',
      description: 'Buy RO Water Purifier with 7-stage purification, UV+UF technology, TDS controller. Free installation in Aurangabad.',
      keywords: ['RO water purifier', '7 stage', 'UV UF', 'TDS controller', 'Aurangabad']
    }
  },
  {
    name: 'UV Water Filter 10L',
    description: 'UV sterilization technology with activated carbon filter. Ideal for low TDS water. Kills 99.99% of bacteria and viruses without removing essential minerals.',
    shortDescription: 'UV sterilization with activated carbon filter',
    price: 8999,
    originalPrice: 10999,
    category: 'countertop',
    features: [
      'UV sterilization chamber',
      'Activated carbon filter',
      'Pre-filter for sediments',
      'UV lamp life indicator',
      'Transparent storage tank',
      'Storage capacity: 10 liters'
    ],
    specifications: {
      filtrationStages: 3,
      filterLife: '6 months',
      flowRate: '2 LPM',
      dimensions: '300 x 250 x 400 mm',
      weight: '5 kg',
      warranty: '1 year comprehensive',
      technology: 'UV + Carbon'
    },
    images: [
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center&auto=format&q=80'
    ],
    stock: 30,
    weightInKg: 5,
    shipping: {
      isFreeShipping: true,
      shippingCharge: 0
    },
    sku: 'UV-10L-002',
    brand: 'Sai Flow Water',
    rating: {
      average: 4.2,
      count: 89
    },
    tags: ['UV', 'Carbon Filter', 'Low TDS', 'Countertop'],
    isFeatured: true,
    isActive: true,
    meta: {
      title: 'UV Water Filter 10L - UV Sterilization Technology',
      description: 'Buy UV Water Filter with activated carbon, ideal for low TDS water. Free installation in Aurangabad.',
      keywords: ['UV water filter', 'carbon filter', 'low TDS', 'sterilization', 'Aurangabad']
    }
  },
  {
    name: 'Alkaline Water Purifier',
    description: 'Advanced alkaline water purifier with essential minerals retention. Increases pH level to 8.5-9.5 for better health benefits. Multi-stage filtration with mineral enhancement.',
    shortDescription: 'Alkaline water with essential minerals retention',
    price: 15999,
    originalPrice: 18999,
    category: 'reverse-osmosis',
    features: [
      'Alkaline enhancement',
      'Mineral retention technology',
      '8-stage purification',
      'pH level: 8.5-9.5',
      'Antioxidant properties',
      'Storage tank: 8 liters'
    ],
    specifications: {
      filtrationStages: 8,
      filterLife: '8-12 months',
      flowRate: '12 LPH',
      dimensions: '380 x 200 x 480 mm',
      weight: '10 kg',
      warranty: '1 year comprehensive + 5 years free service',
      technology: 'RO + Alkaline + Mineral'
    },
    images: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center&auto=format&q=80'
    ],
    stock: 15,
    weightInKg: 10,
    shipping: {
      isFreeShipping: true,
      shippingCharge: 0
    },
    sku: 'ALK-8L-003',
    brand: 'Sai Flow Water',
    rating: {
      average: 4.7,
      count: 156
    },
    tags: ['Alkaline', 'Mineral', 'pH Enhancement', 'Health'],
    isFeatured: true,
    isActive: true,
    meta: {
      title: 'Alkaline Water Purifier - pH Enhancement Technology',
      description: 'Buy Alkaline Water Purifier with mineral retention, pH 8.5-9.5. Free installation in Aurangabad.',
      keywords: ['alkaline water purifier', 'pH enhancement', 'mineral retention', 'health benefits', 'Aurangabad']
    }
  },
  {
    name: 'Whole House Water Filter',
    description: 'Complete whole house water filtration system. Filters water at the main entry point. Protects all appliances and provides clean water throughout the house.',
    shortDescription: 'Complete whole house filtration system',
    price: 25999,
    originalPrice: 29999,
    category: 'whole-house',
    features: [
      'Main line installation',
      'High flow rate',
      'Sediment removal',
      'Chlorine reduction',
      'Scale prevention',
      'Protects appliances'
    ],
    specifications: {
      filtrationStages: 3,
      filterLife: '12 months',
      flowRate: '15 GPM',
      dimensions: '500 x 200 x 600 mm',
      weight: '15 kg',
      warranty: '2 years comprehensive',
      technology: 'Multi-media filtration'
    },
    images: [
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop&crop=center&auto=format&q=80'
    ],
    stock: 8,
    weightInKg: 15,
    shipping: {
      isFreeShipping: true,
      shippingCharge: 0
    },
    sku: 'WH-3S-006',
    brand: 'Sai Flow Water',
    rating: {
      average: 4.6,
      count: 45
    },
    tags: ['Whole House', 'Main Line', 'High Flow', 'Appliance Protection'],
    isFeatured: true,
    isActive: true,
    meta: {
      title: 'Whole House Water Filter - Complete Home Filtration',
      description: 'Buy Whole House Water Filter system, protects all appliances with high flow rate. Free installation in Aurangabad.',
      keywords: ['whole house filter', 'main line', 'home filtration', 'appliance protection', 'Aurangabad']
    }
  }
];

// @desc    Add sample products to database
// @route   POST /api/admin/add-sample-products
// @access  Private/Admin
router.post('/add-sample-products', protect, authorize('admin', 'seller'), async (req, res) => {
  try {
    console.log('🔄 Admin request to add sample products...');
    
    // Use the authenticated user as the seller
    const seller = req.user;
    console.log(`✅ Using seller: ${seller.name} (${seller.email})`);

    // Check existing products
    const existingCount = await Product.countDocuments();
    console.log(`📦 Found ${existingCount} existing products`);

    // Add seller ID to each product
    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      seller: seller._id
    }));

    // Insert or update sample products
    const processedProducts = [];
    for (const productData of productsWithSeller) {
      try {
        // Check if product with same SKU exists
        const existingProduct = await Product.findOne({ sku: productData.sku });
        
        if (existingProduct) {
          console.log(`⚠️  Product with SKU ${productData.sku} already exists, updating...`);
          const updatedProduct = await Product.findByIdAndUpdate(
            existingProduct._id,
            productData,
            { new: true, runValidators: true }
          );
          processedProducts.push(updatedProduct);
        } else {
          console.log(`➕ Creating new product: ${productData.name}`);
          const newProduct = await Product.create(productData);
          processedProducts.push(newProduct);
        }
      } catch (error) {
        console.error(`❌ Error with product ${productData.name}:`, error.message);
      }
    }

    console.log(`✅ Successfully processed ${processedProducts.length} products`);

    // Test the featured products endpoint
    const featuredProducts = await Product.find({ 
      isFeatured: true, 
      isActive: true,
      stock: { $gt: 0 }
    }).limit(6);
    
    console.log(`✅ Featured products query returned: ${featuredProducts.length} products`);

    res.json({
      success: true,
      message: `Successfully processed ${processedProducts.length} sample products`,
      data: {
        processed: processedProducts.length,
        featured: featuredProducts.length,
        totalProducts: await Product.countDocuments(),
        products: processedProducts.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          isFeatured: p.isFeatured,
          isActive: p.isActive
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error adding sample products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sample products',
      error: error.message
    });
  }
});

// @desc    Clean up carts with null products
// @route   POST /api/admin/cleanup-carts
// @access  Private/Admin
router.post('/cleanup-carts', protect, authorize('admin', 'seller'), async (req, res) => {
  try {
    console.log('🧹 Admin request to cleanup carts...');

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

    console.log(`✅ Cleanup completed: ${cleanedCount} carts cleaned, ${itemsRemovedCount} items removed`);

    res.json({
      success: true,
      message: `Successfully cleaned up carts`,
      data: {
        cartsChecked: carts.length,
        cartsCleaned: cleanedCount,
        itemsRemoved: itemsRemovedCount
      }
    });

  } catch (error) {
    console.error('❌ Error cleaning up carts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup carts',
      error: error.message
    });
  }
});

module.exports = router;
