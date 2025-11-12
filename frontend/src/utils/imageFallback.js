/**
 * Image Fallback Utilities
 * Provides fallback images when product images fail to load
 */

// SVG placeholder as data URI - lightweight and always works
export const FALLBACK_PRODUCT_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%236b7280'%3EProduct Image%3C/text%3E%3Cpath d='M150 180 L250 180 L200 140 Z M140 240 L180 200 L220 240 L260 200 L260 260 L140 260 Z' fill='%239ca3af'/%3E%3C/svg%3E`;

export const FALLBACK_NO_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%239ca3af'%3ENo Image Available%3C/text%3E%3C/svg%3E`;

export const FALLBACK_USER_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ccircle cx='100' cy='80' r='40' fill='%239ca3af'/%3E%3Cpath d='M40 160 Q40 120 100 120 Q160 120 160 160 L160 200 L40 200 Z' fill='%239ca3af'/%3E%3C/svg%3E`;

/**
 * Get the appropriate image URL with fallback
 * @param {string|array} images - Image URL or array of image URLs
 * @param {string} type - Type of fallback ('product', 'user', 'generic')
 * @returns {string} Image URL or fallback
 */
export const getImageWithFallback = (images, type = 'product') => {
  // Handle array of images
  if (Array.isArray(images) && images.length > 0) {
    return images[0].url || images[0];
  }
  
  // Handle string URL
  if (typeof images === 'string' && images.trim()) {
    return images;
  }
  
  // Return appropriate fallback
  switch (type) {
    case 'user':
      return FALLBACK_USER_AVATAR;
    case 'generic':
      return FALLBACK_NO_IMAGE;
    default:
      return FALLBACK_PRODUCT_IMAGE;
  }
};

/**
 * Handle image error event
 * @param {Event} e - Error event
 * @param {string} fallbackType - Type of fallback to use
 */
export const handleImageError = (e, fallbackType = 'product') => {
  e.target.onerror = null; // Prevent infinite loop
  
  switch (fallbackType) {
    case 'user':
      e.target.src = FALLBACK_USER_AVATAR;
      break;
    case 'generic':
      e.target.src = FALLBACK_NO_IMAGE;
      break;
    default:
      e.target.src = FALLBACK_PRODUCT_IMAGE;
  }
};

export default {
  FALLBACK_PRODUCT_IMAGE,
  FALLBACK_NO_IMAGE,
  FALLBACK_USER_AVATAR,
  getImageWithFallback,
  handleImageError
};
