const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'countertop', 
      'under-sink', 
      'whole-house', 
      'faucet-mount', 
      'reverse-osmosis',
      'portable',
      'commercial'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  specifications: {
    filtrationStages: {
      type: Number,
      min: [1, 'Must have at least 1 filtration stage']
    },
    filterLife: {
      type: String,
      trim: true
    },
    flowRate: {
      type: String,
      trim: true
    },
    dimensions: {
      type: String,
      trim: true
    },
    weight: {
      type: String,
      trim: true
    },
    warranty: {
      type: String,
      default: '1 year'
    },
    technology: {
      type: String,
      trim: true
    }
  },
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  weightInKg: {
    type: Number,
    required: [true, 'Please add product weight in kg'],
    min: [0.1, 'Weight must be at least 0.1 kg'],
    default: 1
  },
  shipping: {
    isFreeShipping: {
      type: Boolean,
      default: false
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: [0, 'Shipping charge cannot be negative']
    }
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  brand: {
    type: String,
    default: 'Arroh',
    trim: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  meta: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

// Static method to get featured products
productSchema.statics.getFeatured = function() {
  return this.find({ isFeatured: true, isActive: true, stock: { $gt: 0 } });
};

// Static method to get products by category
productSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true, stock: { $gt: 0 } });
};

module.exports = mongoose.model('Product', productSchema);