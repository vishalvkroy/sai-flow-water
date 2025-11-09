import React from 'react';
import styled from 'styled-components';
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const TermsModal = ({ show, onClose, onAccept, pricingInfo }) => {
  if (!show) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Terms & Conditions</h2>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <Content>
          <Section>
            <SectionTitle>
              <FiCheckCircle /> Service Pricing
            </SectionTitle>
            {pricingInfo && (
              <PricingBox>
                <PricingRow>
                  <span>Distance from Warehouse:</span>
                  <strong>{pricingInfo.distance} km ({pricingInfo.distanceRange})</strong>
                </PricingRow>
                <PricingRow>
                  <span>Total Service Cost:</span>
                  <strong>₹{pricingInfo.serviceCost}</strong>
                </PricingRow>
                <PricingRow highlight>
                  <span>Advance Payment (50%):</span>
                  <strong>₹{pricingInfo.advanceAmount}</strong>
                </PricingRow>
                <PricingRow>
                  <span>Remaining Amount:</span>
                  <strong>₹{pricingInfo.remainingAmount}</strong>
                </PricingRow>
              </PricingBox>
            )}
          </Section>

          <Section>
            <SectionTitle>
              <FiAlertCircle /> Cancellation Policy
            </SectionTitle>
            <PolicyList>
              <li>
                <strong>Cancellation Fee:</strong> If you cancel the service after the technician has visited 
                or while the technician is on the way, a cancellation fee of <strong>₹100</strong> will be deducted 
                from your refund.
              </li>
              <li>
                <strong>Refund Process:</strong> The remaining amount (Advance Payment - ₹100) will be refunded 
                to your original payment method within 5-7 business days.
              </li>
              <li>
                <strong>Free Cancellation:</strong> You can cancel without any charges before the technician 
                is assigned or starts the journey.
              </li>
            </PolicyList>
          </Section>

          <Section>
            <SectionTitle>General Terms</SectionTitle>
            <TermsList>
              <li>Service will be provided on the scheduled date and time slot.</li>
              <li>Technician will carry necessary tools and spare parts.</li>
              <li>Remaining payment must be made after service completion.</li>
              <li>Service warranty as per company policy.</li>
              <li>Customer must be present at the service location.</li>
            </TermsList>
          </Section>

          <ImportantNote>
            <FiAlertCircle />
            <div>
              <strong>Important:</strong> By accepting these terms, you agree to pay the advance amount 
              of ₹{pricingInfo?.advanceAmount} to confirm your service booking. The remaining amount 
              of ₹{pricingInfo?.remainingAmount} will be collected after service completion.
            </div>
          </ImportantNote>
        </Content>

        <Footer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <AcceptButton onClick={onAccept}>Accept & Proceed to Payment</AcceptButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f1f5f9;

  h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  svg {
    font-size: 1.25rem;
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  color: #1e293b;
  margin-bottom: 1rem;

  svg {
    color: #3b82f6;
  }
`;

const PricingBox = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
`;

const PricingRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  background: ${props => props.highlight ? '#eff6ff' : 'transparent'};
  margin: ${props => props.highlight ? '0 -1.5rem' : '0'};
  padding: ${props => props.highlight ? '0.75rem 1.5rem' : '0.75rem 0'};

  &:last-child {
    border-bottom: none;
  }

  span {
    color: #64748b;
  }

  strong {
    color: ${props => props.highlight ? '#3b82f6' : '#1e293b'};
    font-size: ${props => props.highlight ? '1.125rem' : '1rem'};
  }
`;

const PolicyList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    padding: 0.75rem 0;
    color: #475569;
    line-height: 1.6;
    border-bottom: 1px solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }

    strong {
      color: #1e293b;
    }
  }
`;

const TermsList = styled.ul`
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0;

  li {
    padding: 0.5rem 0;
    color: #475569;
    line-height: 1.6;
  }
`;

const ImportantNote = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  margin-top: 1.5rem;

  svg {
    color: #f59e0b;
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  div {
    color: #92400e;
    line-height: 1.6;

    strong {
      color: #78350f;
    }
  }
`;

const Footer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f1f5f9;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const AcceptButton = styled.button`
  flex: 2;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
  }
`;

export default TermsModal;
