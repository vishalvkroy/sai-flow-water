const axios = require('axios');
const { validatePincode, getStateFromPincode } = require('../utils/indianStatesData');

/**
 * Reverse Geocoding - Get address from coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {object} Address details
 */
const reverseGeocode = async (latitude, longitude) => {
  try {
    console.log(`🌍 Reverse geocoding: ${latitude}, ${longitude}`);
    
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1,
        'accept-language': 'en'
      },
      headers: {
        'User-Agent': 'SaiFlowWater/1.0'
      }
    });

    if (response.data && response.data.address) {
      const addr = response.data.address;
      
      const addressData = {
        formattedAddress: response.data.display_name,
        street: addr.road || addr.street || '',
        landmark: addr.neighbourhood || addr.suburb || '',
        city: addr.city || addr.town || addr.village || addr.municipality || '',
        district: addr.state_district || addr.county || '',
        state: addr.state || '',
        pincode: addr.postcode || '',
        country: addr.country || 'India',
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      };

      console.log('✅ Reverse geocoding successful:', addressData.city, addressData.state);
      return addressData;
    }

    throw new Error('No address data found');
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error.message);
    return {
      formattedAddress: `Location: ${latitude}, ${longitude}`,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    };
  }
};

/**
 * Forward Geocoding - Get coordinates from address
 * @param {string} address - Full address string
 * @returns {object} Coordinates and formatted address
 */
const forwardGeocode = async (address) => {
  try {
    console.log(`🔍 Forward geocoding: ${address}`);
    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        addressdetails: 1,
        limit: 1,
        countrycodes: 'in' // Restrict to India
      },
      headers: {
        'User-Agent': 'SaiFlowWater/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const addr = result.address || {};

      const locationData = {
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        },
        formattedAddress: result.display_name,
        street: addr.road || addr.street || '',
        landmark: addr.neighbourhood || addr.suburb || '',
        city: addr.city || addr.town || addr.village || '',
        district: addr.state_district || addr.county || '',
        state: addr.state || '',
        pincode: addr.postcode || '',
        country: addr.country || 'India'
      };

      console.log('✅ Forward geocoding successful:', locationData.coordinates);
      return locationData;
    }

    throw new Error('Location not found');
  } catch (error) {
    console.error('❌ Forward geocoding error:', error.message);
    return null;
  }
};

/**
 * Get address from PIN code
 * @param {string} pincode - Indian PIN code
 * @returns {object} Address details
 */
const getAddressFromPincode = async (pincode) => {
  try {
    if (!validatePincode(pincode)) {
      throw new Error('Invalid PIN code format');
    }

    console.log(`📮 Fetching address for PIN code: ${pincode}`);

    // Use India Post API or Nominatim
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        postalcode: pincode,
        country: 'India',
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'SaiFlowWater/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const addr = result.address || {};

      const addressData = {
        pincode: pincode,
        city: addr.city || addr.town || addr.village || '',
        district: addr.state_district || addr.county || '',
        state: addr.state || '',
        country: 'India',
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        },
        formattedAddress: result.display_name
      };

      console.log('✅ PIN code lookup successful:', addressData.city, addressData.state);
      return addressData;
    }

    // Fallback: Use PIN code mapping
    const possibleStates = getStateFromPincode(pincode);
    console.log(`⚠️ Using fallback state mapping for PIN ${pincode}:`, possibleStates);
    
    return {
      pincode: pincode,
      state: possibleStates[0] || '',
      country: 'India'
    };
  } catch (error) {
    console.error('❌ PIN code lookup error:', error.message);
    
    // Fallback
    const possibleStates = getStateFromPincode(pincode);
    return {
      pincode: pincode,
      state: possibleStates[0] || '',
      country: 'India'
    };
  }
};

/**
 * Validate and enrich address data
 * @param {object} addressData - Address object
 * @returns {object} Validated and enriched address
 */
const validateAndEnrichAddress = async (addressData) => {
  try {
    const enriched = { ...addressData };

    // If coordinates are provided, get address details
    if (addressData.coordinates && addressData.coordinates.latitude && addressData.coordinates.longitude) {
      const geoData = await reverseGeocode(
        addressData.coordinates.latitude,
        addressData.coordinates.longitude
      );
      
      // Merge with provided data, preferring user input
      enriched.street = addressData.street || geoData.street;
      enriched.landmark = addressData.landmark || geoData.landmark;
      enriched.city = addressData.city || geoData.city;
      enriched.district = addressData.district || geoData.district;
      enriched.state = addressData.state || geoData.state;
      enriched.pincode = addressData.pincode || geoData.pincode;
      enriched.formattedAddress = addressData.formattedAddress || geoData.formattedAddress;
    }
    // If PIN code is provided, validate and get location
    else if (addressData.pincode && validatePincode(addressData.pincode)) {
      const pincodeData = await getAddressFromPincode(addressData.pincode);
      
      enriched.city = addressData.city || pincodeData.city;
      enriched.district = addressData.district || pincodeData.district;
      enriched.state = addressData.state || pincodeData.state;
      enriched.coordinates = pincodeData.coordinates || enriched.coordinates;
    }
    // If full address is provided, geocode it
    else if (addressData.street && addressData.city && addressData.state) {
      const fullAddress = `${addressData.street}, ${addressData.city}, ${addressData.state}, India`;
      const geoData = await forwardGeocode(fullAddress);
      
      if (geoData) {
        enriched.coordinates = geoData.coordinates;
        enriched.formattedAddress = geoData.formattedAddress;
      }
    }

    enriched.country = 'India';
    
    console.log('✅ Address validated and enriched');
    return enriched;
  } catch (error) {
    console.error('❌ Address validation error:', error.message);
    return addressData;
  }
};

module.exports = {
  reverseGeocode,
  forwardGeocode,
  getAddressFromPincode,
  validateAndEnrichAddress
};
