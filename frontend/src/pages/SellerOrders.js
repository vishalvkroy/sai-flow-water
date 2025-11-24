import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiPackage, 
  FiTruck, 
  FiClock, 
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiDownload,
  FiFilter,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import SellerNavbar from '../components/Seller/SellerNavbar';
import ShippingModal from '../components/ShippingModal';
import CancelOrderModal from '../components/Modals/CancelOrderModal';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { ordersAPI } from '../utils/api';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const MainContent = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
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
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#3b82f6'};
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    background: ${props => props.color || '#3b82f6'};
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .stat-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #10b981;
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
  
  .filters-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto auto;
    gap: 1rem;
    align-items: end;
  }
  
  @media (max-width: 1024px) {
    .filters-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
`;

const SearchInput = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
  
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
  
  .refresh-icon {
    animation: ${props => props.isRefreshing ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const OrdersTable = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const OrderRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    background: white;
    
    &:hover {
      background: white;
    }
  }
`;

const OrderInfo = styled.div`
  .order-id {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .order-date {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const CustomerInfo = styled.div`
  .customer-name {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .customer-email {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  &.pending {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.confirmed {
    background: #dbeafe;
    color: #1e40af;
  }
  
  &.processing {
    background: #e0e7ff;
    color: #5b21b6;
  }
  
  &.shipped {
    background: #fef3c7;
    color: #b45309;
  }
  
  &.out_for_delivery {
    background: #fef08a;
    color: #854d0e;
  }
  
  &.dispatched {
    background: #e0e7ff;
    color: #5b21b6;
  }
  
  &.delivered {
    background: #d1fae5;
    color: #065f46;
  }
  
  &.cancelled {
    background: #fee2e2;
    color: #991b1b;
  }
  
  &.refunded {
    background: #f3e8ff;
    color: #6b21a8;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #dbeafe;
  color: #1d4ed8;
  
  &:hover {
    background: #bfdbfe;
    transform: translateY(-1px);
  }
`;

const RealTimeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
  
  .pulse {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
    }
    
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }
`;

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50); // Show 50 orders per page
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Fetch real orders from database
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders from API...');
      
      const response = await ordersAPI.getAllOrders({ 
        page, 
        limit,
        status: statusFilter || undefined 
      });
      
      if (response.data.success) {
        const ordersData = response.data.data.orders || [];
        setOrders(ordersData);
        setTotalPages(response.data.pagination?.pages || 1);
        calculateStats(ordersData);
        console.log(`Loaded ${ordersData.length} orders`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when page, limit, or filter changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter]);

  // Set up Socket.IO connection (only once)
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', ''); // Remove /api suffix for socket connection
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to orders real-time updates');
      
      // Join seller room
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user._id) {
        socket.emit('join_seller', user._id);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from real-time updates');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for new orders
    socket.on('new_order', (newOrder) => {
      fetchOrders(); // Refresh orders
      toast.success('New order received!');
    });

    // Listen for order status updates
    socket.on('order_status_update', (updatedOrder) => {
      setOrders(prev => {
        const updated = prev.map(order => 
          order._id === updatedOrder.orderId ? { ...order, orderStatus: updatedOrder.status } : order
        );
        calculateStats(updated);
        return updated;
      });
    });

    // Listen for order updates (including shipment cancellations)
    socket.on('order_update', (data) => {
      console.log('📡 Order update received:', data);
      
      // Show notification for shipment cancellation
      if (data.action === 'shipment_cancelled') {
        toast.info(`Order ${data.orderNumber}: ${data.message}`, { autoClose: 5000 });
      }
      
      // Refresh orders to get latest data
      fetchOrders();
    });

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const calculateStats = (ordersList) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter(o => (o.status || o.orderStatus) === 'pending').length,
      confirmed: ordersList.filter(o => (o.status || o.orderStatus) === 'confirmed').length,
      processing: ordersList.filter(o => (o.status || o.orderStatus) === 'processing').length,
      shipped: ordersList.filter(o => (o.status || o.orderStatus) === 'shipped').length,
      delivered: ordersList.filter(o => (o.status || o.orderStatus) === 'delivered').length,
      cancelled: ordersList.filter(o => (o.status || o.orderStatus) === 'cancelled').length
    };
    setStats(stats);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
    toast.success('Orders refreshed');
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      const response = await ordersAPI.confirmOrder(orderId);
      if (response.data.success) {
        toast.success('Order confirmed successfully');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error('Failed to confirm order');
    }
  };

  const handleShipOrder = async (order) => {
    try {
      // Fetch full order details with product data
      console.log('📦 Fetching full order details for shipping...');
      const response = await ordersAPI.getOrderById(order._id);
      
      if (response.data.success) {
        console.log('✅ Order details fetched:', response.data.data);
        setSelectedOrder(response.data.data);
        setShowShippingModal(true);
      } else {
        // Fallback to existing order data
        setSelectedOrder(order);
        setShowShippingModal(true);
      }
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      // Fallback to existing order data
      setSelectedOrder(order);
      setShowShippingModal(true);
    }
  };

  const handleShipmentSubmit = async (shippingData) => {
    try {
      setIsCreatingShipment(true);
      
      // Update order with new shipping data before creating shipment
      const response = await ordersAPI.createShipment(selectedOrder._id, shippingData);
      
      if (response.data.success) {
        const { awbCode, courierName, trackingUrl, note } = response.data.data;
        
        toast.success(
          <div>
            <strong>✅ Shipment Created!</strong><br/>
            <strong>Courier:</strong> {courierName}<br/>
            <strong>Reference:</strong> {awbCode}<br/>
            {note && <div style={{fontSize: '0.85rem', marginTop: '4px', color: '#f59e0b'}}>{note}</div>}
            {trackingUrl && (
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6', marginTop: '8px', display: 'inline-block'}}>
                🔍 Track Shipment
              </a>
            )}
          </div>,
          { autoClose: 10000 }
        );
        
        setShowShippingModal(false);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create shipment';
      toast.error(errorMessage);
    } finally {
      setIsCreatingShipment(false);
    }
  };

  const handleMarkAsPaid = async (orderId) => {
    if (!window.confirm('Mark this COD order as paid?')) {
      return;
    }
    
    try {
      const response = await ordersAPI.markAsPaid(orderId);
      if (response.data.success) {
        toast.success('Order marked as paid successfully');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    if (!window.confirm('Mark this order as delivered?')) {
      return;
    }
    
    try {
      const response = await ordersAPI.markAsDelivered(orderId);
      if (response.data.success) {
        toast.success('Order marked as delivered successfully! Customer will receive a confirmation email.');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as delivered');
    }
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async (reason) => {
    try {
      const response = await ordersAPI.cancelOrder(orderToCancel._id, { reason });
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderId = order._id || order.id || '';
    const customerName = order.user?.name || order.customerName || '';
    const customerEmail = order.user?.email || order.customerEmail || '';
    const orderStatus = order.orderStatus || order.status || '';
    
    const matchesSearch = 
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });


  return (
    <PageContainer>
      <SellerNavbar />
      
      <MainContent>
        <PageHeader>
          <div>
            <h1>Orders Management</h1>
            {isConnected && (
              <RealTimeIndicator>
                <div className="pulse"></div>
                Real-time updates active
              </RealTimeIndicator>
            )}
          </div>
        </PageHeader>

        <StatsGrid>
          <StatCard
            color="#6b7280"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiPackage />
              </div>
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </StatCard>

          <StatCard
            color="#f59e0b"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiClock />
              </div>
            </div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Orders</div>
          </StatCard>

          <StatCard
            color="#3b82f6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiPackage />
              </div>
            </div>
            <div className="stat-value">{stats.processing}</div>
            <div className="stat-label">Processing</div>
          </StatCard>

          <StatCard
            color="#8b5cf6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiTruck />
              </div>
            </div>
            <div className="stat-value">{stats.dispatched}</div>
            <div className="stat-label">Dispatched</div>
          </StatCard>

          <StatCard
            color="#10b981"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiCheckCircle />
              </div>
            </div>
            <div className="stat-value">{stats.delivered}</div>
            <div className="stat-label">Delivered</div>
          </StatCard>
        </StatsGrid>

        <FiltersSection>
          <div className="filters-row">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Search Orders
              </label>
              <SearchInput>
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchInput>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Status
              </label>
              <FilterSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </FilterSelect>
            </div>
            
            <RefreshButton onClick={handleRefresh} isRefreshing={isRefreshing}>
              <FiRefreshCw className="refresh-icon" />
              Refresh
            </RefreshButton>
          </div>
        </FiltersSection>

        <OrdersTable>
          <TableHeader>
            <div>Order ID</div>
            <div>Customer</div>
            <div>Products</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
            <div>Actions</div>
          </TableHeader>
          
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <LoadingSpinner />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
              No orders found
            </div>
          ) : (
            filteredOrders.map((order, index) => {
              const orderId = order._id || order.id;
              const customerName = order.user?.name || order.customerName || 'N/A';
              const customerEmail = order.user?.email || order.customerEmail || 'N/A';
              const orderStatus = order.orderStatus || order.status || 'pending';
              const orderDate = new Date(order.createdAt || order.date).toLocaleDateString();
              const orderAmount = order.totalAmount || order.amount || 0;
              const productNames = order.orderItems?.map(item => item.name).join(', ') || order.products || 'N/A';
              
              return (
                <OrderRow
                  key={orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                >
                  <OrderInfo>
                    <div className="order-id">#{orderId.slice(-8).toUpperCase()}</div>
                    <div className="order-date">{orderDate}</div>
                  </OrderInfo>
                  
                  <CustomerInfo>
                    <div className="customer-name">{customerName}</div>
                    <div className="customer-email">{customerEmail}</div>
                  </CustomerInfo>
                  
                  <div style={{ fontSize: '0.875rem' }}>{productNames.substring(0, 40)}{productNames.length > 40 ? '...' : ''}</div>
                  <div>
                    <div style={{ fontWeight: '600' }}>₹{orderAmount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: order.isPaid ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                      {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                      {order.paymentMethod && ` (${order.paymentMethod})`}
                    </div>
                  </div>
                  
                  <StatusBadge className={orderStatus}>
                    {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                  </StatusBadge>
                  
                  <div>{orderDate}</div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Confirm Order - Only for pending orders */}
                    {orderStatus === 'pending' && (
                      <ActionButton 
                        title="Confirm Order" 
                        onClick={() => handleConfirmOrder(orderId)}
                        style={{ background: '#10b981', color: 'white' }}
                      >
                        <FiCheckCircle />
                      </ActionButton>
                    )}
                    
                    {/* Create Shipment - For confirmed orders or processing orders without shipment data (cancelled shipments) */}
                    {((orderStatus === 'confirmed' || orderStatus === 'processing') && !order.awbCode && !order.shipmojoShipmentId && orderStatus !== 'delivered') && (
                      <ActionButton 
                        title="Create Shipment" 
                        onClick={() => handleShipOrder(order)}
                        style={{ background: '#3b82f6', color: 'white' }}
                      >
                        <FiTruck />
                      </ActionButton>
                    )}
                    
                    {/* Mark as Delivered - Only for shipped orders */}
                    {orderStatus === 'shipped' && (
                      <ActionButton 
                        title="Mark as Delivered" 
                        onClick={() => handleMarkAsDelivered(orderId)}
                        style={{ background: '#8b5cf6', color: 'white' }}
                      >
                        ✅
                      </ActionButton>
                    )}
                    
                    {/* Mark as Paid - Only for COD orders that are delivered but not paid */}
                    {!order.isPaid && order.paymentMethod === 'COD' && (orderStatus === 'delivered' || orderStatus === 'shipped') && (
                      <ActionButton 
                        title="Mark as Paid" 
                        onClick={() => handleMarkAsPaid(orderId)}
                        style={{ background: '#f59e0b', color: 'white' }}
                      >
                        💰
                      </ActionButton>
                    )}
                    
                    {/* Cancel Order - Only for pending/confirmed orders (not after shipment created) */}
                    {orderStatus === 'pending' && (
                      <ActionButton 
                        title="Cancel Order" 
                        onClick={() => handleCancelOrder(order)}
                        style={{ background: '#ef4444', color: 'white' }}
                      >
                        <FiXCircle />
                      </ActionButton>
                    )}
                    <ActionButton title="View Order Details">
                      <FiEye />
                    </ActionButton>
                  </div>
                </OrderRow>
              );
            })
          )}
        </OrdersTable>
      </MainContent>

      {showShippingModal && selectedOrder && (
        <ShippingModal
          order={selectedOrder}
          onClose={() => {
            setShowShippingModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleShipmentSubmit}
          isLoading={isCreatingShipment}
        />
      )}

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancelOrder}
        orderNumber={orderToCancel?.orderNumber}
        type="order"
      />
    </PageContainer>
  );
};

export default SellerOrders;
