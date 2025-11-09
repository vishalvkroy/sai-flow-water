import React from 'react';
import styled from 'styled-components';
import { FiCheck, FiPackage, FiTruck, FiHome, FiClock } from 'react-icons/fi';

const TimelineContainer = styled.div`
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TimelineTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 40px;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 32px;
  
  &:last-child {
    padding-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -29px;
    top: 32px;
    bottom: 0;
    width: 2px;
    background: ${props => props.completed ? '#10b981' : '#e5e7eb'};
    display: ${props => props.isLast ? 'none' : 'block'};
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: -40px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.completed ? '#10b981' : props.current ? '#3b82f6' : '#e5e7eb'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 1;
  box-shadow: ${props => props.current ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'};
  animation: ${props => props.current ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
    }
  }
`;

const TimelineContent = styled.div`
  background: ${props => props.current ? '#eff6ff' : 'transparent'};
  padding: ${props => props.current ? '12px' : '0'};
  border-radius: 8px;
  border-left: ${props => props.current ? '3px solid #3b82f6' : 'none'};
  padding-left: ${props => props.current ? '12px' : '0'};
`;

const TimelineStatus = styled.div`
  font-weight: 600;
  color: ${props => props.completed ? '#059669' : props.current ? '#1e40af' : '#6b7280'};
  font-size: 1rem;
  margin-bottom: 4px;
`;

const TimelineDescription = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 4px;
`;

const TimelineTimestamp = styled.div`
  color: #9ca3af;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TrackingInfo = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae6fd;
`;

const TrackingLabel = styled.div`
  font-size: 0.75rem;
  color: #075985;
  font-weight: 600;
  margin-bottom: 4px;
`;

const TrackingValue = styled.div`
  font-size: 0.9rem;
  color: #0c4a6e;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  
  a {
    color: #2563eb;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const OrderTimeline = ({ order }) => {
  // Define order status flow
  const statusFlow = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: <FiPackage />
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      description: 'Seller has confirmed your order',
      icon: <FiCheck />
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Order is being prepared for shipment',
      icon: <FiPackage />
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Package has been picked up by courier',
      icon: <FiTruck />
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      description: 'Package is on the way to you',
      icon: <FiTruck />
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Package has been delivered',
      icon: <FiHome />
    }
  ];

  const currentStatus = order.orderStatus || 'pending';
  
  // Find current status index
  const currentIndex = statusFlow.findIndex(s => s.key === currentStatus);
  
  // Get status history with timestamps
  const getStatusTimestamp = (statusKey) => {
    const historyItem = order.statusHistory?.find(h => h.status === statusKey);
    if (historyItem) {
      return new Date(historyItem.timestamp).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return null;
  };

  return (
    <TimelineContainer>
      <TimelineTitle>
        <FiClock />
        Order Tracking
      </TimelineTitle>
      
      <Timeline>
        {statusFlow.map((status, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          const timestamp = getStatusTimestamp(status.key);
          const isLast = index === statusFlow.length - 1;
          
          return (
            <TimelineItem 
              key={status.key} 
              completed={completed}
              isLast={isLast}
            >
              <TimelineIcon completed={completed} current={current}>
                {completed ? <FiCheck /> : status.icon}
              </TimelineIcon>
              
              <TimelineContent current={current}>
                <TimelineStatus completed={completed} current={current}>
                  {status.label}
                </TimelineStatus>
                <TimelineDescription>
                  {status.description}
                </TimelineDescription>
                {timestamp && (
                  <TimelineTimestamp>
                    <FiClock size={12} />
                    {timestamp}
                  </TimelineTimestamp>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
      
      {order.awbCode && (
        <TrackingInfo>
          <TrackingLabel>Tracking Information</TrackingLabel>
          <TrackingValue>
            <strong>AWB:</strong> {order.awbCode}
          </TrackingValue>
          <TrackingValue>
            <strong>Courier:</strong> {order.courierName}
          </TrackingValue>
          {order.trackingNumber && (
            <TrackingValue>
              <a 
                href={`https://www.shipmozo.com/track/${order.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🔍 Track Your Package
              </a>
            </TrackingValue>
          )}
        </TrackingInfo>
      )}
    </TimelineContainer>
  );
};

export default OrderTimeline;
