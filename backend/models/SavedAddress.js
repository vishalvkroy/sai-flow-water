const mongoose = require('mongoose');

const savedAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9+\s-()]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  alternatePhone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[0-9+\s-()]{10,15}$/.test(v);
      },
      message: 'Please provide a valid alternate phone number'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{6}$/.test(v);
      },
      message: 'Please provide a valid 6-digit postal code'
    }
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  addressType: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true
});

// Index for faster queries
savedAddressSchema.index({ user: 1, isDefault: 1 });

// Ensure only one default address per user
savedAddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('SavedAddress', savedAddressSchema);
