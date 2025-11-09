const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Object,
      default: {}
    }
  }],
  userEmail: String,
  userName: String,
  isResolved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

// Index for faster queries
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
