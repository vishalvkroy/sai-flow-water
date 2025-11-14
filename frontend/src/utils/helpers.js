// Get image URL with proper base URL
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'undefined' || imagePath === 'null') {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
  }
  
  // If it's already a full URL (Cloudinary), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // For Cloudinary URLs, ensure they're using HTTPS
    const cloudinaryUrl = imagePath.replace('http://', 'https://');
    
    // Don't add cache-busting parameters as they can trigger tracking prevention
    // Cloudinary already has version control built-in
    return cloudinaryUrl;
  }
  
  // Remove /api/ prefix if present (incorrect path)
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.replace('/api/', '/');
  }
  
  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Get base URL and remove /api suffix if present
  let baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4); // Remove '/api'
  }
  
  const fullUrl = `${baseUrl}${cleanPath}`;
  return fullUrl;
};

// Format currency with rupee symbol
export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '₹0';
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  // Ensure rupee symbol is always present
  return formatted.includes('₹') ? formatted : `₹${formatted}`;
};

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Format date and time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Generate star rating display
export const generateStars = (rating, maxStars = 5) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= fullStars) {
      stars.push('★');
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push('½');
    } else {
      stars.push('☆');
    }
  }

  return stars.join('');
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

// Generate order status badge
export const getStatusBadge = (status, statusConfig) => {
  const config = statusConfig[status] || { label: status, color: '#6b7280' };
  return {
    label: config.label,
    color: config.color,
    backgroundColor: `${config.color}20`
  };
};

// Calculate estimated delivery date
export const getEstimatedDelivery = (orderDate, days = 7) => {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return deliveryDate;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to localStorage:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};