const Product = require('../models/Product');
const Review = require('../models/Review');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      rating,
      featured,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { 'rating.average': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limitNum);

    // Log image URLs for debugging
    if (products.length > 0) {
      console.log('📦 Products fetched:', products.length);
      console.log('🖼️ Sample product images:', products[0]?.images);
    }

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        pages,
        total,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
      stock: { $gt: 0 }
    }).limit(4);

    // Get reviews for this product
    const reviews = await Review.find({ 
      product: product._id,
      isActive: true 
    })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        product,
        relatedProducts,
        reviews
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully (soft delete)'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

// @desc    Permanently delete product and its images
// @route   DELETE /api/products/:id/permanent
// @access  Private/Admin
const permanentDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log(`🗑️  Permanently deleting product: ${product.name}`);
    
    // Delete images from Cloudinary
    const deletedImages = [];
    const failedImages = [];
    
    if (product.images && product.images.length > 0) {
      console.log(`📸 Deleting ${product.images.length} images from Cloudinary...`);
      
      for (const imageUrl of product.images) {
        try {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) {
            const result = await deleteImage(publicId);
            if (result.result === 'ok') {
              deletedImages.push(publicId);
              console.log(`✅ Deleted image: ${publicId}`);
            } else {
              failedImages.push({ publicId, reason: result.result });
              console.log(`⚠️  Failed to delete image: ${publicId} - ${result.result}`);
            }
          } else {
            failedImages.push({ url: imageUrl, reason: 'Could not extract public ID' });
            console.log(`⚠️  Could not extract public ID from: ${imageUrl}`);
          }
        } catch (error) {
          failedImages.push({ url: imageUrl, reason: error.message });
          console.error(`❌ Error deleting image ${imageUrl}:`, error.message);
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);
    
    // Also delete related reviews
    await Review.deleteMany({ product: req.params.id });

    console.log(`✅ Product ${product.name} permanently deleted`);

    res.json({
      success: true,
      message: 'Product and images permanently deleted',
      data: {
        productId: req.params.id,
        productName: product.name,
        imagesDeleted: deletedImages.length,
        imagesFailed: failedImages.length,
        deletedImages,
        failedImages: failedImages.length > 0 ? failedImages : undefined
      }
    });
  } catch (error) {
    console.error('Permanent delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while permanently deleting product',
      error: process.env.NODE_ENV === 'development' ? error.stack : error.message
    });
  }
};

// @desc    Clean up orphaned images from Cloudinary
// @route   POST /api/products/cleanup-images
// @access  Private/Admin
const cleanupOrphanedImages = async (req, res) => {
  try {
    console.log('🧹 Starting orphaned images cleanup...');
    
    // Get all products with images
    const products = await Product.find({ images: { $exists: true, $not: { $size: 0 } } });
    
    // Collect all image URLs from products
    const usedImageUrls = new Set();
    products.forEach(product => {
      if (product.images) {
        product.images.forEach(imageUrl => {
          usedImageUrls.add(imageUrl);
        });
      }
    });
    
    console.log(`📊 Found ${usedImageUrls.size} images in use across ${products.length} products`);
    
    // Note: To get all images from Cloudinary, you'd need to use the Admin API
    // This is a basic implementation that focuses on cleaning up known orphaned images
    
    res.json({
      success: true,
      message: 'Image cleanup analysis completed',
      data: {
        productsScanned: products.length,
        imagesInUse: usedImageUrls.size,
        note: 'This is a basic analysis. Full cleanup requires Cloudinary Admin API access.'
      }
    });
  } catch (error) {
    console.error('Cleanup orphaned images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image cleanup',
      error: process.env.NODE_ENV === 'development' ? error.stack : error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.getFeatured().limit(8);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products'
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.getByCategory(req.params.category);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products by category'
    });
  }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: product._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      product: product._id,
      rating: Number(rating),
      title,
      comment,
      isVerified: true // Assuming purchase verification is done
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  permanentDeleteProduct,
  cleanupOrphanedImages,
  getFeaturedProducts,
  getProductsByCategory,
  addProductReview
};