const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        select: '-__v',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get user
    const user = await User.findById(req.user._id);

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    // Populate the wishlist for response
    await user.populate({
      path: 'wishlist',
      select: '-__v',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: user.wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      item => item.toString() !== productId
    );
    await user.save();

    // Populate the wishlist for response
    await user.populate({
      path: 'wishlist',
      select: '-__v',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: user.wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = [];
    await user.save();

    res.json({
      success: true,
      message: 'Wishlist cleared',
      data: []
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;
