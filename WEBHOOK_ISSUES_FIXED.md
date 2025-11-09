# ShipMozo Webhook Integration - Issues Found & Fixed

## Date: November 9, 2025

## Issues Identified

### 1. **CRITICAL: Frontend Random Status Simulation**
**Location:** `frontend/src/pages/SellerOrders.js` (Lines 498-515)

**Problem:**
- A `setInterval` was running every 30 seconds that randomly changed order statuses
- This simulation was overriding real data from the backend
- Orders would show as "processing" even after being cancelled in the database

**Fix:**
- Removed the entire simulation interval
- Now frontend only displays real data from backend API

---

### 2. **Socket.IO Connection Issues**
**Location:** `frontend/src/pages/SellerOrders.js`

**Problem:**
- Socket.IO was reconnecting on every state change (page, limit, statusFilter)
- Missing dependency array caused infinite reconnection loops
- 400 Bad Request errors due to rapid connect/disconnect cycles
- Not joining seller room for targeted updates

**Fix:**
- Split `useEffect` into two separate effects:
  - One for fetching orders (runs when filters change)
  - One for Socket.IO connection (runs only once on mount)
- Added proper Socket.IO configuration with reconnection settings
- Added seller room join on connection
- Added error handling for connection failures

---

### 3. **Webhook Handler Field Name Mismatch**
**Location:** `backend/controllers/shipmojoWebhookController.js`

**Problem:**
- Webhook handler was looking for `event_type` field
- ShipMozo actually sends `current_status` field
- Field names like `shipment_id`, `courier_name` didn't match actual payload
- ShipMozo uses: `order_id`, `refrence_id`, `awb_number`, `carrier`

**Fix:**
- Updated webhook handler to use `current_status` instead of `event_type`
- Updated all handler functions to use correct field names:
  - `data.order_id` instead of `data.shipment_id`
  - `data.carrier` instead of `data.courier_name`
  - `data.refrence_id` for order number matching
  - `data.status_time` for timestamps
  - `data.status_feed.scan[0].location` for location data
  - `data.delhivery_name` for delivery person
- Added `handleGenericStatusUpdate()` for unhandled statuses

---

### 4. **Order Lookup Strategy**
**Location:** `backend/controllers/shipmojoWebhookController.js`

**Problem:**
- Only looking up orders by `shipmojoShipmentId`
- ShipMozo sends `order_id`, `refrence_id`, and `awb_number`

**Fix:**
- Updated all handlers to search by multiple fields:
```javascript
const order = await Order.findOne({ 
  $or: [
    { shipmojoOrderId: data.order_id },
    { awbCode: data.awb_number },
    { orderNumber: data.refrence_id }
  ]
});
```

---

### 5. **Cancelled Order Status Logic**
**Location:** `backend/controllers/shipmojoWebhookController.js`

**Problem:**
- When shipment cancelled in ShipMozo, order was being set to `'confirmed'`
- This was intended to allow re-creating shipment, but didn't match user expectation

**Fix:**
- Changed to set `orderStatus = 'cancelled'` when shipment cancelled
- Clears all ShipMozo shipment data
- Adds proper cancellation timestamp and reason

---

## Testing Results

### Before Fix:
- ❌ Orders showed "processing" even after cancellation
- ❌ Socket.IO constantly reconnecting (400 errors)
- ❌ Webhooks not updating order status
- ❌ Random status changes every 30 seconds

### After Fix:
- ✅ Orders correctly show "cancelled" after ShipMozo cancellation
- ✅ Orders correctly show "delivered" after delivery
- ✅ Socket.IO stable connection
- ✅ Real-time updates working
- ✅ No random status changes

---

## Webhook Payload Example (ShipMozo Format)

```json
{
  "order_id": "39690AP718262063019",
  "refrence_id": "ARROH-1762689816364-388",
  "awb_number": "365002177106",
  "carrier": "Amazon ATS 10KG",
  "delhivery_name": "John",
  "delhivery_phone": "9876543210",
  "expected_delivery_date": "2025-11-10 18:00:00",
  "shipment_type": "Forward",
  "current_status": "Delivered",
  "status_time": "2025-11-09 17:30:00",
  "status_feed": {
    "scan": [
      {
        "date": "2025-11-09 17:30:00",
        "status": "Delivered to consignee",
        "location": "Mumbai_KurlaWest_R (Maharashtra)"
      }
    ]
  }
}
```

---

## Status Mapping

| ShipMozo Status | Order Status | Action |
|----------------|--------------|--------|
| Pickup scheduled | processing | Update expected delivery |
| Shipment picked up | shipped | Send tracking email |
| Out for pickup | shipped | - |
| Shipment received at facility | shipped | Update location |
| In transit | shipped | Update location |
| Out for delivery | shipped | Send notification |
| Delivered | delivered | Mark as delivered |
| Delivered to consignee | delivered | Mark as delivered |
| Delivery failed | shipped | Log NDR |
| NDR | shipped | Send NDR email |
| RTO | cancelled | Refund initiated |
| Return to origin | cancelled | Refund initiated |
| Cancelled | cancelled | Clear shipment data |
| Shipment cancelled | cancelled | Clear shipment data |

---

## Configuration Required

### ShipMozo Dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/shipmojo`
3. Enable all shipment events
4. Save configuration

### For Local Testing:
1. Run ngrok: `ngrok http 5000`
2. Copy HTTPS URL
3. Configure in ShipMozo: `https://xxx.ngrok-free.app/api/webhooks/shipmojo`

---

## Files Modified

1. `backend/controllers/shipmojoWebhookController.js` - Complete rewrite
2. `frontend/src/pages/SellerOrders.js` - Removed simulation, fixed Socket.IO

## Files Created

1. `backend/scripts/cancelOrderByAWB.js` - Manual order cancellation
2. `backend/scripts/listProcessingOrders.js` - List processing orders
3. `backend/scripts/checkOrderStatus.js` - Check order status

---

## Next Steps

1. ✅ Restart frontend to apply changes
2. ✅ Test with real ShipMozo webhooks
3. ✅ Monitor backend logs for webhook events
4. ✅ Deploy to production with permanent domain
5. ✅ Update ShipMozo webhook URL to production domain

---

## Monitoring

### Backend Logs to Watch:
```
📨 ShipMozo webhook received: ...
📦 Status: Delivered
📦 AWB: 365002177106
✅ Order ARROH-xxx delivered successfully
```

### Frontend Console:
```
Connected to orders real-time updates
📡 Order update received: { action: 'shipment_cancelled', ... }
Loaded X orders
```

---

## Summary

**Root Cause:** Frontend simulation was overriding real backend data, and webhook handler had incorrect field names.

**Solution:** Removed simulation, fixed webhook field mapping, improved Socket.IO stability.

**Result:** Real-time order status updates now working correctly with ShipMozo webhooks.
