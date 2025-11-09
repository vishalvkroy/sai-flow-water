import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifi, FiWifiOff, FiAlertCircle } from 'react-icons/fi';

const StatusContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  
  &.online {
    background: rgba(16, 185, 129, 0.9);
    color: white;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  &.offline {
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  &.reconnecting {
    background: rgba(245, 158, 11, 0.9);
    color: white;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem;
  
  &.pulse {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      setShowStatus(true);
      
      // Hide status after 3 seconds when back online
      setTimeout(() => {
        setShowStatus(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      setShowStatus(true);
    };

    // Check server connectivity
    const checkServerConnection = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          throw new Error('Server not responding');
        }
        
        // Server is reachable
        if (!isOnline && navigator.onLine) {
          setIsOnline(true);
          setIsReconnecting(false);
          setShowStatus(true);
          setTimeout(() => setShowStatus(false), 3000);
        }
      } catch (error) {
        // Server is not reachable
        if (navigator.onLine && isOnline) {
          setIsReconnecting(true);
          setShowStatus(true);
        }
      }
    };

    // Initial server check
    checkServerConnection();

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check server connection periodically
    const serverCheckInterval = setInterval(checkServerConnection, 10000);

    // Show status initially if offline
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(serverCheckInterval);
    };
  }, [isOnline]);

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <FiWifiOff />,
        text: 'No Internet Connection',
        className: 'offline'
      };
    }
    
    if (isReconnecting) {
      return {
        icon: <FiAlertCircle />,
        text: 'Reconnecting to Server...',
        className: 'reconnecting'
      };
    }
    
    return {
      icon: <FiWifi />,
      text: 'Connected',
      className: 'online'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <AnimatePresence>
      {showStatus && (
        <StatusContainer
          className={statusInfo.className}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <StatusIcon className={isReconnecting ? 'pulse' : ''}>
            {statusInfo.icon}
          </StatusIcon>
          <span>{statusInfo.text}</span>
        </StatusContainer>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
