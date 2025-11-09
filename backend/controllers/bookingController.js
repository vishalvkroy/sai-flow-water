const Booking = require('../models/Booking');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      serviceType,
      product,
      customerInfo,
      preferredDate,
      preferredTime,
      problemDescription,
      urgency
    } = req.body;

    // Validate preferred date (should not be in the past)
    const preferredDateObj = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preferredDateObj < today) {
      return res.status(400).json({
        success: false,
        message: 'Preferred date cannot be in the past'
      });
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      serviceType,
      product,
      customerInfo,
      preferredDate: preferredDateObj,
      preferredTime,
      problemDescription,
      urgency
    });

    const createdBooking = await booking.save();
    const populatedBooking = await Booking.findById(createdBooking._id)
      .populate('user', 'name email')
      .populate('product', 'name images');

    // Send confirmation email
    await sendEmail({
      email: customerInfo.email,
      subject: emailTemplates.bookingConfirmation(populatedBooking).subject,
      html: emailTemplates.bookingConfirmation(populatedBooking).html
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('product', 'name images')
      .populate('assignedTechnician', 'name phone')
      .populate('cancelledBy', 'name email role');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin/technician
    if (booking.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('product', 'name images')
      .populate('assignedTechnician', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user bookings'
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;

    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const dateObj = new Date(date);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.preferredDate = {
        $gte: dateObj,
        $lt: nextDay
      };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('product', 'name')
      .populate('assignedTechnician', 'name')
      .populate('cancelledBy', 'name email role')
      .sort({ preferredDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);
    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: pageNum,
        pages,
        total,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { status, technicianNotes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;

    if (technicianNotes) {
      booking.technicianNotes = technicianNotes;
    }

    if (status === 'completed') {
      booking.completionDate = new Date();
    }

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status'
    });
  }
};

// @desc    Assign technician to booking
// @route   PUT /api/bookings/:id/assign
// @access  Private/Admin
const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.assignedTechnician = technicianId;
    booking.status = 'assigned';

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Technician assigned successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Assign technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning technician'
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Only allow updates to certain fields for users
    const allowedUpdates = ['preferredDate', 'preferredTime', 'problemDescription'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('product', 'name images');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin/seller
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';
    
    if (!isOwner && !isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Sellers/Admins can cancel bookings at more stages than customers
    if (isSeller || isAdmin) {
      // Sellers/Admins can cancel bookings that are not completed
      if (booking.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel completed booking'
        });
      }
    } else {
      // Customers can only cancel pending/confirmed bookings
      if (!booking.canBeCancelled()) {
        return res.status(400).json({
          success: false,
          message: 'Booking cannot be cancelled at this stage. Please contact support.'
        });
      }
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;
    
    // Add cancellation reason and note if provided
    if (req.body.reason) {
      booking.cancellationReason = req.body.reason;
      const cancelledBy = isSeller ? 'seller' : isAdmin ? 'admin' : 'customer';
      const existingNotes = booking.notes ? `${booking.notes}\n` : '';
      booking.notes = `${existingNotes}Cancelled by ${cancelledBy}. Reason: ${req.body.reason}`;
    }

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    });
  }
};

// @desc    Add booking rating and feedback
// @route   PUT /api/bookings/:id/feedback
// @access  Private
const addBookingFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add feedback for this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be added for completed bookings'
      });
    }

    booking.rating = rating;
    booking.feedback = feedback;

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Add booking feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding feedback'
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getMyBookings,
  getBookings,
  updateBookingStatus,
  assignTechnician,
  updateBooking,
  cancelBooking,
  addBookingFeedback
};