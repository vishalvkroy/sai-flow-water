const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllContacts,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.post('/', submitContactForm);

// Admin routes
router.get('/', protect, authorize('admin', 'seller'), getAllContacts);
router.put('/:id', protect, authorize('admin', 'seller'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
