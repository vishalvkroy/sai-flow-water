import React, { useState } from 'react';
import styled from 'styled-components';
import { FiInfo, FiX, FiUser, FiLock } from 'react-icons/fi';

const DemoContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const DemoButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
  }
`;

const DemoCard = styled.div`
  position: absolute;
  bottom: 60px;
  right: 0;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  width: 300px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    
    button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      
      &:hover {
        color: #3b82f6;
      }
    }
  }
  
  .credentials {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .credential-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
    
    .role {
      font-size: 0.75rem;
      font-weight: 600;
      color: #3b82f6;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    
    .cred-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .icon {
        color: #6b7280;
        font-size: 0.75rem;
      }
      
      .value {
        font-family: monospace;
        color: #1f2937;
        font-weight: 500;
      }
    }
  }
  
  .note {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    color: #92400e;
    line-height: 1.4;
  }
`;

const DemoCredentials = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DemoContainer>
      {isOpen && (
        <DemoCard>
          <div className="header">
            <h3>Demo Credentials</h3>
            <button onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>
          
          <div className="credentials">
            <div className="credential-item">
              <div className="role">Customer Account</div>
              <div className="cred-row">
                <FiUser className="icon" />
                <span className="value">john@example.com</span>
              </div>
              <div className="cred-row">
                <FiLock className="icon" />
                <span className="value">password123</span>
              </div>
            </div>
            
            <div className="credential-item">
              <div className="role">Admin Account</div>
              <div className="cred-row">
                <FiUser className="icon" />
                <span className="value">admin@saiflowwater.com</span>
              </div>
              <div className="cred-row">
                <FiLock className="icon" />
                <span className="value">admin123</span>
              </div>
            </div>
            
            <div className="credential-item">
              <div className="role">Seller Account</div>
              <div className="cred-row">
                <FiUser className="icon" />
                <span className="value">seller@saiflowwater.com</span>
              </div>
              <div className="cred-row">
                <FiLock className="icon" />
                <span className="value">seller123</span>
              </div>
            </div>
          </div>
          
          <div className="note">
            <strong>Note:</strong> These are demo credentials for testing. 
            The backend API is not running, so we're using mock authentication.
          </div>
        </DemoCard>
      )}
      
      <DemoButton onClick={() => setIsOpen(!isOpen)}>
        <FiInfo />
      </DemoButton>
    </DemoContainer>
  );
};

export default DemoCredentials;
