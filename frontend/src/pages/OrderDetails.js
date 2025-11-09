import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiArrowLeft,
  FiDownload
} from 'react-icons/fi';
import Navbar from '../components/Layout/Navbar';
import { ordersAPI } from '../utils/api';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const MainContent = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    transform: translateX(-4px);
  }
`;

const OrderCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const OrderHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .order-meta {
    display: flex;
    gap: 2rem;
    font-size: 0.875rem;
    opacity: 0.9;
  }
`;

const OrderBody = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const StatusTimeline = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 2rem 0;

  &::before {
    content: '';
    position: absolute;
    top: 2.5rem;
    left: 0;
    right: 0;
    height: 2px;
    background: #e5e7eb;
    z-index: 0;
  }
`;

const TimelineStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    background: ${props => props.active ? '#10b981' : '#e5e7eb'};
    color: ${props => props.active ? 'white' : '#9ca3af'};
    transition: all 0.3s ease;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 600;
    color: ${props => props.active ? '#10b981' : '#9ca3af'};
    text-align: center;
  }

  .date {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .info-item {
    display: flex;
    align-items: start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;

    svg {
      margin-top: 0.125rem;
      flex-shrink: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ProductsList = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
`;

const ProductItem = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 0.5rem;
    background: #f3f4f6;
  }

  .product-info {
    h4 {
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }

    .product-meta {
      font-size: 0.875rem;
      color: #6b7280;
    }
  }

  .product-price {
    text-align: right;

    .price {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
    }

    .quantity {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
  }
`;

const PriceSummary = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  max-width: 400px;
  margin-left: auto;

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;

    &.total {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e7eb;
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(motion.button)`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &.primary {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }
  }

  &.danger {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: white;
    color: #374151;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #f9fafb;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  
  &.pending {
    background: #fef3c7;
    color: #d97706;
  }
  
  &.confirmed {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  &.processing {
    background: #e0e7ff;
    color: #4f46e5;
  }
  
  &.shipped {
    background: #ddd6fe;
    color: #7c3aed;
  }
  
  &.delivered {
    background: #d1fae5;
    color: #065f46;
  }
  
  &.cancelled {
    background: #fee2e2;
    color: #991b1b;
  }
`;

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details for:', orderId);
      
      const response = await ordersAPI.getOrderById(orderId);
      
      if (response.data.success) {
        setOrder(response.data.data);
        console.log('Order details loaded:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await ordersAPI.cancelOrder(orderId);
      
      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: FiClock },
      { key: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
      { key: 'processing', label: 'Processing', icon: FiPackage },
      { key: 'shipped', label: 'Shipped', icon: FiTruck },
      { key: 'delivered', label: 'Delivered', icon: FiCheckCircle }
    ];

    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.orderStatus);

    return steps.map((step, index) => ({
      ...step,
      active: index <= currentIndex
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <Navbar />
        <MainContent>
          <LoadingSpinner />
        </MainContent>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <Navbar />
        <MainContent>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Order not found</h2>
            <Button className="primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </MainContent>
      </PageContainer>
    );
  }

  const canCancel = order.orderStatus === 'pending';

  return (
    <PageContainer>
      <Navbar />
      
      <MainContent>
        <BackButton
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiArrowLeft />
          Back to Dashboard
        </BackButton>

        <OrderCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <OrderHeader>
            <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <div className="order-meta">
              <span>Placed on {formatDate(order.createdAt)}</span>
              <span>•</span>
              <StatusBadge className={order.orderStatus}>
                {order.orderStatus.toUpperCase()}
              </StatusBadge>
            </div>
          </OrderHeader>

          <OrderBody>
            <Section>
              <h2>
                <FiTruck />
                Order Status
              </h2>
              <StatusTimeline>
                {getStatusSteps().map((step, index) => (
                  <TimelineStep key={step.key} active={step.active}>
                    <div className="icon">
                      <step.icon />
                    </div>
                    <div className="label">{step.label}</div>
                  </TimelineStep>
                ))}
              </StatusTimeline>
            </Section>

            <Section>
              <h2>
                <FiPackage />
                Order Items
              </h2>
              <ProductsList>
                {order.orderItems.map((item, index) => (
                  <ProductItem key={index}>
                    <img 
                      src={item.image || '/placeholder-product.png'} 
                      alt={item.name}
                      onError={(e) => e.target.src = '/placeholder-product.png'}
                    />
                    <div className="product-info">
                      <h4>{item.name}</h4>
                      <div className="product-meta">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <div className="product-price">
                      <div className="price">{formatCurrency(item.price * item.quantity)}</div>
                      <div className="quantity">{formatCurrency(item.price)} each</div>
                    </div>
                  </ProductItem>
                ))}
              </ProductsList>

              <PriceSummary>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </PriceSummary>
            </Section>

            <Section>
              <h2>
                <FiMapPin />
                Delivery Information
              </h2>
              <InfoGrid>
                <InfoCard>
                  <h3>
                    <FiMapPin />
                    Shipping Address
                  </h3>
                  <div className="info-item">
                    <span>{order.shippingAddress.street}</span>
                  </div>
                  <div className="info-item">
                    <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                  </div>
                  <div className="info-item">
                    <span>{order.shippingAddress.postalCode}</span>
                  </div>
                  <div className="info-item">
                    <span>{order.shippingAddress.country}</span>
                  </div>
                </InfoCard>

                <InfoCard>
                  <h3>
                    <FiPhone />
                    Contact Information
                  </h3>
                  <div className="info-item">
                    <FiMail />
                    <span>{order.user?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <FiPhone />
                    <span>{order.user?.phone || 'N/A'}</span>
                  </div>
                </InfoCard>
              </InfoGrid>
            </Section>

            <ActionButtons>
              <Button className="secondary" onClick={() => window.print()}>
                <FiDownload />
                Download Invoice
              </Button>
              {canCancel && (
                <Button 
                  className="danger" 
                  onClick={handleCancelOrder}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiXCircle />
                  Cancel Order
                </Button>
              )}
            </ActionButtons>
          </OrderBody>
        </OrderCard>
      </MainContent>
    </PageContainer>
  );
};

export default OrderDetails;
