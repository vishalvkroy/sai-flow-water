const express = require('express');
const { getCustomers, getCustomerById } = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Seller/Admin routes - require seller or admin authorization
router.get('/', protect, authorize('admin', 'seller'), getCustomers);
router.get('/:id', protect, authorize('admin', 'seller'), getCustomerById);

module.exports = router;
