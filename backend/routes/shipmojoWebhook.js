const express = require('express');
const { handleShipmojoWebhook } = require('../controllers/shipmojoWebhookController');

const router = express.Router();

/**
 * Shipmojo Webhook Route
 * This endpoint receives real-time shipment status updates from Shipmojo
 * 
 * Configure this URL in your Shipmojo dashboard:
 * Webhook URL: https://yourdomain.com/api/webhooks/shipmojo
 */

// POST /api/webhooks/shipmojo
router.post('/shipmojo', handleShipmojoWebhook);

// Test endpoint for webhook debugging
router.post('/shipmojo/test', async (req, res) => {
  console.log('🧪 TEST WEBHOOK ENDPOINT CALLED');
  console.log('📨 Test payload:', JSON.stringify(req.body, null, 2));
  
  // Call the actual webhook handler
  await handleShipmojoWebhook(req, res);
});

module.exports = router;
