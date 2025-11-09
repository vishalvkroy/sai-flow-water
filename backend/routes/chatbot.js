const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  rateChatExperience,
  getAllChatSessions
} = require('../controllers/chatbotController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth to get user data if logged in)
router.post('/message', optionalAuth, sendMessage);
router.get('/history/:sessionId', getChatHistory);
router.post('/rate', rateChatExperience);

// Admin routes
router.get('/sessions', protect, authorize('admin', 'seller'), getAllChatSessions);

module.exports = router;
