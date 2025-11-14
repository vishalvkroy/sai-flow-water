const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 10, featured, showAll } = req.query;
    
    // For sellers, show all products (active and inactive)
    // For customers, show only active products
    let query = {};
    if (showAll !== 'true') {
      query.isActive = true;
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter featured products
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price-low':
          sortOption = { price: 1 };
          break;
        case 'price-high':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { 'rating.average': -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(startIndex)
      .limit(parseInt(limit))
      .select('-__v')
      .populate('seller', 'name email');
    
    const total = await Product.countDocuments(query);
    const currentPage = parseInt(page);
    const totalPages = Math.ceil(total / limit);
    
    // Log active/inactive counts
    const activeCount = products.filter(p => p.isActive).length;
    const inactiveCount = products.filter(p => !p.isActive).length;
    console.log(`📦 GET /products - Returning ${products.length} products - Active: ${activeCount}, Inactive: ${inactiveCount}, showAll: ${showAll}`);
    
    res.json({
      success: true,
      count: products.length,
      data: products,
      pagination: {
        total,
        page: currentPage,
        pages: totalPages,
        limit: parseInt(limit),
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    console.log('🌟 Fetching featured products...');
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true,
      stock: { $gt: 0 }
    })
    .limit(6)
    .select('-__v')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} featured products`);
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    
    const product = await Product.findById(req.params.id)
      .select('-__v')
      .populate('seller', 'name email phone');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller only)
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    // Generate SKU if not provided
    if (!req.body.sku) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      req.body.sku = `SF-${timestamp}-${random}`;
    }

    const product = await Product.create({
      ...req.body,
      seller: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller only)
router.put('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    console.log('📝 Updating product:', req.params.id);
    console.log('📝 Update data:', req.body);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product updated successfully:', product.name, 'isActive:', product.isActive);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller only)
router.delete('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    // First, find the product to get image URLs
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`🗑️ Deleting product: ${product.name} with ${product.images?.length || 0} images`);

    // Delete images from Cloudinary
    const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
    const imageDeleteResults = [];

    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          if (imageUrl.includes('cloudinary.com')) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
              console.log(`🧹 Deleting Cloudinary image: ${publicId}`);
              const result = await deleteImage(publicId);
              imageDeleteResults.push({
                url: imageUrl,
                publicId: publicId,
                result: result.result,
                success: result.result === 'ok' || result.result === 'not found'
              });
            } else {
              console.warn(`⚠️ Could not extract public ID from: ${imageUrl}`);
              imageDeleteResults.push({
                url: imageUrl,
                success: false,
                error: 'Could not extract public ID'
              });
            }
          } else {
            console.log(`📁 Skipping non-Cloudinary image: ${imageUrl}`);
            imageDeleteResults.push({
              url: imageUrl,
              success: true,
              note: 'Non-Cloudinary image, skipped'
            });
          }
        } catch (imageError) {
          console.error(`❌ Error deleting image ${imageUrl}:`, imageError);
          imageDeleteResults.push({
            url: imageUrl,
            success: false,
            error: imageError.message
          });
        }
      }
    }

    // Now delete the product from database
    await Product.findByIdAndDelete(req.params.id);

    const successfulImageDeletes = imageDeleteResults.filter(r => r.success).length;
    const totalImages = imageDeleteResults.length;

    console.log(`✅ Product deleted successfully. Images: ${successfulImageDeletes}/${totalImages} deleted from Cloudinary`);
    
    res.json({
      success: true,
      message: 'Product and associated images deleted successfully',
      details: {
        productName: product.name,
        imagesDeleted: successfulImageDeletes,
        totalImages: totalImages,
        imageResults: imageDeleteResults
      }
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// @desc    Get seller's products
// @route   GET /api/products/seller/my-products
// @access  Private (Seller only)
router.get('/seller/my-products', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { seller: req.user._id };
    
    if (status) {
      query.isActive = status === 'active';
    }
    
    const startIndex = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Product.countDocuments(query);
    
    // Log active/inactive counts
    const activeCount = products.filter(p => p.isActive).length;
    const inactiveCount = products.filter(p => !p.isActive).length;
    console.log(`📦 Returning ${products.length} products - Active: ${activeCount}, Inactive: ${inactiveCount}`);
    
    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// Mount review routes
const reviewRoutes = require('./reviews');
router.use('/', reviewRoutes);

module.exports = router;