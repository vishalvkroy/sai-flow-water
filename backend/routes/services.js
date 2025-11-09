const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createServiceBooking,
  getAllServiceBookings,
  getMyServiceBookings,
  getServiceBookingById,
  updateServiceStatus,
  cancelServiceBooking,
  addServiceFeedback,
  getServiceStats
} = require('../controllers/serviceController');
const {
  createServicePaymentOrder,
  verifyServicePayment,
  processServiceRefund,
  calculateServicePricing
} = require('../controllers/servicePaymentController');

// Specific routes first (before generic routes)
router.get('/stats/overview', protect, authorize('seller', 'admin'), getServiceStats);
router.get('/my', protect, getMyServiceBookings);

// Pricing calculation route
router.post('/calculate-pricing', protect, calculateServicePricing);

// General routes
router.post('/', protect, createServiceBooking);
router.get('/', protect, authorize('seller', 'admin'), getAllServiceBookings);

// ID-based routes
router.get('/:id', protect, getServiceBookingById);
router.put('/:id/status', protect, authorize('seller', 'admin'), updateServiceStatus);
router.put('/:id/cancel', protect, cancelServiceBooking);
router.put('/:id/feedback', protect, addServiceFeedback);

// Payment routes
router.post('/:id/payment/create-order', protect, createServicePaymentOrder);
router.post('/:id/payment/verify', protect, verifyServicePayment);
router.post('/:id/payment/refund', protect, processServiceRefund);

module.exports = router;
