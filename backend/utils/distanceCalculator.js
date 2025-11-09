/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - First coordinate {latitude, longitude}
 * @param {Object} coord2 - Second coordinate {latitude, longitude}
 * @returns {Number} Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Radius of Earth in kilometers
  
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 * @param {Number} degrees
 * @returns {Number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get coordinates from postal code (using a geocoding service)
 * For now, this is a placeholder - you can integrate with Google Maps Geocoding API
 * @param {String} postalCode
 * @returns {Object} {latitude, longitude}
 */
const getCoordinatesFromPostalCode = async (postalCode) => {
  // TODO: Integrate with Google Maps Geocoding API or similar service
  // For now, return approximate coordinates based on postal code
  // This is a placeholder implementation
  
  // You can use Google Maps Geocoding API:
  // https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&key=${API_KEY}
  
  return {
    latitude: 0,
    longitude: 0
  };
};

/**
 * Calculate service pricing based on distance
 * @param {Number} distance - Distance in kilometers
 * @returns {Object} Pricing details
 */
const calculateServicePricing = (distance) => {
  let serviceCost = 0;
  let distanceRange = '';
  
  if (distance <= 10) {
    serviceCost = 300;
    distanceRange = '0-10 km';
  } else if (distance <= 20) {
    serviceCost = 400;
    distanceRange = '10-20 km';
  } else {
    serviceCost = 500;
    distanceRange = '20+ km';
  }
  
  const advanceAmount = Math.round(serviceCost / 2);
  const remainingAmount = serviceCost - advanceAmount;
  
  return {
    distance,
    distanceRange,
    serviceCost,
    advanceAmount,
    remainingAmount
  };
};

/**
 * Get warehouse coordinates from environment variables
 * @returns {Object} {latitude, longitude}
 */
const getWarehouseCoordinates = () => {
  // Aurangabad, Bihar coordinates (approximate)
  // You can get exact coordinates from Google Maps
  return {
    latitude: 24.7536,
    longitude: 84.3742
  };
};

module.exports = {
  calculateDistance,
  getCoordinatesFromPostalCode,
  calculateServicePricing,
  getWarehouseCoordinates
};
