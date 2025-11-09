const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSellerDashboardStats,
  getCustomerDashboardStats
} = require('../controllers/analyticsController');

// Seller analytics
router.get('/seller-dashboard', protect, authorize('seller', 'admin'), getSellerDashboardStats);

// Customer analytics
router.get('/customer-dashboard', protect, getCustomerDashboardStats);

module.exports = router;
