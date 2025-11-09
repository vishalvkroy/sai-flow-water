const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
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
    enum: ['installation', 'repair', 'maintenance', 'filter-replacement', 'inspection']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true,
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
    }
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true,
    enum: ['morning', 'afternoon', 'evening']
  },
  timeSlot: {
    type: String,
    trim: true
  },
  problemDescription: {
    type: String,
    maxlength: [1000, 'Problem description cannot be more than 1000 characters']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  serviceCharge: {
    type: Number,
    default: 0,
    min: [0, 'Service charge cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  technicianNotes: {
    type: String,
    maxlength: [500, 'Technician notes cannot be more than 500 characters']
  },
  completionDate: Date,
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot be more than 500 characters']
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  partsUsed: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
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
  }
}, {
  timestamps: true
});

// Generate booking number before saving
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000);
    this.bookingNumber = `BOOK-${timestamp}-${random}`;
  }
  next();
});

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ preferredDate: 1 });
bookingSchema.index({ assignedTechnician: 1 });

// Virtual for formatted preferred date
bookingSchema.virtual('formattedDate').get(function() {
  return this.preferredDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time slot display
bookingSchema.virtual('timeSlotDisplay').get(function() {
  const timeMap = {
    'morning': '9:00 AM - 12:00 PM',
    'afternoon': '1:00 PM - 5:00 PM',
    'evening': '6:00 PM - 9:00 PM'
  };
  return timeMap[this.preferredTime] || this.preferredTime;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Static method to get bookings by date range
bookingSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    preferredDate: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

module.exports = mongoose.model('Booking', bookingSchema);