import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiX,
  FiTruck,
  FiTool,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, servicesAPI } from '../utils/api';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import OrderTimeline from '../components/OrderTimeline';
import SpendingOverview from '../components/Customer/SpendingOverview';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .icon {
    width: 60px;
    height: 60px;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: ${props => props.color || '#3b82f6'}20;
    color: ${props => props.color || '#3b82f6'};
  }
  
  .content {
    flex: 1;
    
    .label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }
    
    .value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Tab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#f1f5f9'};
  }

  svg {
    font-size: 1.2rem;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
`;

const Section = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 2rem;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: #3b82f6;
    }
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderCard = styled(motion.div)`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .order-id {
    font-weight: 600;
    color: #1f2937;
    font-size: 1.125rem;
  }
  
  .order-date {
    color: #6b7280;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const OrderStatus = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'confirmed': return '#dbeafe';
      case 'processing': return '#e0e7ff';
      case 'shipped': return '#fef3c7';
      case 'out_for_delivery': return '#fef08a';
      case 'delivered': return '#d1fae5';
      case 'cancelled': return '#fee2e2';
      case 'refunded': return '#f3e8ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400e';
      case 'confirmed': return '#1e40af';
      case 'processing': return '#5b21b6';
      case 'shipped': return '#b45309';
      case 'out_for_delivery': return '#854d0e';
      case 'delivered': return '#065f46';
      case 'cancelled': return '#991b1b';
      case 'refunded': return '#6b21a8';
      default: return '#374151';
    }
  }};
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'confirmed': return '#d1fae5';
      case 'in_progress': return '#dbeafe';
      case 'completed': return '#d1fae5';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400e';
      case 'confirmed': return '#065f46';
      case 'in_progress': return '#1e40af';
      case 'completed': return '#065f46';
      case 'cancelled': return '#991b1b';
      default: return '#374151';
    }
  }};

  svg {
    font-size: 1rem;
  }
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;

  .info-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #4b5563;
    font-size: 0.95rem;

    svg {
      color: #9ca3af;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    strong {
      color: #1f2937;
    }
  }
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .item-image {
    width: 60px;
    height: 60px;
    border-radius: 0.5rem;
    overflow: hidden;
    background: #f3f4f6;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .item-details {
    flex: 1;
    
    .item-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }
    
    .item-quantity {
      font-size: 0.875rem;
      color: #6b7280;
    }
  }
  
  .item-price {
    font-weight: 600;
    color: #3b82f6;
  }
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  
  .total {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
    
    span {
      color: #6b7280;
      font-weight: 400;
      margin-right: 0.5rem;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ViewDetailsButton = styled(Link)`
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  
  .icon {
    font-size: 4rem;
    color: #d1d5db;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }
`;

const ProfileSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProfileCard = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    color: #6b7280;
    
    svg {
      color: #3b82f6;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [serviceBookings, setServiceBookings] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelledOrders, setShowCancelledOrders] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'services'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Setup Socket.IO for real-time updates
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const socket = io(socketUrl);
    
    // Join user room
    if (user?._id) {
      socket.emit('join_user', user._id);
      console.log('👤 Customer joined room:', user._id);
    }
    
    // Listen for order status updates
    socket.on('order_status_update', (data) => {
      console.log('✅ Order status update received:', data);
      
      // Show notification
      toast.success(data.message || `Order #${data.orderNumber} status updated to ${data.newStatus}`, {
        position: 'top-right',
        autoClose: 5000
      });
      
      // Update orders list in real-time
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId || order.orderNumber === data.orderNumber
            ? { ...order, orderStatus: data.newStatus, status: data.newStatus }
            : order
        )
      );
      
      // Refresh stats
      fetchData();
    });
    
    // Listen for tracking updates
    socket.on('tracking_updated', (data) => {
      console.log('📍 Tracking update received:', data);
      
      toast.info(`📍 ${data.currentStatus || data.message}`, {
        position: 'top-right',
        autoClose: 5000
      });
      
      // Update order with tracking info
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === data.orderId
            ? { 
                ...order, 
                trackingNumber: data.trackingNumber || order.trackingNumber,
                carrier: data.carrier || order.carrier 
              }
            : order
        )
      );
    });
    
    // Cleanup on unmount
    return () => {
      socket.disconnect();
      console.log('🔌 Customer disconnected from Socket.IO');
    };
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders and service bookings
      const ordersResponse = await ordersAPI.getMyOrders();
      
      // Fetch service bookings
      try {
        const servicesResponse = await servicesAPI.getMyServiceBookings();
        if (servicesResponse.data.success) {
          setServiceBookings(servicesResponse.data.data || []);
        }
      } catch (serviceError) {
        console.warn('Failed to fetch service bookings:', serviceError);
        setServiceBookings([]);
      }
      
      if (ordersResponse.data.success) {
        const ordersData = ordersResponse.data.data || [];
        // Separate active and cancelled orders
        const active = ordersData.filter(order => 
          (order.status || order.orderStatus) !== 'cancelled'
        );
        const cancelled = ordersData.filter(order => 
          (order.status || order.orderStatus) === 'cancelled'
        );
        setOrders(active);
        setCancelledOrders(cancelled);
        
        // Try to fetch stats, but fallback to calculating from orders if it fails
        try {
          const statsResponse = await ordersAPI.getMyStats();
          if (statsResponse.data.success) {
            setStats(statsResponse.data.data);
          }
        } catch (statsError) {
          console.warn('Stats API failed, calculating from orders:', statsError);
          
          // Fallback: Calculate stats from orders - use totalPrice not totalAmount
          const totalSpent = ordersData.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
          
          const calculatedStats = {
            totalOrders: ordersData.length,
            pendingOrders: ordersData.filter(o => {
              const status = o.status || o.orderStatus;
              return status === 'pending' || status === 'processing';
            }).length,
            completedOrders: ordersData.filter(o => {
              const status = o.status || o.orderStatus;
              return status === 'delivered';
            }).length,
            cancelledOrders: ordersData.filter(o => {
              const status = o.status || o.orderStatus;
              return status === 'cancelled';
            }).length,
            totalSpent: totalSpent,
            averageOrderValue: ordersData.length > 0 ? totalSpent / ordersData.length : 0,
            lastOrderDate: ordersData.length > 0 ? ordersData[0].createdAt : null,
            memberSince: user?.createdAt || null,
            customerStatus: ordersData.length > 10 ? 'VIP' : ordersData.length > 5 ? 'Regular' : 'New',
            categoriesPurchased: [],
            totalProducts: ordersData.reduce((sum, o) => sum + (o.orderItems?.length || 0), 0)
          };
          
          setStats(calculatedStats);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canCancelOrder = (order) => {
    // Only allow cancellation for pending orders
    const status = (order.status || order.orderStatus || '').toLowerCase();
    return status === 'pending';
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      const response = await ordersAPI.cancelOrder(cancellingOrder._id, { reason: cancelReason });
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        setCancellingOrder(null);
        setCancelReason('');
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Container>
          <LoadingSpinner text="Loading your dashboard..." />
        </Container>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Container>
        <Header>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your orders and account settings</p>
        </Header>

        {/* Spending Overview - Shows paid transactions only */}
        <SpendingOverview />

        <StatsGrid>
          <StatCard
            color="#3b82f6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="icon">
              <FiShoppingBag />
            </div>
            <div className="content">
              <div className="label">Total Orders</div>
              <div className="value">{stats.totalOrders}</div>
            </div>
          </StatCard>

          <StatCard
            color="#f59e0b"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="icon">
              <FiClock />
            </div>
            <div className="content">
              <div className="label">Pending</div>
              <div className="value">{stats.pendingOrders}</div>
            </div>
          </StatCard>

          <StatCard
            color="#10b981"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="icon">
              <FiCheckCircle />
            </div>
            <div className="content">
              <div className="label">Completed</div>
              <div className="value">{stats.completedOrders}</div>
            </div>
          </StatCard>
        </StatsGrid>

        <TabsContainer>
          <Tab active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
            <FiPackage />
            <span>My Orders</span>
          </Tab>
          <Tab active={activeTab === 'services'} onClick={() => setActiveTab('services')}>
            <FiTool />
            <span>Service Bookings</span>
            {serviceBookings.filter(s => s.status === 'pending').length > 0 && (
              <Badge>{serviceBookings.filter(s => s.status === 'pending').length}</Badge>
            )}
          </Tab>
        </TabsContainer>

        {activeTab === 'orders' && (
          <Section>
            <h2>
              <FiPackage />
              Recent Orders
            </h2>
          
          {orders.length === 0 ? (
            <EmptyState>
              <div className="icon">📦</div>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here</p>
              <ShopButton to="/products">
                <FiShoppingBag />
                Browse Products
              </ShopButton>
            </EmptyState>
          ) : (
            <OrdersList>
              {orders.map((order, index) => (
                <OrderCard
                  key={order._id || `order-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <OrderHeader>
                    <OrderInfo>
                      <div className="order-id">Order #{order._id ? order._id.slice(-8) : 'N/A'}</div>
                      <div className="order-date">
                        <FiCalendar />
                        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                      </div>
                    </OrderInfo>
                    <OrderStatus status={order.orderStatus || order.status || 'pending'}>
                      {(order.orderStatus || order.status || 'pending').replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </OrderStatus>
                  </OrderHeader>

                  <OrderItems>
                    {order.orderItems?.slice(0, 2).map((item, idx) => (
                      <OrderItem key={idx}>
                        <div className="item-image">
                          <img 
                            src={item.image || item.product?.images?.[0] || '/default-product.svg'} 
                            alt={item.name || item.product?.name || 'Product'}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-product.svg';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <div className="item-name">{item.name || item.product?.name || 'Product'}</div>
                          <div className="item-quantity">Quantity: {item.quantity}</div>
                        </div>
                        <div className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                      </OrderItem>
                    ))}
                    {order.orderItems?.length > 2 && (
                      <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        +{order.orderItems.length - 2} more items
                      </div>
                    )}
                  </OrderItems>

                  {/* Tracking Information */}
                  {order.awbCode && (
                    <div style={{
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      border: '1px solid #bae6fd'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <FiTruck style={{ color: '#0284c7', fontSize: '1.1rem' }} />
                        <strong style={{ color: '#0c4a6e', fontSize: '0.95rem' }}>Shipment Tracking</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.875rem' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Courier:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>{order.courierName || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>AWB:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>{order.awbCode}</strong>
                        </div>
                      </div>
                      {order.trackingNumber && order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: '#0284c7',
                            color: 'white',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#0369a1'}
                          onMouseOut={(e) => e.target.style.background = '#0284c7'}
                        >
                          <FiTruck />
                          Track Your Order
                        </a>
                      )}
                      {order.trackingNumber && !order.trackingUrl && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          background: '#fef3c7',
                          borderLeft: '3px solid #f59e0b',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#92400e'
                        }}>
                          <strong>📦 Shipment Reference:</strong> {order.trackingNumber}<br/>
                          <small>Tracking will be available once courier picks up the package</small>
                        </div>
                      )}
                    </div>
                  )}

                  <OrderFooter>
                    <div className="total">
                      <span>Total:</span>
                      ₹{(order.totalPrice || order.totalAmount || 0).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#dc2626'}
                          onMouseOut={(e) => e.target.style.background = '#ef4444'}
                        >
                          <FiX style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          Cancel Order
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#2563eb'}
                        onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                      >
                        <FiTruck />
                        Track Order
                      </button>
                      <ViewDetailsButton to={`/order/${order._id}`}>
                        View Details
                      </ViewDetailsButton>
                    </div>
                  </OrderFooter>
                </OrderCard>
              ))}
            </OrdersList>
          )}
          </Section>
        )}

        {activeTab === 'services' && (
          <Section>
            <h2>
              <FiTool />
              Service Bookings
            </h2>
          
          {serviceBookings.length === 0 ? (
            <EmptyState>
              <div className="icon">🔧</div>
              <h3>No service bookings yet</h3>
              <p>Book a service to see your bookings here</p>
              <ShopButton to="/service-booking">
                <FiTool />
                Book a Service
              </ShopButton>
            </EmptyState>
          ) : (
            <OrdersList>
              {serviceBookings.map((booking, index) => (
                <OrderCard
                  key={booking._id || `booking-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <OrderHeader>
                    <OrderInfo>
                      <div className="order-id">{booking.bookingNumber}</div>
                      <div className="order-date">
                        <FiCalendar />
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </OrderInfo>
                    <StatusBadge status={booking.status}>
                      {booking.status === 'pending' && <FiClock />}
                      {booking.status === 'confirmed' && <FiCheckCircle />}
                      {booking.status === 'in_progress' && <FiTool />}
                      {booking.status === 'completed' && <FiCheckCircle />}
                      {booking.status === 'cancelled' && <FiX />}
                      <span>{booking.status?.toUpperCase()}</span>
                    </StatusBadge>
                  </OrderHeader>

                  <OrderDetails>
                    <div className="info-row">
                      <FiTool />
                      <span><strong>Service:</strong> {booking.serviceType?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="info-row">
                      <FiPackage />
                      <span><strong>Product:</strong> {booking.productType}</span>
                    </div>
                    <div className="info-row">
                      <FiCalendar />
                      <span><strong>Scheduled:</strong> {new Date(booking.preferredDate).toLocaleDateString()} ({booking.preferredTimeSlot})</span>
                    </div>
                    <div className="info-row">
                      <FiMapPin />
                      <span><strong>Address:</strong> {booking.address?.city}, {booking.address?.state}</span>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="info-row" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '10px' }}>
                        <FiAlertCircle />
                        <span>Waiting for seller confirmation</span>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className="info-row" style={{ color: '#10b981', fontWeight: '600', marginTop: '10px' }}>
                        <FiCheckCircle />
                        <span>Confirmed! Technician will be assigned soon</span>
                      </div>
                    )}
                    {booking.assignedTechnician && (
                      <div className="info-row" style={{ marginTop: '10px', padding: '10px', background: '#f0f9ff', borderRadius: '8px' }}>
                        <FiUser />
                        <span><strong>Technician:</strong> {booking.assignedTechnician.name} - {booking.assignedTechnician.phone}</span>
                      </div>
                    )}
                  </OrderDetails>

                  <OrderFooter>
                    {booking.serviceCost > 0 && (
                      <div className="total">
                        <span>Service Cost:</span>
                        ₹{booking.serviceCost.toLocaleString()}
                      </div>
                    )}
                    {booking.status === 'pending' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to cancel this service booking?')) {
                            try {
                              await servicesAPI.cancelServiceBooking(booking._id, { reason: 'Cancelled by customer' });
                              toast.success('Service booking cancelled');
                              fetchData();
                            } catch (error) {
                              toast.error('Failed to cancel booking');
                            }
                          }
                        }}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <FiX style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Cancel Booking
                      </button>
                    )}
                  </OrderFooter>
                </OrderCard>
              ))}
            </OrdersList>
          )}
          </Section>
        )}

        {/* Cancelled Orders Section */}
        {cancelledOrders.length > 0 && (
          <Section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>
                <FiX />
                Cancelled Orders ({cancelledOrders.length})
              </h2>
              <button
                onClick={() => setShowCancelledOrders(!showCancelledOrders)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {showCancelledOrders ? 'Hide' : 'Show'} Cancelled Orders
              </button>
            </div>

            {showCancelledOrders && (
              <OrdersList>
                {cancelledOrders.map((order, index) => (
                  <OrderCard
                    key={order._id || `cancelled-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ borderLeft: '4px solid #ef4444' }}
                  >
                    <OrderHeader>
                      <OrderInfo>
                        <div className="order-id">Order #{order._id ? order._id.slice(-8) : 'N/A'}</div>
                        <div className="order-date">
                          <FiCalendar />
                          {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                        </div>
                      </OrderInfo>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <OrderStatus status="cancelled">Cancelled</OrderStatus>
                        {order.refundStatus && order.refundStatus !== 'none' && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: order.refundStatus === 'completed' ? '#d1fae5' : 
                                       order.refundStatus === 'processing' ? '#fef3c7' : 
                                       order.refundStatus === 'failed' ? '#fee2e2' : '#e0e7ff',
                            color: order.refundStatus === 'completed' ? '#065f46' : 
                                   order.refundStatus === 'processing' ? '#92400e' : 
                                   order.refundStatus === 'failed' ? '#991b1b' : '#3730a3'
                          }}>
                            Refund: {order.refundStatus.charAt(0).toUpperCase() + order.refundStatus.slice(1)}
                          </span>
                        )}
                      </div>
                    </OrderHeader>

                    <div style={{ 
                      background: '#fef2f2', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      marginBottom: '1rem',
                      borderLeft: '3px solid #ef4444'
                    }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#991b1b' }}>
                        Cancellation Reason:
                      </p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d' }}>
                        {order.cancellationReason || 'No reason provided'}
                      </p>
                      {order.cancelledAt && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#991b1b' }}>
                          Cancelled on: {formatDate(order.cancelledAt)}
                        </p>
                      )}
                    </div>

                    {order.refundStatus && order.refundStatus !== 'none' && (
                      <div style={{ 
                        background: '#eff6ff', 
                        padding: '1rem', 
                        borderRadius: '0.5rem', 
                        marginBottom: '1rem',
                        borderLeft: '3px solid #3b82f6'
                      }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
                          Refund Information:
                        </p>
                        <div style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
                          <p style={{ margin: '0.25rem 0' }}>
                            <strong>Amount:</strong> ₹{(order.refundAmount || order.totalPrice || 0).toLocaleString('en-IN')}
                          </p>
                          <p style={{ margin: '0.25rem 0' }}>
                            <strong>Status:</strong> {order.refundStatus.charAt(0).toUpperCase() + order.refundStatus.slice(1)}
                          </p>
                          {order.refundMethod && (
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong>Method:</strong> {order.refundMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                          )}
                          {order.refundInitiatedAt && (
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong>Initiated:</strong> {formatDate(order.refundInitiatedAt)}
                            </p>
                          )}
                          {order.refundCompletedAt && (
                            <p style={{ margin: '0.25rem 0' }}>
                              <strong>Completed:</strong> {formatDate(order.refundCompletedAt)}
                            </p>
                          )}
                          {(order.orderStatus === 'pending' || order.orderStatus === 'Pending') && (
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', fontStyle: 'italic' }}>
                              Your refund is being processed. It may take 5-7 business days to reflect in your account.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <OrderFooter>
                      <div className="total">
                        <span>Total:</span>
                        ₹{(order.totalPrice || order.totalAmount || 0).toLocaleString()}
                      </div>
                      <ViewDetailsButton to={`/order/${order._id}`}>
                        View Details
                      </ViewDetailsButton>
                    </OrderFooter>
                  </OrderCard>
                ))}
              </OrdersList>
            )}
          </Section>
        )}

        <Section>
          <h2>
            <FiUser />
            Account Information
          </h2>
          <ProfileSection>
            <ProfileCard>
              <h3>
                <FiUser />
                Personal Details
              </h3>
              <div className="info-row">
                <FiUser />
                <span>{user?.name}</span>
              </div>
              <div className="info-row">
                <FiMail />
                <span>{user?.email}</span>
              </div>
              <div className="info-row">
                <FiPhone />
                <span>{user?.phone || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <FiCalendar />
                <span>Member since {stats.memberSince ? formatDate(stats.memberSince) : 'N/A'}</span>
              </div>
              <div className="info-row">
                <FiCheckCircle />
                <span style={{ 
                  color: stats.customerStatus === 'VIP' ? '#8b5cf6' : stats.customerStatus === 'Regular' ? '#3b82f6' : '#6b7280',
                  fontWeight: 600 
                }}>
                  {stats.customerStatus} Customer
                </span>
              </div>
            </ProfileCard>

            <ProfileCard>
              <h3>
                <FiMapPin />
                Shipping Address
              </h3>
              {user?.address ? (
                <>
                  <div className="info-row">
                    <FiMapPin />
                    <span>{user.address.street}</span>
                  </div>
                  <div className="info-row">
                    <FiMapPin />
                    <span>{user.address.city}, {user.address.state}</span>
                  </div>
                  <div className="info-row">
                    <FiMapPin />
                    <span>{user.address.postalCode}, {user.address.country}</span>
                  </div>
                </>
              ) : (
                <div style={{ color: '#6b7280' }}>No address added yet</div>
              )}
            </ProfileCard>

            <ProfileCard>
              <h3>
                <FiShoppingBag />
                Shopping Stats
              </h3>
              <div className="info-row">
                <FiPackage />
                <span>{stats.totalProducts} Products Purchased</span>
              </div>
              <div className="info-row">
                <FiShoppingBag />
                <span>Avg Order: ₹{Math.round(stats.averageOrderValue).toLocaleString()}</span>
              </div>
              {stats.lastOrderDate && (
                <div className="info-row">
                  <FiClock />
                  <span>Last Order: {formatDate(stats.lastOrderDate)}</span>
                </div>
              )}
              {stats.categoriesPurchased && stats.categoriesPurchased.length > 0 && (
                <div className="info-row">
                  <FiCheckCircle />
                  <span>{stats.categoriesPurchased.length} Categories Explored</span>
                </div>
              )}
            </ProfileCard>
          </ProfileSection>
        </Section>

        {/* Cancel Order Modal */}
        {cancellingOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px', color: '#1F2937' }}>
                Cancel Order #{cancellingOrder._id?.slice(-8) || 'N/A'}
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px' }}>
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Reason for Cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancelling this order..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancelReason('');
                  }}
                  style={{
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason.trim()}
                  style={{
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: cancelReason.trim() ? 'pointer' : 'not-allowed',
                    opacity: cancelReason.trim() ? 1 : 0.5
                  }}
                >
                  Yes, Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Tracking Modal */}
        {showOrderDetails && selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          >
            <div style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                background: 'white',
                zIndex: 1
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', margin: 0 }}>
                  Order #{selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
                </h2>
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '4px'
                  }}
                >
                  <FiX />
                </button>
              </div>

              <div style={{ padding: '24px' }}>
                {/* Order Timeline */}
                <OrderTimeline order={selectedOrder} />

                {/* Order Items */}
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '16px' }}>
                    Order Items
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedOrder.orderItems?.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px'
                      }}>
                        <img
                          src={item.product?.images?.[0] || '/default-product.jpg'}
                          alt={item.product?.name || 'Product'}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '6px'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                            {item.product?.name || 'Product'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            Quantity: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div style={{ fontWeight: '700', color: '#059669' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>₹{(selectedOrder.itemsPrice || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Shipping:</span>
                    <span style={{ fontWeight: '600' }}>₹{(selectedOrder.shippingPrice || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Tax:</span>
                    <span style={{ fontWeight: '600' }}>₹{(selectedOrder.taxPrice || 0).toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '2px solid #0ea5e9',
                    marginTop: '8px'
                  }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#0c4a6e' }}>Total:</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                      ₹{(selectedOrder.totalPrice || selectedOrder.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '12px' }}>
                    Shipping Address
                  </h3>
                  <div style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{selectedOrder.shippingAddress?.fullName}</div>
                    <div>{selectedOrder.shippingAddress?.address}</div>
                    <div>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
                    </div>
                    <div style={{ marginTop: '8px', color: '#6b7280' }}>
                      <FiPhone style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </DashboardContainer>
  );
};

export default CustomerDashboard;
