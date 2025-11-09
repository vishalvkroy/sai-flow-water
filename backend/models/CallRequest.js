const mongoose = require('mongoose');

const callRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required']
  },
  customerPhone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  customerEmail: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  preferredTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'anytime'],
    default: 'anytime'
  },
  reason: {
    type: String,
    required: [true, 'Reason for call is required']
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  sessionId: {
    type: String,
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  contactedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
callRequestSchema.index({ status: 1, createdAt: -1 });
callRequestSchema.index({ customer: 1, createdAt: -1 });
callRequestSchema.index({ customerPhone: 1 });

// Auto-set priority based on reason
callRequestSchema.pre('save', function(next) {
  if (this.isNew) {
    const urgentKeywords = ['urgent', 'emergency', 'not working', 'broken', 'leaking'];
    const highKeywords = ['complaint', 'refund', 'return', 'issue', 'problem'];
    
    const reasonLower = this.reason.toLowerCase();
    const messageLower = (this.message || '').toLowerCase();
    
    if (urgentKeywords.some(keyword => reasonLower.includes(keyword) || messageLower.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => reasonLower.includes(keyword) || messageLower.includes(keyword))) {
      this.priority = 'high';
    }
  }
  next();
});

module.exports = mongoose.model('CallRequest', callRequestSchema);
