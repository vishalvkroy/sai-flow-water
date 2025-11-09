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

module.exports = router;
