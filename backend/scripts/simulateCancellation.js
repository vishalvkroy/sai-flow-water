/**
 * Simulate ShipMozo Cancellation Webhook
 * Use this to test if cancellation webhook is working properly
 */

const axios = require('axios');

// Sample ShipMozo cancellation webhook payload
const cancellationPayload = {
  "order_id": "your_shipmozo_order_id",
  "refrence_id": "ARROH-XXXXXXXXXX", // Replace with your actual order number
  "awb_number": "365002041681", // Replace with actual AWB
  "carrier": "Delhivery",
  "delhivery_name": "John Doe",
  "delhivery_phone": "9876543210",
  "expected_delivery_date": "2025-11-15 18:29:59",
  "shipment_type": "Forward",
  "current_status": "Cancelled", // or "Shipment Cancelled"
  "status_time": new Date().toISOString().replace('T', ' ').substring(0, 19),
  "cancellation_reason": "Cancelled by customer request",
  "status_feed": {
    "scan": [
      {
        "date": new Date().toISOString().replace('T', ' ').substring(0, 19),
        "status": "Shipment Cancelled",
        "location": "Mumbai_KurlaWest_P (Maharashtra)"
      }
    ]
  }
};

async function simulateCancellation() {
  try {
    console.log('🚀 Simulating ShipMozo cancellation webhook...\n');
    console.log('📦 Payload:');
    console.log(JSON.stringify(cancellationPayload, null, 2));
    console.log('\n');

    // Send to local backend
    const response = await axios.post(
      'http://localhost:5000/api/webhooks/shipmojo',
      cancellationPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response:', response.data);
    console.log('\n📋 Check your backend logs to see if:');
    console.log('   1. Webhook was received');
    console.log('   2. Order was found');
    console.log('   3. Status was updated to cancelled');
    console.log('   4. Email was sent');
    console.log('   5. Socket.IO notification was emitted');
    console.log('\n💡 Check seller dashboard - it should update automatically!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure backend is running (npm run dev)');
    console.error('   2. Update the refrence_id with your actual order number');
    console.error('   3. Update the awb_number if you have one');
    console.error('   4. Check backend logs for errors');
  }
}

// Instructions
console.log('═══════════════════════════════════════════════════════');
console.log('  ShipMozo Cancellation Webhook Simulator');
console.log('═══════════════════════════════════════════════════════\n');
console.log('📝 Before running:');
console.log('   1. Make sure backend is running: npm run dev');
console.log('   2. Update refrence_id with your order number');
console.log('   3. Update awb_number if you have one\n');
console.log('═══════════════════════════════════════════════════════\n');

simulateCancellation();
