import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiTrendingUp,
  FiPlus,
  FiBarChart2
} from 'react-icons/fi';
import SellerNavbar from '../components/Seller/SellerNavbar';
import EarningsOverview from '../components/Seller/EarningsOverview';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, productsAPI, customersAPI } from '../utils/api';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const MainContent = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const QuickActionCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
  }
  
  .action-icon {
    width: 60px;
    height: 60px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: white;
    background: ${props => props.color || '#3b82f6'};
    margin: 0 auto 1rem;
  }
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
  width: 100%;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
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

const RecentActivity = styled.div`
  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: white;
  }
  
  .activity-content {
    flex: 1;
  }
  
  .activity-title {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .activity-time {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const SellerDashboard = () => {
  const { user } = useAuth();
  const [, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeStats, setRealTimeStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    customers: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch real-time dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');

      // Fetch all data in parallel
      const [sellerStatsRes, ordersRes, customersRes, productsRes] = await Promise.all([
        ordersAPI.getSellerStats(),
        ordersAPI.getAllOrders(),
        customersAPI.getAllCustomers(),
        productsAPI.getAllProducts()
      ]);

      // Get seller stats with growth
      const stats = sellerStatsRes.data.data;

      // Process customers
      const customersData = customersRes.data.data.customers || [];

      // Process products
      const products = productsRes.data.data || [];
      const lowStockItems = products.filter(p => p.stock < 10).length;

      // Update stats with growth
      setRealTimeStats({
        totalProducts: products.length,
        totalOrders: stats.totalOrders,
        revenue: stats.totalRevenue,
        revenueGrowth: stats.revenueGrowth,
        ordersGrowth: stats.ordersGrowth,
        monthlyRevenueGrowth: stats.monthlyRevenueGrowth,
        todayOrders: stats.todayOrders,
        todayRevenue: stats.todayRevenue,
        thisMonthRevenue: stats.thisMonthRevenue,
        customers: customersData.length,
        pendingOrders: stats.pendingOrders,
        confirmedOrders: stats.confirmedOrders,
        processingOrders: stats.processingOrders,
        shippedOrders: stats.shippedOrders,
        deliveredOrders: stats.deliveredOrders,
        lowStockItems,
        averageOrderValue: stats.averageOrderValue
      });

      // Build recent activity from orders
      const orders = ordersRes.data.data.orders || [];
      const recentOrders = orders.slice(0, 10).map((order) => {
        const timeAgo = getTimeAgo(new Date(order.createdAt));
        const status = order.orderStatus || order.status;
        return {
          id: order._id,
          orderId: order._id,
          type: 'order',
          status: status,
          title: `Order #${order.orderNumber || order._id.slice(-8)} - ${status}`,
          time: timeAgo,
          color: status === 'delivered' ? '#10b981' : 
                 status === 'pending' ? '#f59e0b' : 
                 status === 'shipped' ? '#3b82f6' : '#8b5cf6'
        };
      });

      setRecentActivity(recentOrders);

      console.log('Dashboard data loaded with growth:', {
        totalOrders: stats.totalOrders,
        revenue: stats.totalRevenue,
        revenueGrowth: stats.revenueGrowth,
        ordersGrowth: stats.ordersGrowth,
        customers: customersData.length,
        products: products.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Handle authorization errors professionally
      if (error.response?.status === 403) {
        toast.error('Access Denied: You do not have permission to access this dashboard. Please contact support.', {
          duration: 5000,
          icon: '🔒'
        });
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          duration: 3000,
          icon: '⏰'
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.error('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Initialize Socket.IO connection for real-time updates
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiUrl.replace('/api', '');
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to real-time server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('new_order', (order) => {
      fetchDashboardData(); // Refresh data on new order
    });

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      newSocket.close();
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add new water purifier',
      icon: FiPlus,
      color: '#10b981',
      path: '/seller/products/add'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: FiShoppingCart,
      color: '#3b82f6',
      path: '/seller/orders'
    },
    {
      title: 'Analytics',
      description: 'View sales analytics',
      icon: FiBarChart2,
      color: '#8b5cf6',
      path: '/seller/analytics'
    },
    {
      title: 'Customers',
      description: 'Manage customers',
      icon: FiUsers,
      color: '#f59e0b',
      path: '/seller/customers'
    }
  ];

  if (loading) {
    return (
      <DashboardContainer>
        <SellerNavbar />
        <MainContent>
          <LoadingSpinner />
        </MainContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <SellerNavbar />
      
      <MainContent>
        <WelcomeSection>
          <h1>Welcome back, {user?.name || 'Seller'}! 👋</h1>
          <p>Here's what's happening with your Sai Flow Water store today.</p>
          {isConnected && (
            <RealTimeIndicator>
              <div className="pulse"></div>
              Real-time updates active
            </RealTimeIndicator>
          )}
        </WelcomeSection>

        {/* Earnings Overview - Separate Product & Service Earnings */}
        <EarningsOverview />

        {/* Quick Stats - No duplicate revenue */}
        <StatsGrid>
          <StatCard
            color="#3b82f6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiShoppingCart />
              </div>
              <div className="stat-change" style={{ color: realTimeStats.ordersGrowth >= 0 ? '#10b981' : '#ef4444' }}>
                <FiTrendingUp style={{ transform: realTimeStats.ordersGrowth < 0 ? 'rotate(180deg)' : 'none' }} />
                {realTimeStats.ordersGrowth >= 0 ? '+' : ''}{realTimeStats.ordersGrowth}%
              </div>
            </div>
            <div className="stat-value">{realTimeStats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </StatCard>

          <StatCard
            color="#8b5cf6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiPackage />
              </div>
              <div className="stat-change">
                <FiTrendingUp />
                {realTimeStats.pendingOrders} Pending
              </div>
            </div>
            <div className="stat-value">{realTimeStats.totalProducts}</div>
            <div className="stat-label">Products Listed</div>
          </StatCard>

          <StatCard
            color="#f59e0b"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-change" style={{ color: realTimeStats.monthlyRevenueGrowth >= 0 ? '#10b981' : '#ef4444' }}>
                <FiTrendingUp style={{ transform: realTimeStats.monthlyRevenueGrowth < 0 ? 'rotate(180deg)' : 'none' }} />
                {realTimeStats.monthlyRevenueGrowth >= 0 ? '+' : ''}{realTimeStats.monthlyRevenueGrowth}% MTD
              </div>
            </div>
            <div className="stat-value">{realTimeStats.customers}</div>
            <div className="stat-label">Active Customers</div>
          </StatCard>
        </StatsGrid>

        <QuickActions>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <QuickActionCard
                key={action.title}
                color={action.color}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => window.location.href = action.path}
              >
                <div className="action-icon">
                  <Icon />
                </div>
                <h4>{action.title}</h4>
                <p>{action.description}</p>
              </QuickActionCard>
            );
          })}
        </QuickActions>

        <ContentGrid>
          <Card
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CardHeader>
              <h3>Recent Activity</h3>
              <RealTimeIndicator>
                <div className="pulse"></div>
                Live
              </RealTimeIndicator>
            </CardHeader>
            <CardContent>
              <RecentActivity>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div className="activity-icon" style={{ background: activity.color }}>
                        {activity.type === 'order' && <FiShoppingCart />}
                        {activity.type === 'product' && <FiPackage />}
                        {activity.type === 'customer' && <FiUsers />}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.title}</div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    </div>
                    {activity.type === 'order' && activity.status === 'pending' && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await ordersAPI.confirmOrder(activity.orderId);
                            if (response.data.success) {
                              toast.success('Order confirmed!');
                              fetchDashboardData();
                            }
                          } catch (error) {
                            toast.error('Failed to confirm order');
                          }
                        }}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#059669'}
                        onMouseOut={(e) => e.target.style.background = '#10b981'}
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                ))}
              </RecentActivity>
            </CardContent>
          </Card>

          <div>
            <Card
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <CardHeader>
                <h3>Quick Stats</h3>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Pending Orders</span>
                    <span style={{ fontWeight: '600', color: '#f59e0b' }}>{realTimeStats.pendingOrders}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Low Stock Items</span>
                    <span style={{ fontWeight: '600', color: '#ef4444' }}>{realTimeStats.lowStockItems}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>This Month Revenue</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>₹{(realTimeStats.thisMonthRevenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <CardHeader>
                <h3>Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <ActionButton to="/seller/products/add">
                  <FiPlus />
                  Add New Product
                </ActionButton>
                <ActionButton to="/seller/orders" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <FiShoppingCart />
                  View All Orders
                </ActionButton>
                <ActionButton to="/seller/analytics" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <FiBarChart2 />
                  View Analytics
                </ActionButton>
              </CardContent>
            </Card>
          </div>
        </ContentGrid>
      </MainContent>
    </DashboardContainer>
  );
};

export default SellerDashboard;
