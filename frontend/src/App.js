import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import RoleProtectedRoute from './components/Common/RoleProtectedRoute';
import ConnectionStatus from './components/Common/ConnectionStatus';
import ErrorBoundary from './components/ErrorBoundary';
import Chatbot from './components/Chatbot';
import ChatbotSimple from './components/ChatbotSimple';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutSafe from './pages/CheckoutSafe';
import Booking from './pages/Booking';
import ServiceBooking from './pages/ServiceBooking';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CustomerDashboard from './pages/CustomerDashboard';
import Profile from './pages/Profile';
import SellerLogin from './pages/SellerLogin';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import SellerServices from './pages/SellerServices';
import SellerAnalytics from './pages/SellerAnalytics';
import SellerCustomers from './pages/SellerCustomers';
import SellerAddProduct from './pages/SellerAddProduct';
import SellerSettings from './pages/SellerSettings';
import SellerNotifications from './pages/SellerNotifications';
import CustomerProfile from './pages/CustomerProfileNew';
import Wishlist from './pages/Wishlist';
import OrderDetails from './pages/OrderDetails';
import CallRequests from './pages/CallRequests';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="App">
            <AppLayout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/seller-login" element={<SellerLogin />} />
                <Route path="/seller-dashboard" element={<SellerDashboard />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CheckoutSafe />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/booking" 
                  element={
                    <ProtectedRoute>
                      <Booking />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/service-booking" 
                  element={
                    <ProtectedRoute>
                      <ServiceBooking />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <CustomerProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller-dashboard" 
                  element={
                    <RoleProtectedRoute allowedRoles={['seller', 'admin']}>
                      <SellerDashboard />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/products" 
                  element={
                    <ProtectedRoute>
                      <SellerProducts />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/products/add" 
                  element={
                    <ProtectedRoute>
                      <SellerAddProduct />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/products/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <SellerAddProduct />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/orders" 
                  element={
                    <ProtectedRoute>
                      <SellerOrders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/services" 
                  element={
                    <ProtectedRoute>
                      <SellerServices />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/analytics" 
                  element={
                    <ProtectedRoute>
                      <SellerAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/customers" 
                  element={
                    <ProtectedRoute>
                      <SellerCustomers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/settings" 
                  element={
                    <ProtectedRoute>
                      <SellerSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/notifications" 
                  element={
                    <ProtectedRoute>
                      <SellerNotifications />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/seller/call-requests" 
                  element={
                    <ProtectedRoute>
                      <CallRequests />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/order/:orderId" 
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
            <ToastContainer 
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <ConnectionStatus />
            <Chatbot />
            <ChatbotSimple />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;