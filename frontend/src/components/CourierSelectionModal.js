import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTruck, FiClock, FiCheckCircle, FiPackage } from 'react-icons/fi';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 24px 28px;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ModalBody = styled.div`
  padding: 24px 28px;
`;

const CourierCard = styled(motion.div)`
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${props => props.selected ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : 'white'};
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }
`;

const CourierHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const CourierName = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CourierLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || '#667eea'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
`;

const CourierInfo = styled.div`
  flex: 1;
`;

const CourierTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const CourierSubtitle = styled.div`
  font-size: 0.85rem;
  color: #64748b;
`;

const RadioButton = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? '#667eea' : '#cbd5e1'};
  background: ${props => props.selected ? '#667eea' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &::after {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: white;
    opacity: ${props => props.selected ? 1 : 0};
    transition: opacity 0.2s;
  }
`;

const CourierDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #475569;
`;

const DetailIcon = styled.div`
  color: #667eea;
  font-size: 1rem;
`;

const Badge = styled.span`
  background: ${props => props.color || '#10b981'};
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
  position: sticky;
  bottom: 0;
  background: white;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: #f1f5f9;
    color: #475569;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const CourierSelectionModal = ({ isOpen, onClose, onSelectCourier, orderData }) => {
  const [selectedCourier, setSelectedCourier] = useState(null);

  // Professional courier options with realistic data
  const couriers = [
    {
      id: 'delhivery',
      name: 'Delhivery',
      subtitle: 'Fastest delivery partner',
      logo: 'D',
      color: '#EA4335',
      rate: '₹45',
      deliveryTime: '3-4 days',
      successRate: '99%',
      badge: 'RECOMMENDED',
      badgeColor: '#10b981'
    },
    {
      id: 'bluedart',
      name: 'Blue Dart',
      subtitle: 'Premium express service',
      logo: 'BD',
      color: '#0066CC',
      rate: '₹65',
      deliveryTime: '2-3 days',
      successRate: '98%',
      badge: 'EXPRESS',
      badgeColor: '#f59e0b'
    },
    {
      id: 'dtdc',
      name: 'DTDC',
      subtitle: 'Reliable nationwide delivery',
      logo: 'DT',
      color: '#FF6B35',
      rate: '₹40',
      deliveryTime: '4-5 days',
      successRate: '95%',
      badge: 'ECONOMICAL',
      badgeColor: '#8b5cf6'
    },
    {
      id: 'ecom',
      name: 'Ecom Express',
      subtitle: 'E-commerce specialist',
      logo: 'EE',
      color: '#00A859',
      rate: '₹35',
      deliveryTime: '5-6 days',
      successRate: '93%',
      badge: 'BUDGET',
      badgeColor: '#06b6d4'
    }
  ];

  const handleSelectCourier = (courier) => {
    setSelectedCourier(courier);
  };

  const handleConfirm = () => {
    if (selectedCourier) {
      onSelectCourier(selectedCourier);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContainer
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <Title>
                <FiTruck />
                Select Courier Partner
              </Title>
              <CloseButton onClick={onClose}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <FiPackage style={{ color: '#0284c7', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: '600', color: '#0c4a6e' }}>Order: {orderData?.orderNumber}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#075985' }}>
                  Destination: {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state} - {orderData?.shippingAddress?.postalCode}
                </div>
              </div>

              {couriers.map((courier) => (
                <CourierCard
                  key={courier.id}
                  selected={selectedCourier?.id === courier.id}
                  onClick={() => handleSelectCourier(courier)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CourierHeader>
                    <CourierName>
                      <CourierLogo color={courier.color}>
                        {courier.logo}
                      </CourierLogo>
                      <CourierInfo>
                        <CourierTitle>{courier.name}</CourierTitle>
                        <CourierSubtitle>{courier.subtitle}</CourierSubtitle>
                      </CourierInfo>
                    </CourierName>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {courier.badge && (
                        <Badge color={courier.badgeColor}>{courier.badge}</Badge>
                      )}
                      <RadioButton selected={selectedCourier?.id === courier.id} />
                    </div>
                  </CourierHeader>

                  <CourierDetails>
                    <DetailItem>
                      <DetailIcon>💰</DetailIcon>
                      <span>{courier.rate}</span>
                    </DetailItem>
                    <DetailItem>
                      <DetailIcon><FiClock /></DetailIcon>
                      <span>{courier.deliveryTime}</span>
                    </DetailItem>
                    <DetailItem>
                      <DetailIcon><FiCheckCircle /></DetailIcon>
                      <span>{courier.successRate}</span>
                    </DetailItem>
                  </CourierDetails>
                </CourierCard>
              ))}

              <ActionButtons>
                <Button onClick={onClose}>
                  Cancel
                </Button>
                <Button primary onClick={handleConfirm} disabled={!selectedCourier}>
                  {selectedCourier ? `Create Shipment with ${selectedCourier.name}` : 'Select a Courier'}
                </Button>
              </ActionButtons>
            </ModalBody>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default CourierSelectionModal;
