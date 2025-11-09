const express = require('express');
const router = express.Router();
const {
  createCallRequest,
  getAllCallRequests,
  getCallRequestStats,
  updateCallRequest,
  deleteCallRequest
} = require('../controllers/callRequestController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.post('/', optionalAuth, createCallRequest);

// Protected routes (Seller/Admin only)
router.get('/', protect, authorize('seller', 'admin'), getAllCallRequests);
router.get('/stats', protect, authorize('seller', 'admin'), getCallRequestStats);
router.put('/:id', protect, authorize('seller', 'admin'), updateCallRequest);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteCallRequest);

module.exports = router;
