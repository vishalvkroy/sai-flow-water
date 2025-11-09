import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: #6b7280;
  text-align: center;
`;

export const LoadingSpinner = ({ text = 'Loading...', size = 40 }) => (
  <SpinnerContainer>
    <div style={{ textAlign: 'center' }}>
      <Spinner style={{ width: size, height: size }} />
      {text && <LoadingText>{text}</LoadingText>}
    </div>
  </SpinnerContainer>
);

export const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh' 
  }}>
    <LoadingSpinner text="Loading page..." size={50} />
  </div>
);

export default LoadingSpinner;