# Cancel Button Added to Frontend

## Summary
Added cancel buttons to both seller dashboards for orders and service bookings, allowing sellers to cancel pending items directly from the UI.

## Changes Made

### 1. **SellerServices.js** (Service Bookings)
**Location:** `frontend/src/pages/SellerServices.js`

#### Added Function:
```javascript
const handleCancelBooking = async (bookingId) => {
  const reason = prompt('Please enter cancellation reason:');
  if (!reason) return;

  try {
    await servicesAPI.cancelServiceBooking(bookingId, { reason });
    toast.success('Booking cancelled successfully');
    fetchBookings();
    fetchStats();
    setShowModal(false);
  } catch (error) {
    console.error('Cancel booking error:', error);
    toast.error(error.response?.data?.message || 'Failed to cancel booking');
  }
};
```

#### Added UI Elements:
- **Cancel Button** appears in booking modal for:
  - Pending bookings
  - Confirmed bookings
  - In-progress bookings
- **Cancelled Filter** button to view cancelled bookings
- **Cancelled Status** message for already cancelled bookings

### 2. **SellerOrders.js** (Orders)
**Location:** `frontend/src/pages/SellerOrders.js`

#### Added Function:
```javascript
const handleCancelOrder = async (orderId) => {
  const reason = prompt('Please enter cancellation reason:');
  if (!reason) return;

  try {
    const response = await ordersAPI.cancelOrder(orderId, { reason });
    if (response.data.success) {
      toast.success('Order cancelled successfully');
      fetchOrders();
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    toast.error(error.response?.data?.message || 'Failed to cancel order');
  }
};
```

#### Added UI Elements:
- **Cancel Button** (red X icon) appears for orders with status:
  - Pending
  - Confirmed
  - Processing
- Button styled with red background (#ef4444)
- Uses `FiXCircle` icon

## User Experience

### For Service Bookings:
1. Seller opens service booking details
2. Sees "Cancel Booking" button (red) alongside other action buttons
3. Clicks cancel button
4. Prompted to enter cancellation reason
5. Booking is cancelled and status updates
6. Dashboard refreshes to show updated status
7. Can filter to view all cancelled bookings

### For Orders:
1. Seller views orders list
2. Sees cancel button (X icon) for eligible orders
3. Clicks cancel button
4. Prompted to enter cancellation reason
5. Order is cancelled and status updates
6. Order list refreshes automatically
7. Cancelled orders show in the list with cancelled status

## Button Visibility Rules

### Service Bookings - Cancel Button Shows When:
- ✅ Status = `pending`
- ✅ Status = `confirmed`
- ✅ Status = `in_progress`
- ❌ Status = `completed`
- ❌ Status = `cancelled`

### Orders - Cancel Button Shows When:
- ✅ Status = `pending`
- ✅ Status = `confirmed`
- ✅ Status = `processing`
- ❌ Status = `shipped`
- ❌ Status = `out_for_delivery`
- ❌ Status = `delivered`
- ❌ Status = `cancelled`

## API Integration

Both components use existing API functions:
- `servicesAPI.cancelServiceBooking(id, { reason })`
- `ordersAPI.cancelOrder(id, { reason })`

These APIs are already defined in `frontend/src/utils/api.js` and connect to the backend endpoints we created.

## Testing Steps

1. **Test Service Booking Cancellation:**
   - Login as seller
   - Go to Service Bookings page
   - Click on a pending/confirmed booking
   - Click "Cancel Booking" button
   - Enter reason and confirm
   - Verify booking status changes to cancelled
   - Check "Cancelled" filter shows the booking

2. **Test Order Cancellation:**
   - Login as seller
   - Go to Orders page
   - Find a pending/confirmed/processing order
   - Click the red X (cancel) button
   - Enter reason and confirm
   - Verify order status changes to cancelled
   - Verify order still appears in list with cancelled status

## Notes
- Cancellation requires a reason (mandatory)
- Uses browser `prompt()` for reason input
- Toast notifications confirm success/failure
- Both dashboards auto-refresh after cancellation
- Backend validates cancellation permissions
- Stock is automatically restored for cancelled orders
