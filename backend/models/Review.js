const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  images: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  response: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Update product rating when review is removed
reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Static method to update product rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, isActive: true }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].numberOfReviews
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

module.exports = mongoose.model('Review', reviewSchema);