const mongoose = require('mongoose');

const serviceBookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'installation',
      'repair',
      'maintenance',
      'filter_replacement',
      'annual_maintenance',
      'emergency_service',
      'consultation'
    ]
  },
  productType: {
    type: String,
    required: true
  },
  issueDescription: {
    type: String,
    required: true
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTimeSlot: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'evening']
  },
  address: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    landmark: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTechnician: {
    name: String,
    phone: String,
    id: String
  },
  scheduledDate: Date,
  completedDate: Date,
  // Distance and Location
  distanceFromWarehouse: {
    type: Number, // in kilometers
    default: 0
  },
  warehouseCoordinates: {
    latitude: Number,
    longitude: Number
  },
  customerCoordinates: {
    latitude: Number,
    longitude: Number
  },
  
  // Pricing based on distance
  serviceCost: {
    type: Number,
    default: 0
  },
  advanceAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'advance_paid', 'fully_paid', 'refund_pending', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'pending'],
    default: 'pending'
  },
  
  // Advance Payment Details
  advancePayment: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,
    amount: Number
  },
  
  // Refund Details
  refund: {
    amount: Number,
    deductedAmount: Number, // ₹100 cancellation fee
    refundedAmount: Number,
    razorpayRefundId: String,
    refundedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  
  // Terms & Conditions Acceptance
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsAcceptedAt: Date,
  notes: String,
  technicianNotes: String,
  images: [String],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
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

// Generate booking number before saving
serviceBookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.bookingNumber = `SRV-${timestamp}-${random}`;
  }
  next();
});

// Virtual for status text
serviceBookingSchema.virtual('statusText').get(function() {
  const statusMap = {
    'pending': 'Pending Confirmation',
    'confirmed': 'Confirmed',
    'assigned': 'Technician Assigned',
    'in_progress': 'Service In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for time slot text
serviceBookingSchema.virtual('timeSlotText').get(function() {
  const timeSlots = {
    'morning': '9:00 AM - 12:00 PM',
    'afternoon': '12:00 PM - 4:00 PM',
    'evening': '4:00 PM - 7:00 PM'
  };
  return timeSlots[this.preferredTimeSlot] || this.preferredTimeSlot;
});

// Method to calculate service cost based on distance
serviceBookingSchema.methods.calculateServiceCost = function() {
  const distance = this.distanceFromWarehouse;
  
  if (distance <= 10) {
    this.serviceCost = 300;
  } else if (distance <= 20) {
    this.serviceCost = 400;
  } else {
    this.serviceCost = 500;
  }
  
  // Advance amount is 50% of total cost
  this.advanceAmount = Math.round(this.serviceCost / 2);
  this.remainingAmount = this.serviceCost - this.advanceAmount;
  
  return {
    serviceCost: this.serviceCost,
    advanceAmount: this.advanceAmount,
    remainingAmount: this.remainingAmount
  };
};

// Method to process cancellation refund
serviceBookingSchema.methods.calculateRefund = function() {
  const CANCELLATION_FEE = 100;
  
  // Only process refund if advance payment was made
  if (this.paymentStatus === 'advance_paid' && this.advancePayment.amount) {
    const refundAmount = this.advancePayment.amount;
    const deductedAmount = CANCELLATION_FEE;
    const refundedAmount = Math.max(0, refundAmount - deductedAmount);
    
    return {
      amount: refundAmount,
      deductedAmount: deductedAmount,
      refundedAmount: refundedAmount
    };
  }
  
  return null;
};

// Ensure virtuals are included in JSON
serviceBookingSchema.set('toJSON', { virtuals: true });
serviceBookingSchema.set('toObject', { virtuals: true });

// Indexes
serviceBookingSchema.index({ user: 1, createdAt: -1 });
serviceBookingSchema.index({ status: 1 });
serviceBookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('ServiceBooking', serviceBookingSchema);
