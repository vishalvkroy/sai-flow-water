const Notification = require('../models/Notification');

/**
 * Get all notifications for logged-in user
 * @route GET /api/notifications
 * @access Private
 */
const getNotifications = async (req, res) => {
  try {
    const { filter } = req.query; // all, unread, read
    
    let query = { user: req.user._id };
    
    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'read') {
      query.read = true;
    }
    
    // Use Promise.all for parallel queries with timeout
    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .maxTimeMS(5000) // 5 second timeout
        .lean(), // Use lean for better performance
      Notification.countDocuments({
        user: req.user._id,
        read: false
      }).maxTimeMS(5000)
    ]);
    
    res.json({
      success: true,
      data: {
        notifications: notifications || [],
        unreadCount: unreadCount || 0
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    
    // Return empty data instead of error to prevent UI breaking
    res.json({
      success: true,
      data: {
        notifications: [],
        unreadCount: 0
      },
      warning: 'Notifications temporarily unavailable'
    });
  }
};

/**
 * Mark notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    ).maxTimeMS(3000);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    // Return success even if it fails to prevent UI breaking
    res.json({
      success: true,
      message: 'Request processed'
    });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    ).maxTimeMS(5000);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    // Return success even if it fails
    res.json({
      success: true,
      message: 'Request processed'
    });
  }
};

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

/**
 * Delete all notifications
 * @route DELETE /api/notifications/clear-all
 * @access Private
 */
const clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ user: req.user._id }).maxTimeMS(10000);
    
    console.log(`✅ Cleared ${result.deletedCount} notifications for user ${req.user._id}`);
    
    res.json({
      success: true,
      message: `${result.deletedCount} notifications cleared successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoTimeoutError') {
      return res.status(408).json({
        success: false,
        message: 'Database operation timed out. Please try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create notification (internal use)
 */
const createNotification = async (userId, type, title, message, link = '', data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      data
    });
    
    // Emit socket event for real-time notification
    const io = require('../server').io;
    if (io) {
      io.to(userId.toString()).emit('new-notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification
};
