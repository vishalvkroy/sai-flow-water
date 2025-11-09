const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const User = require('../models/User');

const addProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arroh-water-filter');
    console.log('✅ Connected to MongoDB');

    // Get seller user
    const seller = await User.findOne({ email: 'seller@saiflowwater.com' });
    if (!seller) {
      console.error('❌ Seller user not found. Please run createSeller.js first.');
      process.exit(1);
    }
    console.log(`✅ Found seller: ${seller.name}`);

    // Check existing products
    const existingProducts = await Product.find();
    console.log(`\n📦 Found ${existingProducts.length} existing products`);

    // Professional water purifier products
    const products = [
      {
        name: 'RO Water Purifier 7L',
        shortDescription: 'Advanced 7-stage RO purification with mineral cartridge',
        description: 'Advanced 7-stage RO purification system with mineral cartridge. Removes 99.9% impurities, bacteria, and viruses. Perfect for homes and small offices.',
        price: 12999,
        seller: seller._id,
        category: 'reverse-osmosis',
        brand: 'Sai Flow Water',
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500',
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500'
        ],
        specifications: {
          capacity: '7 Liters',
          purificationStages: 7,
          technology: 'RO + UV + UF',
          warranty: '1 Year',
          powerConsumption: '24W'
        },
        features: [
          '7-stage purification',
          'Mineral cartridge',
          'UV sterilization',
          'Auto shut-off',
          'Low maintenance'
        ],
        isActive: true,
        isFeatured: true,
        sku: 'RO-7L-001'
      },
      {
        name: 'UV Water Purifier 10L',
        shortDescription: 'High-capacity UV purifier with 10L storage',
        description: 'High-capacity UV water purifier with 10L storage. Kills 99.99% bacteria and viruses using UV technology. Ideal for large families.',
        price: 8999,
        seller: seller._id,
        category: 'countertop',
        brand: 'Sai Flow Water',
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1563207153-f403bf289096?w=500',
          'https://images.unsplash.com/photo-1563207153-f403bf289096?w=500'
        ],
        specifications: {
          capacity: '10 Liters',
          purificationStages: 5,
          technology: 'UV + UF',
          warranty: '1 Year',
          powerConsumption: '18W'
        },
        features: [
          'UV sterilization',
          'Large capacity',
          'Energy efficient',
          'Easy maintenance',
          'Compact design'
        ],
        isActive: true,
        isFeatured: true,
        sku: 'UV-10L-001'
      },
      {
        name: 'Alkaline Water Purifier 8L',
        shortDescription: 'Premium alkaline purifier with mineral enrichment',
        description: 'Premium alkaline water purifier that adds essential minerals and maintains pH balance. Creates healthy alkaline water for better hydration.',
        price: 15999,
        seller: seller._id,
        category: 'countertop',
        brand: 'Sai Flow Water',
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',
          'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500'
        ],
        specifications: {
          capacity: '8 Liters',
          purificationStages: 8,
          technology: 'RO + UV + Alkaline',
          warranty: '2 Years',
          powerConsumption: '30W',
          pH: '8.5-9.5'
        },
        features: [
          'Alkaline technology',
          'Mineral enrichment',
          'pH balance',
          'Antioxidant water',
          'Premium build'
        ],
        isActive: true,
        isFeatured: true,
        sku: 'ALK-8L-001'
      },
      {
        name: 'Countertop Water Purifier 5L',
        shortDescription: 'Compact countertop purifier - no installation required',
        description: 'Compact countertop water purifier perfect for small spaces. No installation required, just plug and use. Ideal for apartments and offices.',
        price: 6999,
        seller: seller._id,
        category: 'countertop',
        brand: 'Sai Flow Water',
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500'
        ],
        specifications: {
          capacity: '5 Liters',
          purificationStages: 4,
          technology: 'UF + Carbon',
          warranty: '1 Year',
          powerConsumption: '12W'
        },
        features: [
          'No installation',
          'Portable design',
          'Space saving',
          'Easy to use',
          'Affordable'
        ],
        isActive: true,
        isFeatured: false,
        sku: 'CT-5L-001'
      },
      {
        name: 'Under Sink RO System 12L',
        shortDescription: 'Professional under-sink RO with 12L capacity',
        description: 'Professional under-sink RO system with 12L storage. Hidden installation saves counter space. Commercial-grade filtration.',
        price: 18999,
        seller: seller._id,
        category: 'reverse-osmosis',
        brand: 'Sai Flow Water',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500'
        ],
        specifications: {
          capacity: '12 Liters',
          purificationStages: 9,
          technology: 'RO + UV + UF + TDS',
          warranty: '2 Years',
          powerConsumption: '36W'
        },
        features: [
          'Under-sink installation',
          'Large capacity',
          'TDS controller',
          'Professional grade',
          'Space saving'
        ],
        isActive: true,
        isFeatured: true,
        sku: 'US-12L-001'
      },
      {
        name: 'Gravity Water Purifier 20L',
        shortDescription: 'Non-electric gravity purifier - 20L capacity',
        description: 'Non-electric gravity-based water purifier. No electricity required. Perfect for areas with power issues. Large 20L capacity.',
        price: 4999,
        seller: seller._id,
        category: 'portable',
        brand: 'Sai Flow Water',
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=500',
          'https://images.unsplash.com/photo-1523294587484-bae6cc870010?w=500'
        ],
        specifications: {
          capacity: '20 Liters',
          purificationStages: 3,
          technology: 'Gravity + Carbon',
          warranty: '6 Months',
          powerConsumption: '0W'
        },
        features: [
          'No electricity',
          'Large capacity',
          'Portable',
          'Low maintenance',
          'Budget friendly'
        ],
        isActive: true,
        isFeatured: false,
        sku: 'GR-20L-001'
      },
      {
        name: 'Smart RO Purifier 9L with WiFi',
        shortDescription: 'Smart WiFi-enabled RO with mobile app control',
        description: 'Smart water purifier with WiFi connectivity and mobile app. Monitor water quality, filter life, and get alerts on your phone.',
        price: 22999,
        seller: seller._id,
        category: 'reverse-osmosis',
        brand: 'Sai Flow Water',
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500'
        ],
        specifications: {
          capacity: '9 Liters',
          purificationStages: 10,
          technology: 'RO + UV + UF + Smart',
          warranty: '3 Years',
          powerConsumption: '40W',
          connectivity: 'WiFi'
        },
        features: [
          'WiFi enabled',
          'Mobile app',
          'Smart alerts',
          'Filter life indicator',
          'Premium features'
        ],
        isActive: true,
        isFeatured: true,
        sku: 'SM-9L-001'
      },
      {
        name: 'Commercial RO System 50L',
        shortDescription: 'Heavy-duty commercial RO - 50L/hour capacity',
        description: 'Heavy-duty commercial RO system for offices, restaurants, and institutions. 50L per hour capacity. Industrial-grade components.',
        price: 45999,
        seller: seller._id,
        category: 'reverse-osmosis',
        brand: 'Sai Flow Water',
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500',
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500'
        ],
        specifications: {
          capacity: '50 Liters/hour',
          purificationStages: 12,
          technology: 'Commercial RO + UV',
          warranty: '3 Years',
          powerConsumption: '120W'
        },
        features: [
          'Commercial grade',
          'High capacity',
          'Durable build',
          'Low maintenance',
          'Professional installation'
        ],
        isActive: true,
        isFeatured: false,
        sku: 'CM-50L-001'
      }
    ];

    // Add products
    let addedCount = 0;
    let skippedCount = 0;

    for (const productData of products) {
      // Check if product already exists by SKU
      const existing = await Product.findOne({ sku: productData.sku });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
        skippedCount++;
      } else {
        await Product.create(productData);
        console.log(`✅ Added: ${productData.name}`);
        addedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Added: ${addedCount} products`);
    console.log(`   ⏭️  Skipped: ${skippedCount} products (already exist)`);
    console.log(`   📦 Total products in database: ${existingProducts.length + addedCount}`);
    
    console.log('\n🎉 Products setup complete!');
    console.log('🔄 Refresh your seller dashboard to see all products!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addProducts();
