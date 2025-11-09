const express = require('express');
const router = express.Router();
const { upload, handleUploadErrors } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// @desc    Upload product images
// @route   POST /api/upload/products
// @access  Private (Seller only)
router.post(
  '/products',
  protect,
  authorize('seller', 'admin'),
  upload.array('productImages', 10),
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const fileUrls = req.files.map(file => {
        const url = `/uploads/products/${file.filename}`;
        console.log(`📸 Image uploaded: ${url}`);
        console.log(`   File path: ${file.path}`);
        console.log(`   File size: ${(file.size / 1024).toFixed(2)} KB`);
        return url;
      });

      console.log(`✅ ${fileUrls.length} images uploaded successfully`);

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: fileUrls
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message
      });
    }
  }
);

// @desc    Delete uploaded image
// @route   DELETE /api/upload/delete
// @access  Private (Seller only)
router.delete('/delete', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    const folder = imageUrl.includes('/products/') ? 'products' : 'general';
    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// @desc    Upload single avatar image
// @route   POST /api/upload/avatar
// @access  Private
router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  handleUploadErrors,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileUrl = `/uploads/avatars/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: fileUrl
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
        error: error.message
      });
    }
  }
);

module.exports = router;
