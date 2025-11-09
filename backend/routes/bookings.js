const express = require('express');
const {
  createBooking,
  getBookingById,
  getMyBookings,
  getBookings,
  updateBookingStatus,
  assignTechnician,
  updateBooking,
  cancelBooking,
  addBookingFeedback
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/feedback', protect, addBookingFeedback);

// Admin/Technician routes
router.get('/', protect, authorize('admin', 'technician'), getBookings);
router.put('/:id/status', protect, authorize('admin', 'technician'), updateBookingStatus);
router.put('/:id/assign', protect, authorize('admin'), assignTechnician);

module.exports = router;