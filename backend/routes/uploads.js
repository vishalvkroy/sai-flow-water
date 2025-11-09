const express = require('express');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Upload file
// @route   POST /api/uploads
// @access  Private
router.post('/', protect, upload.single('file'), handleUploadErrors, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.filename,
      path: `/uploads/${req.file.path.split('uploads/')[1]}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

// @desc    Upload multiple files
// @route   POST /api/uploads/multiple
// @access  Private
router.post('/multiple', protect, upload.array('files', 10), handleUploadErrors, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload files'
    });
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    path: `/uploads/${file.path.split('uploads/')[1]}`,
    size: file.size,
    mimetype: file.mimetype
  }));

  res.json({
    success: true,
    message: 'Files uploaded successfully',
    data: files
  });
});

module.exports = router;