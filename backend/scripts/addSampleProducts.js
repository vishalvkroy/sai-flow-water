const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

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
    name: 'Under Sink Water Filter',
    description: 'Compact under-sink water filtration system. Space-saving design with powerful 5-stage filtration. Perfect for kitchens with limited counter space.',
    shortDescription: 'Compact under-sink filtration system',
    price: 6999,
    originalPrice: 8499,
    category: 'under-sink',
    features: [
      'Space-saving design',
      '5-stage filtration',
      'Easy installation',
      'Dedicated faucet',
      'Long filter life',
      'Compact size'
    ],
    specifications: {
      filtrationStages: 5,
      filterLife: '6-9 months',
      flowRate: '1.5 LPM',
      dimensions: '250 x 150 x 350 mm',
      weight: '3 kg',
      warranty: '1 year comprehensive',
      technology: 'Multi-stage Carbon'
    },
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center&auto=format&q=80'
    ],
    stock: 20,
    weightInKg: 3,
    shipping: {
      isFreeShipping: true,
      shippingCharge: 0
    },
    sku: 'US-5S-004',
    brand: 'Sai Flow Water',
    rating: {
      average: 4.3,
      count: 67
    },
    tags: ['Under Sink', 'Compact', 'Space Saving', 'Kitchen'],
    isFeatured: false,
    isActive: true,
    meta: {
      title: 'Under Sink Water Filter - Compact 5-Stage Filtration',
      description: 'Buy Under Sink Water Filter, space-saving design with 5-stage filtration. Free installation in Aurangabad.',
      keywords: ['under sink filter', 'compact', 'space saving', 'kitchen filter', 'Aurangabad']
    }
  },
  {
    name: 'Portable Water Purifier',
    description: 'Portable water purification bottle for travel and outdoor activities. Battery-powered UV sterilization. Perfect for camping, travel, and emergency use.',
    shortDescription: 'Portable UV sterilization bottle',
    price: 2999,
    originalPrice: 3999,
    category: 'portable',
    features: [
      'Battery powered',
      'UV-C LED sterilization',
      'Portable design',
      'BPA-free bottle',
      'USB rechargeable',
      'Capacity: 500ml'
    ],
    specifications: {
      filtrationStages: 1,
      filterLife: '1000 cycles',
      flowRate: 'Instant',
      dimensions: '70 x 70 x 250 mm',
      weight: '0.3 kg',
      warranty: '6 months',
      technology: 'UV-C LED'
    },
    images: [
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop&crop=center&auto=format&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center&auto=format&q=80'
    ],
    stock: 50,
    weightInKg: 0.3,
    shipping: {
      isFreeShipping: false,
      shippingCharge: 99
    },
    sku: 'PORT-UV-005',
    brand: 'Sai Flow Water',
    rating: {
      average: 4.1,
      count: 234
    },
    tags: ['Portable', 'Travel', 'UV-C', 'Battery', 'Outdoor'],
    isFeatured: false,
    isActive: true,
    meta: {
      title: 'Portable Water Purifier - UV-C LED Sterilization',
      description: 'Buy Portable Water Purifier bottle with UV-C LED, perfect for travel and outdoor activities.',
      keywords: ['portable water purifier', 'travel', 'UV-C LED', 'battery powered', 'outdoor']
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

const addSampleProducts = async () => {
  try {
    // Connect to MongoDB - use the same connection logic as the main app
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MongoDB URI not found in environment variables');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find a seller user (admin or seller role)
    const seller = await User.findOne({ 
      $or: [
        { role: 'admin' },
        { role: 'seller' }
      ]
    });

    if (!seller) {
      console.error('No seller/admin user found. Please create a seller account first.');
      process.exit(1);
    }

    console.log(`Using seller: ${seller.name} (${seller.email})`);

    // Clear existing products (optional)
    const existingCount = await Product.countDocuments();
    console.log(`Found ${existingCount} existing products`);

    // Add seller ID to each product
    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      seller: seller._id
    }));

    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithSeller);
    console.log(`✅ Successfully added ${insertedProducts.length} sample products`);

    // Display summary
    console.log('\n📦 Products Summary:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.isFeatured ? 'Featured' : 'Regular'})`);
    });

    console.log('\n🎯 Featured products:', insertedProducts.filter(p => p.isFeatured).length);
    console.log('📊 Total stock:', insertedProducts.reduce((sum, p) => sum + p.stock, 0));

  } catch (error) {
    console.error('Error adding sample products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  addSampleProducts();
}

module.exports = { addSampleProducts, sampleProducts };
