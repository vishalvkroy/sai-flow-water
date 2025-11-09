const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Maximum 10 items per product allowed']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  // Store product details for faster access
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  productBrand: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastUpdated = new Date();
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(productData, quantity = 1) {
  const existingItemIndex = this.items.findIndex(item => {
    // Handle both populated and non-populated product references
    const itemProductId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemProductId === productData._id.toString();
  });

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
    if (this.items[existingItemIndex].quantity > 10) {
      this.items[existingItemIndex].quantity = 10;
    }
  } else {
    // Add new item
    this.items.push({
      product: productData._id,
      quantity,
      price: productData.price,
      productName: productData.name,
      productImage: productData.images[0],
      productBrand: productData.brand
    });
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
  console.log('🗑️  Removing item from cart');
  console.log('Product ID to remove:', productId);
  console.log('Current items count:', this.items.length);
  
  const itemsBefore = this.items.length;
  
  // Filter items - handle both populated and non-populated product references
  this.items = this.items.filter(item => {
    // Get the actual product ID (handle both ObjectId and populated object)
    const itemProductId = item.product._id ? item.product._id.toString() : item.product.toString();
    const targetProductId = productId.toString();
    
    console.log('Comparing:', itemProductId, '!==', targetProductId, '=', itemProductId !== targetProductId);
    
    return itemProductId !== targetProductId;
  });
  
  const itemsAfter = this.items.length;
  
  console.log('Items after removal:', itemsAfter);
  console.log('Removed:', itemsBefore - itemsAfter, 'item(s)');
  
  if (itemsBefore === itemsAfter) {
    console.log('⚠️  WARNING: No items were removed! Product ID might not match.');
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const itemIndex = this.items.findIndex(item => {
    // Handle both populated and non-populated product references
    const itemProductId = item.product._id ? item.product._id.toString() : item.product.toString();
    return itemProductId === productId.toString();
  });
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = Math.min(quantity, 10);
    }
  }
  
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = await this.create({ user: userId, items: [] });
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
