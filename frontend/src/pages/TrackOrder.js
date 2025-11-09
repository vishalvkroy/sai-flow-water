import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiSearch,
  FiCheckCircle,
  FiTruck,
  FiMapPin,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import { ordersAPI } from '../utils/api';
import { toast } from 'react-toastify';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 1rem;

  h1 {
    font-size: 2.5rem;
    color: #1e293b;
    margin: 1rem 0 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 1.1rem;
  }
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
`;

const SearchContainer = styled.div`
  max-width: 700px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
`;

const SearchTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#f1f5f9'};
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.2rem;
  }
`;

const ResultContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const OrderInfo = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #64748b;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #1e293b;
  font-weight: 600;
`;

const StatusSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const StatusTitle = styled.h3`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
`;

const CurrentStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: ${props => `${props.color}15`};
  border: 2px solid ${props => props.color};
  border-radius: 12px;
  margin-bottom: 2rem;

  svg {
    font-size: 2rem;
    color: ${props => props.color};
  }

  span {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.color};
  }
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;

  &::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 2rem;

  &:last-child {
    padding-bottom: 0;
  }
`;

const TimelineDot = styled.div`
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 1rem;
  height: 1rem;
  background: ${props => props.color};
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px ${props => props.color};
`;

const TimelineContent = styled.div`
  padding-left: 1rem;
`;

const TimelineStatus = styled.div`
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const TimelineDate = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const TimelineNote = styled.div`
  font-size: 0.95rem;
  color: #475569;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const EmptyTimeline = styled.div`
  text-align: center;
  padding: 2rem;
  color: #94a3b8;

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1rem;
  }
`;

const AddressSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const AddressTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1rem;

  svg {
    color: #3b82f6;
  }
`;

const AddressContent = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  line-height: 1.8;

  p {
    margin: 0.25rem 0;
    color: #475569;
  }

  strong {
    color: #1e293b;
  }
`;

const NotFoundContainer = styled.div`
  max-width: 500px;
  margin: 3rem auto;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  svg {
    color: #ef4444;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    line-height: 1.6;
  }
`;

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [awbNumber, setAwbNumber] = useState('');
  const [searchType, setSearchType] = useState('order'); // 'order' or 'awb'
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    const searchValue = searchType === 'order' ? orderNumber : awbNumber;
    
    if (!searchValue.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      setNotFound(false);
      setOrder(null);

      // Get all orders and search
      const response = await ordersAPI.getMyOrders();
      
      let foundOrder;
      if (searchType === 'order') {
        foundOrder = response.data.data.find(o => 
          o.orderNumber.toLowerCase() === searchValue.toLowerCase()
        );
      } else {
        foundOrder = response.data.data.find(o => 
          o.awbCode && o.awbCode.toLowerCase() === searchValue.toLowerCase()
        );
      }

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setNotFound(true);
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Track order error:', error);
      toast.error('Failed to track order');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <FiClock />;
      case 'shipped':
        return <FiTruck />;
      case 'delivered':
        return <FiCheckCircle />;
      default:
        return <FiPackage />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <Container>
      <Header>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <IconWrapper>
            <FiPackage size={40} />
          </IconWrapper>
          <h1>Track Your Order</h1>
          <p>Enter your order number or AWB number to track your shipment</p>
        </motion.div>
      </Header>

      <SearchContainer
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SearchTabs>
          <Tab
            active={searchType === 'order'}
            onClick={() => setSearchType('order')}
          >
            Order Number
          </Tab>
          <Tab
            active={searchType === 'awb'}
            onClick={() => setSearchType('awb')}
          >
            AWB Number
          </Tab>
        </SearchTabs>

        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            value={searchType === 'order' ? orderNumber : awbNumber}
            onChange={(e) => searchType === 'order' ? setOrderNumber(e.target.value) : setAwbNumber(e.target.value)}
            placeholder={searchType === 'order' ? 'Enter Order Number (e.g., ORD-123...)' : 'Enter AWB Number'}
          />
          <SearchButton type="submit" disabled={loading}>
            <FiSearch />
            {loading ? 'Searching...' : 'Track'}
          </SearchButton>
        </SearchForm>
      </SearchContainer>

      {order && (
        <ResultContainer
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OrderInfo>
            <InfoRow>
              <InfoLabel>Order Number:</InfoLabel>
              <InfoValue>{order.orderNumber}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Order Date:</InfoLabel>
              <InfoValue>{new Date(order.createdAt).toLocaleDateString('en-IN')}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Total Amount:</InfoLabel>
              <InfoValue>₹{(order.totalPrice || order.totalAmount || 0).toLocaleString()}</InfoValue>
            </InfoRow>
            {order.awbCode && (
              <InfoRow>
                <InfoLabel>AWB Number:</InfoLabel>
                <InfoValue>{order.awbCode}</InfoValue>
              </InfoRow>
            )}
            {order.courierName && (
              <InfoRow>
                <InfoLabel>Courier:</InfoLabel>
                <InfoValue>{order.courierName}</InfoValue>
              </InfoRow>
            )}
          </OrderInfo>

          <StatusSection>
            <StatusTitle>Order Status</StatusTitle>
            <CurrentStatus color={getStatusColor(order.orderStatus)}>
              {getStatusIcon(order.orderStatus)}
              <span>{order.orderStatus?.toUpperCase()}</span>
            </CurrentStatus>

            <Timeline>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((history, index) => (
                  <TimelineItem key={index}>
                    <TimelineDot color={getStatusColor(history.status)} />
                    <TimelineContent>
                      <TimelineStatus>{history.status?.toUpperCase()}</TimelineStatus>
                      <TimelineDate>
                        {new Date(history.timestamp).toLocaleString('en-IN')}
                      </TimelineDate>
                      {history.note && <TimelineNote>{history.note}</TimelineNote>}
                    </TimelineContent>
                  </TimelineItem>
                ))
              ) : (
                <EmptyTimeline>
                  <FiAlertCircle />
                  <p>No tracking history available yet</p>
                </EmptyTimeline>
              )}
            </Timeline>
          </StatusSection>

          {order.shippingAddress && (
            <AddressSection>
              <AddressTitle>
                <FiMapPin />
                <span>Delivery Address</span>
              </AddressTitle>
              <AddressContent>
                <p><strong>{order.shippingAddress.fullName}</strong></p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </AddressContent>
            </AddressSection>
          )}
        </ResultContainer>
      )}

      {notFound && (
        <NotFoundContainer
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FiAlertCircle size={60} />
          <h3>Order Not Found</h3>
          <p>We couldn't find an order with that number. Please check and try again.</p>
        </NotFoundContainer>
      )}
    </Container>
  );
};

export default TrackOrder;