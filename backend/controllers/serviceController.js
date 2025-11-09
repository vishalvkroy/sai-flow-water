const ServiceBooking = require('../models/ServiceBooking');
const User = require('../models/User');
const emailService = require('../services/emailService');

// @desc    Create new service booking
// @route   POST /api/services
// @access  Private
const createServiceBooking = async (req, res) => {
  try {
    console.log('📝 Creating service booking...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?._id);

    const {
      serviceType,
      productType,
      issueDescription,
      preferredDate,
      preferredTimeSlot,
      address,
      distance,
      customerCoordinates,
      termsAccepted
    } = req.body;

    // Validate required fields
    if (!serviceType || !productType || !issueDescription || !preferredDate || !preferredTimeSlot || !address) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Please accept the terms and conditions'
      });
    }

    // Validate distance
    if (!distance || distance < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid distance is required'
      });
    }

    // Get warehouse coordinates (Aurangabad, Bihar)
    const warehouseCoordinates = {
      latitude: 24.7536,
      longitude: 84.3742
    };

    // Create service booking
    const serviceBooking = new ServiceBooking({
      user: req.user._id,
      serviceType,
      productType,
      issueDescription,
      preferredDate,
      preferredTimeSlot,
      address,
      distanceFromWarehouse: distance,
      warehouseCoordinates,
      customerCoordinates: customerCoordinates || { latitude: 0, longitude: 0 },
      termsAccepted,
      termsAcceptedAt: new Date(),
      status: 'pending',
      paymentStatus: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Service booking created - Awaiting payment'
      }]
    });

    // Calculate pricing based on distance
    serviceBooking.calculateServiceCost();

    const createdBooking = await serviceBooking.save();

    // Populate user data
    const populatedBooking = await ServiceBooking.findById(createdBooking._id)
      .populate('user', 'name email phone');

    console.log(`✅ Service booking created: ${populatedBooking.bookingNumber}`);
    console.log(`💰 Pricing: Total ₹${populatedBooking.serviceCost}, Advance ₹${populatedBooking.advanceAmount}`);

    res.status(201).json({
      success: true,
      message: 'Service booking created successfully. Please complete the advance payment to confirm.',
      data: populatedBooking
    });
  } catch (error) {
    console.error('❌ Create service booking error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create service booking',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all service bookings (for seller)
// @route   GET /api/services
// @access  Private/Seller
const getAllServiceBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const bookings = await ServiceBooking.find(query)
      .populate('user', 'name email phone')
      .populate('cancelledBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ServiceBooking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get service bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service bookings'
    });
  }
};

// @desc    Get my service bookings
// @route   GET /api/services/my
// @access  Private
const getMyServiceBookings = async (req, res) => {
  try {
    const bookings = await ServiceBooking.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get my service bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your service bookings'
    });
  }
};

// @desc    Get service booking by ID
// @route   GET /api/services/:id
// @access  Private
const getServiceBookingById = async (req, res) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('cancelledBy', 'name email role');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Service booking not found'
      });
    }

    // Check if user owns this booking or is seller
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get service booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service booking'
    });
  }
};

