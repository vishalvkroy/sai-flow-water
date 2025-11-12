import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds for better reliability
  withCredentials: true, // Enable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for professional error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    // Log error for debugging
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data)
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getAllProducts: (params = {}) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  addReview: (productId, review) => api.post(`/products/${productId}/reviews`, review),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  updateCartItem: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
  getCartSummary: () => api.get('/cart/summary'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  createOrderFromCart: (orderData) => api.post('/orders/checkout', orderData),
  calculateDelivery: (deliveryData) => api.post('/orders/calculate-delivery', deliveryData),
  getMyOrders: () => api.get('/orders/myorders'),
  getMyStats: () => api.get('/orders/my-stats'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params = {}) => api.get('/orders', { params }),
  getSellerStats: () => api.get('/orders/seller/stats'),
  confirmOrder: (id) => api.put(`/orders/${id}/confirm`, {}, { timeout: 30000 }),
  getCourierRates: (id, customParams = null) => {
    const params = customParams ? {
      weight: customParams.weight,
      length: customParams.length,
      breadth: customParams.breadth,
      height: customParams.height
    } : {};
    return api.get(`/orders/${id}/courier-rates`, { params });
  },
  createShipment: (id, shippingData) => api.post(`/orders/${id}/ship`, shippingData),
  markAsShipped: (id) => api.put(`/orders/${id}/mark-shipped`),
  markAsPaid: (id) => api.put(`/orders/${id}/mark-paid`),
  markAsDelivered: (id) => api.put(`/orders/${id}/mark-delivered`),
  updateOrderToPaid: (id, paymentData) => api.put(`/orders/${id}/pay`, paymentData),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  cancelOrder: (id, reasonData) => api.put(`/orders/${id}/cancel`, reasonData),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  // Return & Refund APIs
  requestReturn: (id, returnData) => api.post(`/orders/${id}/return`, returnData),
  approveReturn: (id) => api.post(`/orders/${id}/return/approve`),
  rejectReturn: (id, reasonData) => api.post(`/orders/${id}/return/reject`, reasonData),
  markReturnReceived: (id) => api.post(`/orders/${id}/return/received`),
  processRefund: (id, refundData) => api.post(`/orders/${id}/refund`, refundData),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my'),
  getAllBookings: () => api.get('/bookings'),
  updateBookingStatus: (id, statusData) => api.put(`/bookings/${id}/status`, statusData),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`)
};

// Services API
export const servicesAPI = {
  createServiceBooking: (data) => api.post('/services', data),
  getMyServiceBookings: () => api.get('/services/my'),
  getAllServiceBookings: (params) => api.get('/services', { params }),
  getServiceBookingById: (id) => api.get(`/services/${id}`),
  updateServiceStatus: (id, data) => api.put(`/services/${id}/status`, data),
  cancelServiceBooking: (id, data) => api.put(`/services/${id}/cancel`, data),
  addServiceFeedback: (id, data) => api.put(`/services/${id}/feedback`, data),
  getServiceStats: () => api.get('/services/stats/overview'),
  calculatePricing: (data) => api.post('/services/calculate-pricing', data),
  createPaymentOrder: (id) => api.post(`/services/${id}/payment/create-order`),
  verifyPayment: (id, data) => api.post(`/services/${id}/payment/verify`, data),
  processRefund: (id, data) => api.post(`/services/${id}/payment/refund`, data)
};

// Analytics API
export const analyticsAPI = {
  getSellerDashboard: () => api.get('/analytics/seller-dashboard'),
  getCustomerDashboard: () => api.get('/analytics/customer-dashboard')
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (filter) => api.get('/notifications', { params: { filter } }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all')
};

// Customers API
export const customersAPI = {
  getAllCustomers: () => api.get('/customers'),
  getCustomerById: (id) => api.get(`/customers/${id}`)
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  getPaymentMethods: () => api.get('/payments/methods'),
};

// Uploads API
export const uploadsAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
  },
  uploadMultipleFiles: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
  },
  uploadProductImages: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('productImages', file);
    });
    return api.post('/upload/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
  },
  deleteImage: (imageUrl) => {
    return api.delete('/upload/delete', {
      data: { imageUrl },
      timeout: 15000, // 15 seconds for delete operations
    });
  },
};

// Export BASE_URL for Socket.IO and image URLs
export { BASE_URL };

export default api;