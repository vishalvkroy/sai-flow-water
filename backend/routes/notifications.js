const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');

// Get all notifications
router.get('/', protect, getNotifications);

// Mark as read
router.put('/:id/read', protect, markAsRead);

// Mark all as read
router.put('/read-all', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

// Clear all
router.delete('/clear-all', protect, clearAllNotifications);

module.exports = router;
