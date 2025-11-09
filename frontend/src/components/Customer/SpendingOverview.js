import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiDollarSign, FiPackage, FiTool } from 'react-icons/fi';
import { analyticsAPI } from '../../utils/api';

const SpendingOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await analyticsAPI.getCustomerDashboard();
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch spending stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
      </LoadingContainer>
    );
  }

  if (!stats) return null;

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Container>
      <Title>💰 Your Spending Overview</Title>
      
      <StatsGrid>
        {/* Total Spending */}
        <StatCard
          color="#8b5cf6"
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatIcon color="#8b5cf6">
            <FiDollarSign />
          </StatIcon>
          <StatContent>
            <StatLabel>Total Spent</StatLabel>
            <StatValue>{formatCurrency(stats.total.totalSpent)}</StatValue>
            <StatSubtext>{stats.total.transactionCount} transactions</StatSubtext>
          </StatContent>
        </StatCard>

        {/* Product Purchases */}
        <StatCard
          color="#3b82f6"
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatIcon color="#3b82f6">
            <FiPackage />
          </StatIcon>
          <StatContent>
            <StatLabel>Product Purchases</StatLabel>
            <StatValue>{formatCurrency(stats.products.totalSpent)}</StatValue>
            <StatSubtext>{stats.products.orderCount} orders</StatSubtext>
          </StatContent>
        </StatCard>

        {/* Service Bookings */}
        <StatCard
          color="#10b981"
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatIcon color="#10b981">
            <FiTool />
          </StatIcon>
          <StatContent>
            <StatLabel>Service Bookings</StatLabel>
            <StatValue>{formatCurrency(stats.services.totalSpent)}</StatValue>
            <StatSubtext>{stats.services.bookingCount} bookings</StatSubtext>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <InfoNote>
        <InfoIcon>ℹ️</InfoIcon>
        <InfoText>
          Spending shown includes only <strong>paid transactions</strong>. Pending payments are not included.
        </InfoText>
      </InfoNote>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
`;

const Spinner = styled.div`
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: ${props => `${props.color}08`};
  border-left: 4px solid ${props => props.color};
  border-radius: 8px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${props => `${props.color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${props => props.color};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
`;

const StatSubtext = styled.div`
  font-size: 12px;
  color: #94a3b8;
`;

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 6px;
`;

const InfoIcon = styled.div`
  font-size: 20px;
`;

const InfoText = styled.div`
  flex: 1;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.5;

  strong {
    font-weight: 600;
  }
`;

export default SpendingOverview;
