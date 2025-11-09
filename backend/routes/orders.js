const express = require('express');
const {
  createOrder,
  createOrderFromCart,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  getMyStats,
  getSellerStats,
  confirmOrder,
  getCourierRates,
  createShipment,
  markAsShipped,
  markAsPaid,
  markAsDelivered,
  calculateDelivery,
  requestReturn,
  approveReturn,
  rejectReturn,
  markReturnReceived,
  processRefund
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', protect, createOrder);
router.post('/checkout', protect, createOrderFromCart);
router.post('/calculate-delivery', protect, calculateDelivery);
router.get('/myorders', protect, getMyOrders);
router.get('/my-stats', protect, getMyStats);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/return', protect, requestReturn);

// Seller/Admin routes
router.get('/seller/stats', protect, authorize('admin', 'seller'), getSellerStats);
router.post('/:id/return/approve', protect, authorize('admin', 'seller'), approveReturn);
router.post('/:id/return/reject', protect, authorize('admin', 'seller'), rejectReturn);
router.post('/:id/return/received', protect, authorize('admin', 'seller'), markReturnReceived);
router.post('/:id/refund', protect, authorize('admin', 'seller'), processRefund);
router.get('/', protect, authorize('admin', 'seller'), getOrders);
router.put('/:id/confirm', protect, authorize('admin', 'seller'), confirmOrder);
router.get('/:id/courier-rates', protect, authorize('admin', 'seller'), getCourierRates);
router.post('/:id/ship', protect, authorize('admin', 'seller'), createShipment);
router.put('/:id/mark-shipped', protect, authorize('admin', 'seller'), markAsShipped);
router.put('/:id/mark-paid', protect, authorize('admin', 'seller'), markAsPaid);
router.put('/:id/mark-delivered', protect, authorize('admin', 'seller'), markAsDelivered);
router.put('/:id/deliver', protect, authorize('admin', 'seller'), updateOrderToDelivered);
router.put('/:id/status', protect, authorize('admin', 'seller'), updateOrderStatus);

module.exports = router;