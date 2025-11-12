import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiPackage, FiTool, FiClock } from 'react-icons/fi';
import { analyticsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { connectSocket, disconnectSocket, onEvent, offEvent } from '../../utils/socket';

const EarningsOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    // Setup Socket.IO for real-time updates
    connectSocket(null, 'seller');
    
    // Listen for payment events
    const handlePaymentReceived = () => {
      console.log('💰 Payment received - Refreshing analytics...');
      fetchStats();
    };
    
    const handleOrderPaid = () => {
      console.log('💰 Order marked as paid - Refreshing analytics...');
      fetchStats();
    };
    
    onEvent('payment-received', handlePaymentReceived);
    onEvent('order-paid', handleOrderPaid);

    return () => {
      clearInterval(interval);
      offEvent('payment-received', handlePaymentReceived);
      offEvent('order-paid', handleOrderPaid);
      disconnectSocket();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await analyticsAPI.getSellerDashboard();
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load earnings data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading earnings data...</p>
      </LoadingContainer>
    );
  }

  if (!stats) {
    return <ErrorMessage>Failed to load earnings data</ErrorMessage>;
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Container>
      {/* Tab Navigation */}
      <TabContainer>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          <FiDollarSign /> Overview
        </Tab>
        <Tab active={activeTab === 'products'} onClick={() => setActiveTab('products')}>
          <FiPackage /> Products
        </Tab>
        <Tab active={activeTab === 'services'} onClick={() => setActiveTab('services')}>
          <FiTool /> Services
        </Tab>
      </TabContainer>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SectionTitle>💰 Total Earnings Overview</SectionTitle>
          
          <StatsGrid>
            {/* Today's Total */}
            <StatCard color="#10b981">
              <StatIcon><FiDollarSign /></StatIcon>
              <StatContent>
                <StatLabel>Today's Earnings</StatLabel>
                <StatValue>{formatCurrency(stats.total.today.revenue)}</StatValue>
                <StatSubtext>{stats.total.today.transactions} transactions</StatSubtext>
              </StatContent>
            </StatCard>

            {/* This Month's Total */}
            <StatCard color="#3b82f6">
              <StatIcon><FiTrendingUp /></StatIcon>
              <StatContent>
                <StatLabel>This Month</StatLabel>
                <StatValue>{formatCurrency(stats.total.thisMonth.revenue)}</StatValue>
                <StatSubtext>{stats.total.thisMonth.transactions} transactions</StatSubtext>
              </StatContent>
            </StatCard>

            {/* All Time Total */}
            <StatCard color="#8b5cf6">
              <StatIcon><FiDollarSign /></StatIcon>
              <StatContent>
                <StatLabel>All Time Earnings</StatLabel>
                <StatValue>{formatCurrency(stats.total.allTime.revenue)}</StatValue>
                <StatSubtext>{stats.total.allTime.transactions} transactions</StatSubtext>
              </StatContent>
            </StatCard>

            {/* Monthly Growth */}
            <StatCard color={stats.growth.monthly >= 0 ? '#10b981' : '#ef4444'}>
              <StatIcon><FiTrendingUp /></StatIcon>
              <StatContent>
                <StatLabel>Monthly Growth</StatLabel>
                <StatValue>{stats.growth.monthly}%</StatValue>
                <StatSubtext>vs last month</StatSubtext>
              </StatContent>
            </StatCard>
          </StatsGrid>

          {/* Breakdown */}
          <BreakdownSection>
            <BreakdownTitle>Revenue Breakdown</BreakdownTitle>
            <BreakdownGrid>
              <BreakdownCard>
                <BreakdownIcon color="#3b82f6"><FiPackage /></BreakdownIcon>
                <BreakdownContent>
                  <BreakdownLabel>Product Sales</BreakdownLabel>
                  <BreakdownValue>{formatCurrency(stats.summary.productRevenue)}</BreakdownValue>
                </BreakdownContent>
              </BreakdownCard>

              <BreakdownCard>
                <BreakdownIcon color="#10b981"><FiTool /></BreakdownIcon>
                <BreakdownContent>
                  <BreakdownLabel>Service Bookings</BreakdownLabel>
                  <BreakdownValue>{formatCurrency(stats.summary.serviceRevenue)}</BreakdownValue>
                </BreakdownContent>
              </BreakdownCard>

              <BreakdownCard>
                <BreakdownIcon color="#f59e0b"><FiDollarSign /></BreakdownIcon>
                <BreakdownContent>
                  <BreakdownLabel>Cancellation Fees</BreakdownLabel>
                  <BreakdownValue>{formatCurrency(stats.summary.cancellationFees)}</BreakdownValue>
                </BreakdownContent>
              </BreakdownCard>

              <BreakdownCard>
                <BreakdownIcon color="#ef4444"><FiClock /></BreakdownIcon>
                <BreakdownContent>
                  <BreakdownLabel>Pending Collections</BreakdownLabel>
                  <BreakdownValue>{formatCurrency(stats.summary.pendingCollections)}</BreakdownValue>
                </BreakdownContent>
              </BreakdownCard>
            </BreakdownGrid>
          </BreakdownSection>
        </motion.div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SectionTitle>📦 Product Sales Earnings</SectionTitle>
          
          <StatsGrid>
            <StatCard color="#3b82f6">
              <StatIcon><FiDollarSign /></StatIcon>
              <StatContent>
                <StatLabel>Today</StatLabel>
                <StatValue>{formatCurrency(stats.products.today.revenue)}</StatValue>
                <StatSubtext>{stats.products.today.orders} orders</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard color="#10b981">
              <StatIcon><FiTrendingUp /></StatIcon>
              <StatContent>
                <StatLabel>This Month</StatLabel>
                <StatValue>{formatCurrency(stats.products.thisMonth.revenue)}</StatValue>
                <StatSubtext>{stats.products.thisMonth.orders} orders</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard color="#8b5cf6">
              <StatIcon><FiPackage /></StatIcon>
              <StatContent>
                <StatLabel>All Time</StatLabel>
                <StatValue>{formatCurrency(stats.products.allTime.revenue)}</StatValue>
                <StatSubtext>{stats.products.allTime.orders} orders</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard color="#f59e0b">
              <StatIcon><FiClock /></StatIcon>
              <StatContent>
                <StatLabel>Pending (COD)</StatLabel>
                <StatValue>{formatCurrency(stats.products.pending.revenue)}</StatValue>
                <StatSubtext>{stats.products.pending.orders} orders</StatSubtext>
              </StatContent>
            </StatCard>
          </StatsGrid>

          <InfoBox>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>
              <strong>Note:</strong> Product earnings shown are from PAID orders only. COD orders appear in "Pending" until payment is received.
            </InfoText>
          </InfoBox>
        </motion.div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SectionTitle>🔧 Service Bookings Earnings</SectionTitle>
          
          <StatsGrid>
            <StatCard color="#10b981">
              <StatIcon><FiDollarSign /></StatIcon>
              <StatContent>
                <StatLabel>Today</StatLabel>
                <StatValue>{formatCurrency(stats.services.today.totalRevenue)}</StatValue>
                <StatSubtext>
                  Advance: {formatCurrency(stats.services.today.advanceRevenue)} | 
                  Remaining: {formatCurrency(stats.services.today.remainingRevenue)}
                </StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard color="#3b82f6">
              <StatIcon><FiTrendingUp /></StatIcon>
              <StatContent>
                <StatLabel>This Month</StatLabel>
                <StatValue>{formatCurrency(stats.services.thisMonth.totalRevenue)}</StatValue>
                <StatSubtext>
                  Advance: {formatCurrency(stats.services.thisMonth.advanceRevenue)} | 
                  Remaining: {formatCurrency(stats.services.thisMonth.remainingRevenue)}
                </StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard color="#8b5cf6">
              <StatIcon><FiTool /></StatIcon>
              <StatContent>
                <StatLabel>All Time</StatLabel>
                <StatValue>{formatCurrency(stats.services.allTime.totalRevenue)}</StatValue>
                <StatSubtext>{stats.services.allTime.bookings} bookings</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard color="#f59e0b">
              <StatIcon><FiClock /></StatIcon>
              <StatContent>
                <StatLabel>Pending Collection</StatLabel>
                <StatValue>{formatCurrency(stats.services.pendingCollection.amount)}</StatValue>
                <StatSubtext>{stats.services.pendingCollection.bookings} bookings</StatSubtext>
              </StatContent>
            </StatCard>
          </StatsGrid>

          {/* Cancellation Fees */}
          <BreakdownSection>
            <BreakdownTitle>Additional Revenue</BreakdownTitle>
            <BreakdownCard>
              <BreakdownIcon color="#10b981"><FiDollarSign /></BreakdownIcon>
              <BreakdownContent>
                <BreakdownLabel>Cancellation Fees Earned</BreakdownLabel>
                <BreakdownValue>{formatCurrency(stats.services.cancellationFees.amount)}</BreakdownValue>
                <StatSubtext>{stats.services.cancellationFees.count} cancellations</StatSubtext>
              </BreakdownContent>
            </BreakdownCard>
          </BreakdownSection>

          <InfoBox>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>
              <strong>Note:</strong> Service earnings include advance payments (50%) received online and remaining amounts collected after service completion. Pending collection shows remaining amounts yet to be collected.
            </InfoText>
          </InfoBox>
        </motion.div>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  p {
    margin-top: 20px;
    color: #64748b;
    font-size: 16px;
  }
`;

const Spinner = styled.div`
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #ef4444;
  font-size: 16px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#3b82f6' : '#f1f5f9'};
    color: ${props => props.active ? 'white' : '#1e293b'};
  }

  svg {
    font-size: 18px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid ${props => props.color};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: ${props => props.color || '#3b82f6'}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${props => props.color || '#3b82f6'};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StatSubtext = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const BreakdownSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const BreakdownTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
`;

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const BreakdownCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const BreakdownIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${props => props.color};
`;

const BreakdownContent = styled.div`
  flex: 1;
`;

const BreakdownLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
`;

const BreakdownValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  margin-top: 20px;
`;

const InfoIcon = styled.div`
  font-size: 24px;
`;

const InfoText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #1e40af;
  line-height: 1.6;

  strong {
    font-weight: 600;
  }
`;

export default EarningsOverview;
