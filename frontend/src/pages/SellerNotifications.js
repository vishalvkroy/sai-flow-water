import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiBell, 
  FiPackage, 
  FiShoppingCart, 
  FiTool,
  FiCheck,
  FiTrash2,
  FiFilter,
  FiDollarSign
} from 'react-icons/fi';
import SellerNavbar from '../components/Seller/SellerNavbar';
import { toast } from 'react-toastify';
import { notificationsAPI } from '../utils/api';
import { io } from 'socket.io-client';

const SellerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  // Setup Socket.IO for real-time notifications
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('new-notification', (notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast.info(notification.title);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications(filter);
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return FiShoppingCart;
      case 'service': return FiTool;
      case 'product': return FiPackage;
      case 'payment': return FiDollarSign;
      default: return FiBell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return '#3b82f6';
      case 'service': return '#10b981';
      case 'product': return '#f59e0b';
      case 'payment': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(notif =>
        notif._id === id ? { ...notif, read: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(notifications.filter(notif => notif._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    try {
      await notificationsAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  return (
    <>
      <SellerNavbar />
      <Container>
        <Header>
          <div>
            <h1>🔔 Notifications</h1>
            <p>Stay updated with your business activities</p>
          </div>
          <Stats>
            <StatBadge color="#3b82f6">
              {unreadCount} Unread
            </StatBadge>
            <StatBadge color="#64748b">
              {notifications.length} Total
            </StatBadge>
          </Stats>
        </Header>

        <Actions>
          <FilterGroup>
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
            >
              <FiFilter /> All
            </FilterButton>
            <FilterButton 
              active={filter === 'unread'} 
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </FilterButton>
            <FilterButton 
              active={filter === 'read'} 
              onClick={() => setFilter('read')}
            >
              Read
            </FilterButton>
          </FilterGroup>

          <ActionButtons>
            {unreadCount > 0 && (
              <ActionButton onClick={markAllAsRead}>
                <FiCheck /> Mark All Read
              </ActionButton>
            )}
            {notifications.length > 0 && (
              <ActionButton danger onClick={clearAll}>
                <FiTrash2 /> Clear All
              </ActionButton>
            )}
          </ActionButtons>
        </Actions>

        <NotificationList>
          {filteredNotifications.length === 0 ? (
            <EmptyState>
              <FiBell size={64} />
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </EmptyState>
          ) : (
            filteredNotifications.map((notif, index) => {
              const Icon = getNotificationIcon(notif.type);
              const color = getNotificationColor(notif.type);
              return (
                <NotificationCard
                  key={notif._id}
                  as={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  unread={!notif.read}
                >
                  <IconWrapper color={color}>
                    <Icon />
                  </IconWrapper>

                  <Content>
                    <Title>{notif.title}</Title>
                    <Message>{notif.message}</Message>
                    <Time>{getTimeAgo(notif.createdAt)}</Time>
                  </Content>

                  <NotifActions>
                    {!notif.read && (
                      <NotifButton onClick={() => markAsRead(notif._id)}>
                        <FiCheck /> Mark Read
                      </NotifButton>
                    )}
                    <NotifButton danger onClick={() => deleteNotification(notif._id)}>
                      <FiTrash2 />
                    </NotifButton>
                  </NotifActions>
                </NotificationCard>
              );
            })
          )}
        </NotificationList>
      </Container>
    </>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
`;

const Header = styled.div`
  max-width: 900px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #64748b;
    font-size: 1.1rem;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const StatBadge = styled.div`
  padding: 0.5rem 1rem;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Actions = styled.div`
  max-width: 900px;
  margin: 0 auto 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#3b82f6' : '#f1f5f9'};
    color: ${props => props.active ? 'white' : '#1e293b'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.danger ? '#fee2e2' : '#eff6ff'};
  color: ${props => props.danger ? '#dc2626' : '#3b82f6'};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.danger ? '#fecaca' : '#dbeafe'};
  }
`;

const NotificationList = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-left: 4px solid ${props => props.unread ? '#3b82f6' : 'transparent'};
  background: ${props => props.unread ? '#eff6ff' : 'white'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
`;

const Message = styled.div`
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
`;

const Time = styled.div`
  color: #94a3b8;
  font-size: 0.85rem;
`;

const NotifActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const NotifButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.danger ? '#fee2e2' : '#f1f5f9'};
  color: ${props => props.danger ? '#dc2626' : '#64748b'};
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.danger ? '#fecaca' : '#e2e8f0'};
    color: ${props => props.danger ? '#b91c1c' : '#1e293b'};
  }
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  svg {
    color: #cbd5e1;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #64748b;
  }
`;

export default SellerNotifications;
