const SavedAddress = require('../models/SavedAddress');

// @desc    Get all saved addresses for logged-in user
// @route   GET /api/saved-addresses
// @access  Private
exports.getSavedAddresses = async (req, res) => {
  try {
    const addresses = await SavedAddress.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    console.error('Get saved addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved addresses'
    });
  }
};

// @desc    Get single saved address
// @route   GET /api/saved-addresses/:id
// @access  Private
exports.getSavedAddress = async (req, res) => {
  try {
    const address = await SavedAddress.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Get saved address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch address'
    });
  }
};

// @desc    Create new saved address
// @route   POST /api/saved-addresses
// @access  Private
exports.createSavedAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      alternatePhone,
      email,
      address,
      landmark,
      city,
      state,
      postalCode,
      country,
      addressType,
      isDefault,
      label
    } = req.body;

    // Validation
    if (!fullName || !phone || !email || !address || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate phone numbers
    const phoneRegex = /^[0-9+\s-()]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    if (alternatePhone && !phoneRegex.test(alternatePhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid alternate phone number'
      });
    }

    // Validate postal code
    if (!/^[0-9]{6}$/.test(postalCode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit postal code'
      });
    }

    // If this is the first address, make it default
    const addressCount = await SavedAddress.countDocuments({ user: req.user._id });
    const shouldBeDefault = addressCount === 0 || isDefault;

    const savedAddress = await SavedAddress.create({
      user: req.user._id,
      fullName,
      phone,
      alternatePhone,
      email,
      address,
      landmark,
      city,
      state,
      postalCode,
      country: country || 'India',
      addressType: addressType || 'Home',
      isDefault: shouldBeDefault,
      label
    });

    res.status(201).json({
      success: true,
      message: 'Address saved successfully',
      data: savedAddress
    });
  } catch (error) {
    console.error('Create saved address error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save address'
    });
  }
};

// @desc    Update saved address
// @route   PUT /api/saved-addresses/:id
// @access  Private
exports.updateSavedAddress = async (req, res) => {
  try {
    let address = await SavedAddress.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Validate phone numbers if provided
    const phoneRegex = /^[0-9+\s-()]{10,15}$/;
    if (req.body.phone && !phoneRegex.test(req.body.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    if (req.body.alternatePhone && !phoneRegex.test(req.body.alternatePhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid alternate phone number'
      });
    }

    // Validate postal code if provided
    if (req.body.postalCode && !/^[0-9]{6}$/.test(req.body.postalCode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit postal code'
      });
    }

    address = await SavedAddress.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Update saved address error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update address'
    });
  }
};

// @desc    Delete saved address
// @route   DELETE /api/saved-addresses/:id
// @access  Private
exports.deleteSavedAddress = async (req, res) => {
  try {
    const address = await SavedAddress.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If deleted address was default, make another address default
    if (wasDefault) {
      const nextAddress = await SavedAddress.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete saved address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
};

// @desc    Set address as default
// @route   PUT /api/saved-addresses/:id/set-default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await SavedAddress.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove default from all other addresses
    await SavedAddress.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address'
    });
  }
};

// @desc    Get default address
// @route   GET /api/saved-addresses/default
// @access  Private
exports.getDefaultAddress = async (req, res) => {
  try {
    const address = await SavedAddress.findOne({
      user: req.user._id,
      isDefault: true
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No default address found'
      });
    }

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default address'
    });
  }
};
