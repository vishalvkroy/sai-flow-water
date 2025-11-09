import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiTrendingDown,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiDownload
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import SellerNavbar from '../components/Seller/SellerNavbar';
import { ordersAPI, productsAPI, customersAPI } from '../utils/api';
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

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  
  button {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.active {
      background: #3b82f6;
      color: white;
    }
    
    &:hover:not(.active) {
      background: #f3f4f6;
    }
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
    margin-bottom: 0.5rem;
  }
  
  .stat-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    
    &.positive {
      color: #10b981;
    }
    
    &.negative {
      color: #ef4444;
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const ChartHeader = styled.div`
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

const ChartContent = styled.div`
  padding: 1.5rem;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const MockChart = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to top, #4f46e5, transparent);
    opacity: 0.1;
  }
`;

const ProductsTable = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

const ProductRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  .product-name {
    font-weight: 600;
    color: #1f2937;
  }
  
  .product-metric {
    text-align: right;
    font-weight: 600;
    
    &.revenue {
      color: #10b981;
    }
    
    &.orders {
      color: #3b82f6;
    }
    
    &.quantity {
      color: #8b5cf6;
    }
  }
`;

const InsightCard = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .insights-list {
    display: grid;
    gap: 0.75rem;
  }
  
  .insight-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    backdrop-filter: blur(10px);
  }
