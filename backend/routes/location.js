const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');
const { INDIAN_STATES, MAJOR_CITIES_BY_STATE, validatePincode } = require('../utils/indianStatesData');

// @desc    Get all Indian states
// @route   GET /api/location/states
// @access  Public
router.get('/states', (req, res) => {
  try {
    res.json({
      success: true,
      data: INDIAN_STATES
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching states'
    });
  }
});

// @desc    Get cities by state
// @route   GET /api/location/cities/:state
// @access  Public
router.get('/cities/:state', (req, res) => {
  try {
    const { state } = req.params;
    const cities = MAJOR_CITIES_BY_STATE[state] || [];
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cities'
    });
  }
});

// @desc    Reverse geocode - Get address from coordinates
// @route   POST /api/location/reverse-geocode
// @access  Public
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const addressData = await locationService.reverseGeocode(latitude, longitude);

    res.json({
      success: true,
      data: addressData
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting address from coordinates'
    });
  }
});

// @desc    Forward geocode - Get coordinates from address
// @route   POST /api/location/forward-geocode
// @access  Public
router.post('/forward-geocode', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const locationData = await locationService.forwardGeocode(address);

    if (!locationData) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: locationData
    });
  } catch (error) {
    console.error('Forward geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting coordinates from address'
    });
  }
});

// @desc    Get address from PIN code
// @route   GET /api/location/pincode/:pincode
// @access  Public
router.get('/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!validatePincode(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PIN code format. Must be 6 digits.'
      });
    }

    const addressData = await locationService.getAddressFromPincode(pincode);

    res.json({
      success: true,
      data: addressData
    });
  } catch (error) {
    console.error('PIN code lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting address from PIN code'
    });
  }
});

module.exports = router;
