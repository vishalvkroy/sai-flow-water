// Simple and Professional Delivery Charge Calculator
// Base: Aurangabad, Bihar (PIN: 824101)

const DELIVERY_RATES = {
  FREE_DELIVERY_DISTANCE: 50,  // Free delivery within 50km
  STANDARD_CHARGE: 86          // ₹86 for deliveries beyond 50km
};

// PIN codes within 50km radius of Aurangabad, Bihar (Free delivery zone)
const FREE_DELIVERY_PINCODES = [
  // Aurangabad, Bihar - Main city (0-5km)
  '824101', '824102', '824103', '824104', '824105',
  
  // Daudnagar (15km from Aurangabad)
  '824143', '824144',
  
  // Obra (20km from Aurangabad)
  '824124', '824125',
  
  // Nabinagar (25km from Aurangabad)
  '824111', '824112', '824113',
  
  // Kutumba (30km from Aurangabad)
  '824118', '824119',
  
  // Madanpur (35km from Aurangabad)
  '824142',
  
  // Rafiganj (40km from Aurangabad)
  '824125', '824126',
  
  // Goh (45km from Aurangabad)
  '824203', '824204',
  
  // Nearby villages and areas within 50km
  '824106', '824107', '824108', '824109', '824110',
  '824114', '824115', '824116', '824117',
  '824120', '824121', '824122', '824123',
  '824127', '824128', '824129', '824130',
  '824201', '824202', '824205', '824206',
  '824207', '824208', '824209', '824210',
  
  // Gaya district nearby areas (within 50km)
  '823001', '823002', '823003', // Gaya city (45km)
  
  // Arwal district nearby (within 50km)
  '804401', '804402', '804403',
  
  // Jehanabad district nearby (within 50km)
  '804408', '804409', '804410'
];


/**
 * Simple delivery charge calculator
 * @param {string} pincode - Delivery PIN code
 * @returns {object} Delivery calculation result
 */
function calculateDeliveryCharges(pincode = null) {
  try {
    console.log(`\n🚚 Calculating delivery charge`);
    console.log(`📍 PIN Code: ${pincode}`);
    
    // Check if PIN code is in free delivery zone (within 50km of Aurangabad, Bihar)
    const isLocalDelivery = pincode && FREE_DELIVERY_PINCODES.includes(pincode);
    
    if (isLocalDelivery) {
      console.log(`✅ FREE DELIVERY! PIN code ${pincode} is within 50km of Aurangabad, Bihar`);
      return {
        deliveryCharge: 0,
        isFreeDelivery: true,
        message: 'Free delivery within 50km of Aurangabad, Bihar'
      };
    } else {
      console.log(`💰 DELIVERY CHARGE: ₹${DELIVERY_RATES.STANDARD_CHARGE} (Beyond 50km)`);
      return {
        deliveryCharge: DELIVERY_RATES.STANDARD_CHARGE,
        isFreeDelivery: false,
        message: `Delivery charge: ₹${DELIVERY_RATES.STANDARD_CHARGE}`
      };
    }

  } catch (error) {
    console.error('Delivery calculation error:', error);
    // Fallback to standard charge
    return {
      deliveryCharge: DELIVERY_RATES.STANDARD_CHARGE,
      isFreeDelivery: false,
      message: `Delivery charge: ₹${DELIVERY_RATES.STANDARD_CHARGE}`
    };
  }
}

module.exports = {
  calculateDeliveryCharges,
  DELIVERY_RATES,
  FREE_DELIVERY_PINCODES
};
