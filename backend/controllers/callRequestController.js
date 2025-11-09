const CallRequest = require('../models/CallRequest');
const { sendEmail } = require('../utils/emailService');

// @desc    Create a new call request
// @route   POST /api/call-requests
// @access  Public
exports.createCallRequest = async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, preferredTime, reason, message, sessionId } = req.body;

    // Validation
    if (!customerName || !customerPhone || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone number, and reason for call'
      });
    }

    // Check for duplicate request in last 30 minutes
    const recentRequest = await CallRequest.findOne({
      customerPhone,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
    });

    if (recentRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending call request. Our team will contact you shortly.'
      });
    }

    // Create call request
    const callRequest = await CallRequest.create({
      customer: req.user?._id || null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || req.user?.email,
      preferredTime: preferredTime || 'anytime',
      reason,
      message: message || '',
      sessionId
    });

    // Send notification email to admin/seller
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@arrohfilters.com',
        subject: `New Call Request - ${callRequest.priority.toUpperCase()} Priority`,
        html: `
          <h2>New Call Request Received</h2>
          <p><strong>Priority:</strong> ${callRequest.priority.toUpperCase()}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          <p><strong>Email:</strong> ${customerEmail || 'Not provided'}</p>
          <p><strong>Preferred Time:</strong> ${preferredTime || 'Anytime'}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p><strong>Request Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
          <br>
          <p>Please contact the customer as soon as possible.</p>
        `
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Call request submitted successfully! Our team will contact you shortly.',
      data: {
        callRequest: {
          id: callRequest._id,
          customerName: callRequest.customerName,
          customerPhone: callRequest.customerPhone,
          preferredTime: callRequest.preferredTime,
          status: callRequest.status,
          priority: callRequest.priority,
          createdAt: callRequest.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create call request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit call request. Please try again.'
    });
  }
};

// @desc    Get all call requests (for seller/admin)
// @route   GET /api/call-requests
// @access  Private (Seller/Admin)
exports.getAllCallRequests = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const callRequests = await CallRequest.find(filter)
      .populate('customer', 'name email phone')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CallRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        callRequests,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get call requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call requests'
    });
  }
};

// @desc    Get call request statistics
// @route   GET /api/call-requests/stats
// @access  Private (Seller/Admin)
exports.getCallRequestStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRequests, pendingRequests, todayRequests, urgentRequests] = await Promise.all([
      CallRequest.countDocuments(),
      CallRequest.countDocuments({ status: 'pending' }),
      CallRequest.countDocuments({ createdAt: { $gte: today } }),
      CallRequest.countDocuments({ status: 'pending', priority: { $in: ['urgent', 'high'] } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        todayRequests,
        urgentRequests
      }
    });
  } catch (error) {
    console.error('Get call request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// @desc    Update call request status
// @route   PUT /api/call-requests/:id
// @access  Private (Seller/Admin)
exports.updateCallRequest = async (req, res) => {
  try {
    const { status, notes, assignedTo } = req.body;

    const callRequest = await CallRequest.findById(req.params.id);

    if (!callRequest) {
      return res.status(404).json({
        success: false,
        message: 'Call request not found'
      });
    }

    if (status) callRequest.status = status;
    if (notes) callRequest.notes = notes;
    if (assignedTo) callRequest.assignedTo = assignedTo;

    if (status === 'contacted' && !callRequest.contactedAt) {
      callRequest.contactedAt = new Date();
    }

    if (status === 'completed' && !callRequest.completedAt) {
      callRequest.completedAt = new Date();
    }

    await callRequest.save();

    res.status(200).json({
      success: true,
      message: 'Call request updated successfully',
      data: { callRequest }
    });
  } catch (error) {
    console.error('Update call request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update call request'
    });
  }
};

// @desc    Delete call request
// @route   DELETE /api/call-requests/:id
// @access  Private (Seller/Admin)
exports.deleteCallRequest = async (req, res) => {
  try {
    const callRequest = await CallRequest.findById(req.params.id);

    if (!callRequest) {
      return res.status(404).json({
        success: false,
        message: 'Call request not found'
      });
    }

    await callRequest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Call request deleted successfully'
    });
  } catch (error) {
    console.error('Delete call request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete call request'
    });
  }
};
