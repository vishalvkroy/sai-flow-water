const mongoose = require('mongoose');

/**
 * OPTIMIZED Order Schema
 * - Limited status history (max 10 entries)
 * - Proper indexes for fast queries
 * - TTL for auto-archiving old orders
 * - Lean data structure
 */

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // Store only essential product info (not full details)
  name: String,
  image: String
}, { _id: false }); // No _id for subdocuments saves space

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    maxlength: 200 // Limit note length
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true // Fast lookup by order number
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Fast lookup by user
  },
  orderItems: [orderItemSchema],
  
  // Shipping Address - Optimized
  shippingAddress: {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
    landmark: { type: String, trim: true, maxlength: 100 },
    city: { type: String, required: true, trim: true, maxlength: 50 },
    state: { type: String, required: true, trim: true, maxlength: 50 },
    postalCode: { type: String, required: true, trim: true, maxlength: 10 },
    country: { type: String, required: true, default: 'India', maxlength: 50 },
    phone: { type: String, required: true, maxlength: 15 },
    alternatePhone: { type: String, trim: true, maxlength: 15 },
    email: { type: String, required: true, maxlength: 100 }
  },
  
  // Delivery Info - Compressed
  deliveryInfo: {
    distanceFromWarehouse: Number,
    totalWeight: Number,
    deliveryCharge: Number, // Single field instead of breakdown
    isFreeDelivery: Boolean,
    estimatedDeliveryDays: Number
  },
  
  // Payment Info
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'upi', 'cash_on_delivery', 'cod', 'online']
  },
  paymentResult: {
    id: String,
    status: String
  },
  
  // Pricing
  itemsPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  
  // Status Fields
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true // Fast filtering by status
  },
  
  // ShipMozo Integration - Indexed for webhook lookups
  shipmojoOrderId: { type: String, trim: true, sparse: true, index: true },
  shipmojoShipmentId: { type: String, trim: true, sparse: true },
  awbCode: { type: String, trim: true, sparse: true, index: true },
  courierName: { type: String, trim: true, maxlength: 50 },
  courierId: { type: String, trim: true, maxlength: 50 },
  trackingNumber: { type: String, trim: true, maxlength: 50 },
  trackingUrl: { type: String, trim: true, maxlength: 200 },
  
  // Dates
  expectedDeliveryDate: Date,
  pickupScheduledDate: Date,
  shippedAt: Date,
  confirmedAt: Date,
  cancelledAt: Date,
  
  // Package Info - Simplified
  packageWeight: { type: Number, default: 2 },
  packageDimensions: { // Combined into one object
    length: { type: Number, default: 30 },
    breadth: { type: Number, default: 20 },
    height: { type: Number, default: 15 }
  },
  
  // Notes - Limited length
  notes: { type: String, maxlength: 500 },
  shippingNotes: { type: String, maxlength: 500 },
  cancellationReason: { type: String, maxlength: 200 },
  
  // Status History - LIMITED TO 10 ENTRIES
  statusHistory: {
    type: [statusHistorySchema],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10;
      },
      message: 'Status history cannot exceed 10 entries'
    }
  },
  
  // Refund Info - Simplified
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processing', 'completed', 'failed'],
    default: 'none'
  },
  refundAmount: Number,
  refundTransactionId: String,
  refundCompletedAt: Date,
  
  // Return Info - Simplified
  returnRequested: { type: Boolean, default: false },
  returnStatus: {
    type: String,
    enum: ['none', 'requested', 'approved', 'rejected', 'completed'],
    default: 'none'
  },
  
  // Metadata
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, {
  timestamps: true, // Auto createdAt and updatedAt
  // Optimize for queries
  collation: { locale: 'en', strength: 2 }
});

// ==================== INDEXES ====================

// Compound index for seller dashboard queries (most common)
orderSchema.index({ user: 1, orderStatus: 1, createdAt: -1 });

// Compound index for date range + status queries
orderSchema.index({ createdAt: -1, orderStatus: 1 });

// Index for payment status queries
orderSchema.index({ isPaid: 1, paymentStatus: 1 });

// Index for delivery status
orderSchema.index({ isDelivered: 1, deliveredAt: -1 });

// TTL Index - Auto-delete cancelled orders after 90 days
orderSchema.index(
  { cancelledAt: 1 },
  {
    expireAfterSeconds: 7776000, // 90 days
    partialFilterExpression: { orderStatus: 'cancelled' }
  }
);

// ==================== METHODS ====================

// Add status to history (auto-limits to 10)
orderSchema.methods.addStatusHistory = function(status, note) {
  const newEntry = {
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status}`
  };
  
  // Add new entry
  this.statusHistory.push(newEntry);
  
  // Keep only last 10 entries
  if (this.statusHistory.length > 10) {
    this.statusHistory = this.statusHistory.slice(-10);
  }
  
  return this.statusHistory;
};

// Get order summary (lean data for lists)
orderSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    orderNumber: this.orderNumber,
    orderStatus: this.orderStatus,
    totalPrice: this.totalPrice,
    isPaid: this.isPaid,
    isDelivered: this.isDelivered,
    createdAt: this.createdAt,
    itemCount: this.orderItems.length
  };
};

// ==================== STATICS ====================

// Get orders with pagination and projection
orderSchema.statics.getOrdersList = function(filters = {}, page = 1, limit = 20) {
  return this.find(filters)
    .select('orderNumber orderStatus totalPrice isPaid isDelivered createdAt user')
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean(); // Returns plain JS objects (faster)
};

// Get order count by status (for dashboard stats)
orderSchema.statics.getStatusCounts = function(userId) {
  return this.aggregate([
    { $match: userId ? { user: mongoose.Types.ObjectId(userId) } : {} },
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);
};

// Archive old delivered orders (move to archive collection)
orderSchema.statics.archiveOldOrders = async function(daysOld = 180) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const oldOrders = await this.find({
    orderStatus: 'delivered',
    deliveredAt: { $lt: cutoffDate }
  });
  
  // Move to archive collection (implement separately)
  return oldOrders;
};

// ==================== MIDDLEWARE ====================

// Pre-save: Limit status history
orderSchema.pre('save', function(next) {
  if (this.statusHistory && this.statusHistory.length > 10) {
    this.statusHistory = this.statusHistory.slice(-10);
  }
  next();
});

// Pre-save: Update orderStatus when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus')) {
    this.addStatusHistory(this.orderStatus);
  }
  next();
});

// ==================== VIRTUALS ====================

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is order old (> 6 months)
orderSchema.virtual('isOld').get(function() {
  return this.ageInDays > 180;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
