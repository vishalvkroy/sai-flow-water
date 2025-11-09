const express = require('express');
const router = express.Router();
const {
  getSavedAddresses,
  getSavedAddress,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  getDefaultAddress
} = require('../controllers/savedAddressController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get default address (must be before /:id route)
router.get('/default', getDefaultAddress);

// Main CRUD routes
router.route('/')
  .get(getSavedAddresses)
  .post(createSavedAddress);

router.route('/:id')
  .get(getSavedAddress)
  .put(updateSavedAddress)
  .delete(deleteSavedAddress);

// Set default address
router.put('/:id/set-default', setDefaultAddress);

module.exports = router;
