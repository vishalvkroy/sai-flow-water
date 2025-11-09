const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true
    }
  },
  deliveryInfo: {
    distanceFromWarehouse: {
      type: Number,
      default: 0
    },
    totalWeight: {
      type: Number,
      default: 0
    },
    deliveryChargeBreakdown: {
      baseCharge: { type: Number, default: 0 },
      distanceCharge: { type: Number, default: 0 },
      weightCharge: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    isFreeDelivery: {
      type: Boolean,
      default: false
    },
    estimatedDeliveryDays: {
      type: Number,
      default: 5
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'upi', 'cash_on_delivery', 'cod', 'online']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    receipt_url: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  trackingNumber: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // Shipmojo Integration Fields
  shipmojoOrderId: {
    type: String,
    trim: true,
    index: true
  },
  shipmojoShipmentId: {
    type: String,
    trim: true,
    index: true
  },
  awbCode: {
    type: String,
    trim: true,
    index: true
  },
  courierName: {
    type: String,
    trim: true
  },
  courierId: {
    type: String,
    trim: true
  },
  expectedDeliveryDate: {
    type: Date
  },
  shippingLabel: {
    type: String,
    trim: true
  },
  labelUrl: {
    type: String,
    trim: true
  },
  manifestUrl: {
    type: String,
    trim: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  pickupScheduledDate: {
    type: Date
  },
  packageWeight: {
    type: Number,
    default: 2 // kg
  },
  packageLength: {
    type: Number,
    default: 30 // cm
  },
  packageBreadth: {
    type: Number,
    default: 20 // cm
  },
  packageHeight: {
    type: Number,
    default: 15 // cm
  },
  shippingNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  confirmedAt: {
    type: Date
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  shippedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processing', 'completed', 'failed'],
    default: 'none'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundMethod: {
    type: String,
    enum: ['original_payment', 'bank_transfer', 'store_credit'],
    trim: true
  },
  refundTransactionId: {
    type: String,
    trim: true
  },
  refundInitiatedAt: {
    type: Date
  },
  refundCompletedAt: {
    type: Date
  },
  refundNotes: {
    type: String,
    trim: true
  },
  // Return/Exchange Fields
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnReason: {
    type: String,
    trim: true
  },
  returnRequestedAt: {
    type: Date
  },
  returnStatus: {
    type: String,
    enum: ['none', 'requested', 'approved', 'rejected', 'picked_up', 'received', 'refunded'],
    default: 'none'
  },
  returnApprovedAt: {
    type: Date
  },
  returnApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnRejectionReason: {
    type: String,
    trim: true
  },
  // Shipmozo Reverse Pickup Fields
  returnShipmentId: {
    type: String,
    trim: true
  },
  returnAwbCode: {
    type: String,
    trim: true
  },
  returnCourierName: {
    type: String,
    trim: true
  },
  returnTrackingUrl: {
    type: String,
    trim: true
  },
  returnPickupScheduledAt: {
    type: Date
  },
  returnReceivedAt: {
    type: Date
  },
  returnNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000);
    this.orderNumber = `ARROH-${timestamp}-${random}`;
  }
  next();
});

// Calculate total price before saving
orderSchema.pre('save', function(next) {
  this.itemsPrice = this.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  next();
});

// Virtual field for totalAmount (alias for totalPrice for frontend compatibility)
orderSchema.virtual('totalAmount').get(function() {
  return this.totalPrice;
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

// Virtual for order status text
orderSchema.virtual('statusText').get(function() {
  const statusMap = {
    'pending': 'Order Placed',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded'
  };
  return statusMap[this.orderStatus] || this.orderStatus;
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.orderStatus);
};

// Method to check if order can be returned (within 7 days of delivery)
orderSchema.methods.canBeReturned = function() {
  if (this.orderStatus !== 'delivered' || this.returnRequested) {
    return false;
  }
  
  const deliveredDate = this.deliveredAt || this.updatedAt;
  const daysSinceDelivery = (Date.now() - new Date(deliveredDate)) / (1000 * 60 * 60 * 24);
  
  return daysSinceDelivery <= 7;
};

// Method to get days remaining for return
orderSchema.methods.getDaysRemainingForReturn = function() {
  if (this.orderStatus !== 'delivered') {
    return 0;
  }
  
  const deliveredDate = this.deliveredAt || this.updatedAt;
  const daysSinceDelivery = (Date.now() - new Date(deliveredDate)) / (1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(0, Math.ceil(7 - daysSinceDelivery));
  
  return daysRemaining;
};

// Static method to get orders by user
orderSchema.statics.getUserOrders = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema);