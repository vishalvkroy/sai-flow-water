const express = require('express');
const router = express.Router();
const { upload, handleUploadErrors } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

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
        // Cloudinary provides the URL in file.path
        const url = file.path;
        console.log(`📸 Image uploaded to Cloudinary: ${url}`);
        console.log(`   Public ID: ${file.filename}`);
        console.log(`   File size: ${(file.size / 1024).toFixed(2)} KB`);
        return url;
      });

      console.log(`✅ ${fileUrls.length} images uploaded successfully to Cloudinary`);

      res.json({
        success: true,
        message: 'Images uploaded successfully to Cloudinary',
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

// @desc    Delete uploaded image from Cloudinary
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

    // Extract public ID from Cloudinary URL
    const publicId = getPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Cloudinary URL'
      });
    }

    // Delete from Cloudinary
    const result = await deleteImage(publicId);
    
    if (result.result === 'ok' || result.result === 'not found') {
      console.log(`🗑️ Image deleted from Cloudinary: ${publicId}`);
      res.json({
        success: true,
        message: 'Image deleted successfully from Cloudinary'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image from Cloudinary'
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

      // Cloudinary provides the URL in file.path
      const fileUrl = req.file.path;
      console.log(`📸 Avatar uploaded to Cloudinary: ${fileUrl}`);

      res.json({
        success: true,
        message: 'Avatar uploaded successfully to Cloudinary',
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
