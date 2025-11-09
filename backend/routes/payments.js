const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentMethods
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/methods', protect, getPaymentMethods);

module.exports = router;