// @desc    Update service booking status
// @route   PUT /api/services/:id/status
// @access  Private/Seller
const updateServiceStatus = async (req, res) => {
  try {
    const { status, note, assignedTechnician, scheduledDate, serviceCost } = req.body;

    const booking = await ServiceBooking.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Service booking not found'
      });
    }

    // Update status
    if (status) {
      booking.status = status;
      booking.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated to ${status}`,
        updatedBy: req.user._id
      });
    }

    // Assign technician
    if (assignedTechnician) {
      booking.assignedTechnician = assignedTechnician;
      
      // Send technician assigned email
      try {
        await emailService.sendTechnicianAssignedEmail(booking, assignedTechnician);
      } catch (emailError) {
        console.error('Email sending failed (non-critical):', emailError.message);
      }
    }

    // Schedule date
    if (scheduledDate) {
      booking.scheduledDate = scheduledDate;
    }

    // Service cost
    if (serviceCost !== undefined) {
      booking.serviceCost = serviceCost;
    }

    // Mark as completed
    if (status === 'completed') {
      booking.completedDate = new Date();
      
      // Send service completed email
      try {
        await emailService.sendServiceCompletedEmail(booking);
      } catch (emailError) {
        console.error('Email sending failed (non-critical):', emailError.message);
      }
    }

    await booking.save();

    console.log(`✅ Service booking ${booking.bookingNumber} updated to ${status}`);

    res.json({
      success: true,
      message: 'Service booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service booking'
    });
  }
};

// @desc    Cancel service booking
// @route   PUT /api/services/:id/cancel
// @access  Private
const cancelServiceBooking = async (req, res) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Service booking not found'
      });
    }

    // Check if user owns this booking or is seller/admin
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isSeller = req.user.role === 'seller';
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    // Calculate refund if advance payment was made
    let refundInfo = null;
    if (booking.paymentStatus === 'advance_paid') {
      const refundDetails = booking.calculateRefund();
      if (refundDetails) {
        refundInfo = {
          originalAmount: refundDetails.amount,
          cancellationFee: refundDetails.deductedAmount,
          refundAmount: refundDetails.refundedAmount,
          message: `₹${refundDetails.refundedAmount} will be refunded (₹${refundDetails.deductedAmount} cancellation fee deducted)`
        };
        
        // Update payment status to indicate refund is pending
        booking.paymentStatus = 'refund_pending';
      }
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    if (req.body.reason) {
      booking.cancellationReason = req.body.reason;
    }
    
    // Determine who cancelled
    const cancelledBy = isSeller ? 'seller' : isAdmin ? 'admin' : 'customer';
    const cancellationNote = req.body.reason 
      ? `Cancelled by ${cancelledBy}. Reason: ${req.body.reason}`
      : `Cancelled by ${cancelledBy}`;
    
    booking.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: cancellationNote,
      updatedBy: req.user._id
    });

    await booking.save();

    console.log(`✅ Service booking ${booking.bookingNumber} cancelled`);

    res.json({
      success: true,
      message: refundInfo 
        ? `Service booking cancelled. ${refundInfo.message}` 
        : 'Service booking cancelled successfully',
      data: {
        booking,
        refundInfo
      }
    });
  } catch (error) {
    console.error('Cancel service booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel service booking'
    });
  }
};

// @desc    Add rating and feedback
// @route   PUT /api/services/:id/feedback
// @access  Private
const addServiceFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const booking = await ServiceBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Service booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if service is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed services'
      });
    }

    booking.rating = rating;
    booking.feedback = feedback;

    await booking.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: booking
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

// @desc    Get service statistics
// @route   GET /api/services/stats
// @access  Private/Seller
const getServiceStats = async (req, res) => {
  try {
    const totalBookings = await ServiceBooking.countDocuments();
    const pendingBookings = await ServiceBooking.countDocuments({ status: 'pending' });
    const confirmedBookings = await ServiceBooking.countDocuments({ status: 'confirmed' });
    const inProgressBookings = await ServiceBooking.countDocuments({ status: 'in_progress' });
    const completedBookings = await ServiceBooking.countDocuments({ status: 'completed' });
    const cancelledBookings = await ServiceBooking.countDocuments({ status: 'cancelled' });

    // Revenue from completed services
    const revenueResult = await ServiceBooking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$serviceCost' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Average rating
    const ratingResult = await ServiceBooking.aggregate([
      { $match: { rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = ratingResult.length > 0 ? ratingResult[0].avgRating : 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        inProgressBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
        averageRating: averageRating.toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics'
    });
  }
};

module.exports = {
  createServiceBooking,
  getAllServiceBookings,
  getMyServiceBookings,
  getServiceBookingById,
  updateServiceStatus,
  cancelServiceBooking,
  addServiceFeedback,
  getServiceStats
};