`;

const SellerAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 0,
      previous: 0,
      change: 0
    },
    orders: {
      current: 0,
      previous: 0,
      change: 0
    },
    customers: {
      current: 0,
      previous: 0,
      change: 0
    },
    avgOrderValue: {
      current: 0,
      previous: 0,
      change: 0
    },
    conversionRate: {
      current: 0,
      previous: 0,
      change: 0
    },
    topProducts: []
  });

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh analytics every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...');

      // Fetch all data in parallel
      const [sellerStatsRes, customersRes, productsRes, ordersRes] = await Promise.all([
        ordersAPI.getSellerStats(),
        customersAPI.getAllCustomers(),
        productsAPI.getAllProducts(),
        ordersAPI.getAllOrders()
      ]);

      const stats = sellerStatsRes.data.data;
      const customersData = customersRes.data.data.customers || [];
      const orders = ordersRes.data.data.orders || [];

      // Calculate top products by revenue
      const productSales = {};
      orders.forEach(order => {
        order.orderItems?.forEach(item => {
          const productId = item.product?._id || item.product;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.name,
              revenue: 0,
              orders: 0,
              quantity: 0
            };
          }
          productSales[productId].revenue += (item.price * item.quantity);
          productSales[productId].orders += 1;
          productSales[productId].quantity += item.quantity;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Set analytics data
      setAnalytics({
        revenue: {
          current: stats.totalRevenue,
          previous: stats.totalRevenue - (stats.thisMonthRevenue || 0),
          change: stats.revenueGrowth
        },
        orders: {
          current: stats.totalOrders,
          previous: stats.totalOrders - (stats.todayOrders || 0),
          change: stats.ordersGrowth
        },
        customers: {
          current: customersData.length,
          previous: customersData.length,
          change: 0
        },
        avgOrderValue: {
          current: stats.averageOrderValue,
          previous: stats.averageOrderValue,
          change: 0
        },
        conversionRate: {
          current: 0,
          previous: 0,
          change: 0
        },
        topProducts: topProducts
      });

      console.log('Analytics data loaded:', {
        revenue: stats.totalRevenue,
        orders: stats.totalOrders,
        customers: customersData.length,
        topProducts: topProducts.length
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatChange = (change) => {
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const getChangeClass = (change) => {
    return change > 0 ? 'positive' : 'negative';
  };

  const getChangeIcon = (change) => {
    return change > 0 ? <FiTrendingUp /> : <FiTrendingDown />;
  };

  // Generate dynamic insights based on real data
  const insights = [];
  if (analytics.topProducts.length > 0) {
    insights.push(`Your best-selling product is ${analytics.topProducts[0].name} with ${analytics.topProducts[0].orders} orders`);
  }
  if (analytics.revenue.change !== 0) {
    insights.push(`Revenue ${analytics.revenue.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(analytics.revenue.change).toFixed(1)}% compared to previous period`);
  }
  if (analytics.orders.change !== 0) {
    insights.push(`Order volume ${analytics.orders.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(analytics.orders.change).toFixed(1)}%`);
  }
  if (analytics.avgOrderValue.current > 0) {
    insights.push(`Average order value is ₹${analytics.avgOrderValue.current.toFixed(0)}`);
  }
  if (insights.length === 0) {
    insights.push("Start selling to see analytics insights");
  }

  if (loading) {
    return (
      <PageContainer>
        <SellerNavbar />
        <MainContent>
          <LoadingSpinner />
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SellerNavbar />
      
      <MainContent>
        <PageHeader>
          <h1>Analytics Dashboard</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <TimeRangeSelector>
              <button 
                className={timeRange === '7d' ? 'active' : ''}
                onClick={() => setTimeRange('7d')}
              >
                7 Days
              </button>
              <button 
                className={timeRange === '30d' ? 'active' : ''}
                onClick={() => setTimeRange('30d')}
              >
                30 Days
              </button>
              <button 
                className={timeRange === '90d' ? 'active' : ''}
                onClick={() => setTimeRange('90d')}
              >
                90 Days
              </button>
            </TimeRangeSelector>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              <FiDownload />
              Export Report
            </button>
          </div>
        </PageHeader>

        <StatsGrid>
          <StatCard
            color="#10b981"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className={`stat-change ${getChangeClass(analytics.revenue.change)}`}>
                {getChangeIcon(analytics.revenue.change)}
                {formatChange(analytics.revenue.change)}
              </div>
            </div>
            <div className="stat-value">{formatCurrency(analytics.revenue.current)}</div>
            <div className="stat-label">Total Revenue</div>
          </StatCard>

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
              <div className={`stat-change ${getChangeClass(analytics.orders.change)}`}>
                {getChangeIcon(analytics.orders.change)}
                {formatChange(analytics.orders.change)}
              </div>
            </div>
            <div className="stat-value">{analytics.orders.current}</div>
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
                <FiUsers />
              </div>
              <div className={`stat-change ${getChangeClass(analytics.customers.change)}`}>
                {getChangeIcon(analytics.customers.change)}
                {formatChange(analytics.customers.change)}
              </div>
            </div>
            <div className="stat-value">{analytics.customers.current}</div>
            <div className="stat-label">New Customers</div>
          </StatCard>

          <StatCard
            color="#f59e0b"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiPackage />
              </div>
              <div className={`stat-change ${getChangeClass(analytics.avgOrderValue.change)}`}>
                {getChangeIcon(analytics.avgOrderValue.change)}
                {formatChange(analytics.avgOrderValue.change)}
              </div>
            </div>
            <div className="stat-value">{formatCurrency(analytics.avgOrderValue.current)}</div>
            <div className="stat-label">Avg Order Value</div>
          </StatCard>
        </StatsGrid>

        <InsightCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>📊 Key Insights</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <span>💡</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </InsightCard>

        <ChartsGrid>
          <ChartCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChartHeader>
              <h3>Revenue Trend</h3>
              <div style={{ color: analytics.revenue.change >= 0 ? '#10b981' : '#ef4444', fontWeight: '600', fontSize: '0.875rem' }}>
                {analytics.revenue.change >= 0 ? '↗' : '↘'} {formatChange(analytics.revenue.change)} vs last period
              </div>
            </ChartHeader>
            <ChartContent>
              <MockChart>
                📈 Revenue Chart
                <br />
                <small style={{ opacity: 0.7 }}>Interactive chart coming soon</small>
              </MockChart>
            </ChartContent>
          </ChartCard>

          <ChartCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ChartHeader>
              <h3>Order Status Distribution</h3>
            </ChartHeader>
            <ChartContent>
              <MockChart style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#d97706' }}>
                🥧 Pie Chart
                <br />
                <small style={{ opacity: 0.7 }}>Order status breakdown</small>
              </MockChart>
            </ChartContent>
          </ChartCard>
        </ChartsGrid>

        <ProductsTable>
          <TableHeader>
            <h3>Top Performing Products</h3>
          </TableHeader>
          <ProductRow style={{ background: '#f9fafb', fontWeight: '600', color: '#374151' }}>
            <div>Product Name</div>
            <div style={{ textAlign: 'right' }}>Revenue</div>
            <div style={{ textAlign: 'right' }}>Orders</div>
            <div style={{ textAlign: 'right' }}>Quantity</div>
          </ProductRow>
          {analytics.topProducts.length > 0 ? (
            analytics.topProducts.map((product, index) => (
              <ProductRow key={index}>
                <div className="product-name">{product.name}</div>
                <div className="product-metric revenue">{formatCurrency(product.revenue)}</div>
                <div className="product-metric orders">{product.orders}</div>
                <div className="product-metric quantity">{product.quantity || 0}</div>
              </ProductRow>
            ))
          ) : (
            <ProductRow>
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280' }}>
                No product sales data available yet
              </div>
            </ProductRow>
          )}
        </ProductsTable>
      </MainContent>
    </PageContainer>
  );
};

export default SellerAnalytics;
