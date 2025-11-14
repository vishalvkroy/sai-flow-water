const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get seller's products with filters
// @route   GET /api/seller/products
// @access  Private (Seller only)
router.get('/products', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = { seller: req.user._id };
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Status filter
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'low-stock') {
        query.stock = { $lte: 5, $gt: 0 };
      } else if (status === 'out-of-stock') {
        query.stock = 0;
      }
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(startIndex)
      .limit(parseInt(limit))
      .select('-__v')
      .lean();
    
    const total = await Product.countDocuments(query);
    
    // Calculate statistics
    const stats = await Product.aggregate([
      { $match: { seller: req.user._id } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalStock: { $sum: '$stock' },
          lowStockCount: {
            $sum: { $cond: [{ $and: [{ $lte: ['$stock', 5] }, { $gt: ['$stock', 0] }] }, 1, 0] }
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      },
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

// @desc    Get single product by seller
// @route   GET /api/seller/products/:id
// @access  Private (Seller only)
router.get('/products/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    }).select('-__v');
    
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
// @route   POST /api/seller/products
// @access  Private (Seller only)
router.post('/products', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    // Generate SKU if not provided
    if (!req.body.sku) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      req.body.sku = `WF-${timestamp}-${random}`;
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
// @route   PUT /api/seller/products/:id
// @access  Private (Seller only)
router.put('/products/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    // Ensure seller can only update their own products
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
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
// @route   DELETE /api/seller/products/:id
// @access  Private (Seller only)
router.delete('/products/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    // First, find the product to get image URLs
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    });
    
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
    await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id
    });

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

// @desc    Toggle product status (active/inactive)
// @route   PATCH /api/seller/products/:id/toggle-status
// @access  Private (Seller only)
router.patch('/products/:id/toggle-status', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product.isActive = !product.isActive;
    await product.save();
    
    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: product
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product status',
      error: error.message
    });
  }
});

// @desc    Update product stock
// @route   PATCH /api/seller/products/:id/stock
// @access  Private (Seller only)
router.patch('/products/:id/stock', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { stock } = req.body;
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock value'
      });
    }
    
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { stock },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
});

// @desc    Bulk update products
// @route   PATCH /api/seller/products/bulk-update
// @access  Private (Seller only)
router.patch('/products/bulk-update', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { productIds, updates } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required'
      });
    }
    
    const result = await Product.updateMany(
      { 
        _id: { $in: productIds },
        seller: req.user._id
      },
      updates
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update products',
      error: error.message
    });
  }
});

// @desc    Get seller dashboard statistics
// @route   GET /api/seller/dashboard/stats
// @access  Private (Seller only)
router.get('/dashboard/stats', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    
    const stats = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      inactiveProducts: products.filter(p => !p.isActive).length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      lowStockProducts: products.filter(p => p.stock > 0 && p.stock <= 5).length,
      outOfStockProducts: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      categories: {}
    };
    
    // Group by category
    products.forEach(product => {
      if (!stats.categories[product.category]) {
        stats.categories[product.category] = 0;
      }
      stats.categories[product.category]++;
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;
