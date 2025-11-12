import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiX, FiRefreshCw } from 'react-icons/fi';

const ErrorContainer = styled(motion.div)`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const ErrorIcon = styled.div`
  color: #dc2626;
  flex-shrink: 0;
  margin-top: 0.125rem;
`;

const ErrorContent = styled.div`
  flex: 1;
  
  h4 {
    color: #dc2626;
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }
  
  p {
    color: #7f1d1d;
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.4;
  }
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'primary' ? '#dc2626' : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : '#dc2626'};
  border: 1px solid #dc2626;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#b91c1c' : '#fef2f2'};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(220, 38, 38, 0.1);
  }
`;

const ErrorMessage = ({ 
  title = 'Error', 
  message, 
  onRetry, 
  onDismiss,
  retryText = 'Try Again',
  showRetry = false,
  className = ''
}) => {
  return (
    <ErrorContainer
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <ErrorIcon>
        <FiAlertCircle size={18} />
      </ErrorIcon>
      
      <ErrorContent>
        <h4>{title}</h4>
        <p>{message}</p>
        
        {(showRetry || onRetry) && (
          <ErrorActions>
            {onRetry && (
              <ActionButton
                variant="primary"
                onClick={onRetry}
                type="button"
              >
                <FiRefreshCw size={12} />
                {retryText}
              </ActionButton>
            )}
          </ErrorActions>
        )}
      </ErrorContent>
      
      {onDismiss && (
        <CloseButton onClick={onDismiss} type="button">
          <FiX size={14} />
        </CloseButton>
      )}
    </ErrorContainer>
  );
};

export default ErrorMessage;
