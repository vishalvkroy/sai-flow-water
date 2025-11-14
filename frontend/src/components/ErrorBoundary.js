import React from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiHome, FiAlertTriangle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ErrorContainer = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: #fef2f2;
  border-radius: 1rem;
  margin: 2rem;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
  max-width: 500px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? '#3b82f6' : '#f3f4f6'};
  color: ${props => props.primary ? 'white' : '#374151'};
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.primary ? '#2563eb' : '#e5e7eb'};
    transform: translateY(-1px);
  }
`;

const HomeLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary Caught:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Clear corrupted cart data when checkout crashes
    if (error.message && error.message.includes('Cannot read properties of null')) {
      console.log('🧹 Clearing corrupted cart data...');
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartData');
    }
  }

  handleRefresh = () => {
    // Clear all cart data and refresh
    localStorage.removeItem('cart');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartData');
    sessionStorage.clear();
    window.location.reload();
  };

  handleClearData = () => {
    // Clear all application data
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>
            <FiAlertTriangle />
          </ErrorIcon>
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>
            We encountered an error while loading this page. This is usually caused by corrupted cart data. 
            Don't worry - we can fix this quickly!
          </ErrorMessage>
          
          <ButtonGroup>
            <ActionButton primary onClick={this.handleRefresh}>
              <FiRefreshCw />
              Clear Cart & Refresh
            </ActionButton>
            
            <ActionButton onClick={this.handleClearData}>
              Clear All Data
            </ActionButton>
            
            <HomeLink to="/">
              <FiHome />
              Go to Home
            </HomeLink>
          </ButtonGroup>

          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Technical Details (Development)
              </summary>
              <pre style={{ 
                background: '#f3f4f6', 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                overflow: 'auto',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
