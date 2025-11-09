import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertCircle } from 'react-icons/fi';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderNumber, type = 'order' }) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedReasons = [
    'Out of stock',
    'Customer requested cancellation',
    'Pricing error',
    'Unable to fulfill order',
    'Duplicate order',
    'Payment issue',
    'Shipping address issue',
    'Other'
  ];

  const handleSubmit = async () => {
    const finalReason = selectedReason === 'Other' ? reason : selectedReason;
    
    if (!finalReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    await onConfirm(finalReason);
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setSelectedReason('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <ModalContainer
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <HeaderContent>
              <IconWrapper>
                <FiAlertCircle />
              </IconWrapper>
              <div>
                <ModalTitle>Cancel {type === 'order' ? 'Order' : 'Booking'}</ModalTitle>
                <ModalSubtitle>
                  {orderNumber ? `#${orderNumber}` : 'Are you sure?'}
                </ModalSubtitle>
              </div>
            </HeaderContent>
            <CloseButton onClick={handleClose}>
              <FiX />
            </CloseButton>
          </ModalHeader>

          <ModalBody>
            <WarningBox>
              <FiAlertCircle />
              <span>
                This action cannot be undone. The {type} will be permanently cancelled
                {type === 'order' && ' and stock will be restored'}.
              </span>
            </WarningBox>

            <FormGroup>
              <Label>Select Cancellation Reason *</Label>
              <ReasonGrid>
                {predefinedReasons.map((reasonOption) => (
                  <ReasonChip
                    key={reasonOption}
                    selected={selectedReason === reasonOption}
                    onClick={() => setSelectedReason(reasonOption)}
                  >
                    {reasonOption}
                  </ReasonChip>
                ))}
              </ReasonGrid>
            </FormGroup>

            {selectedReason === 'Other' && (
              <FormGroup
                as={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Label>Please specify the reason *</Label>
                <TextArea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter detailed cancellation reason..."
                  rows={4}
                  autoFocus
                />
              </FormGroup>
            )}

            {selectedReason && selectedReason !== 'Other' && (
              <FormGroup
                as={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Label>Additional Notes (Optional)</Label>
                <TextArea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </FormGroup>
            )}
          </ModalBody>

          <ModalFooter>
            <CancelButton onClick={handleClose} disabled={isSubmitting}>
              Go Back
            </CancelButton>
            <ConfirmButton
              onClick={handleSubmit}
              disabled={!selectedReason || (selectedReason === 'Other' && !reason.trim()) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                `Confirm Cancellation`
              )}
            </ConfirmButton>
          </ModalFooter>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 2px solid #f1f5f9;
  background: linear-gradient(135deg, #fef2f2 0%, #fff 100%);
`;

const HeaderContent = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const ModalSubtitle = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
    transform: rotate(90deg);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
`;

const WarningBox = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  color: #92400e;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;

  svg {
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
`;

const ReasonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const ReasonChip = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 2px solid ${props => props.selected ? '#ef4444' : '#e2e8f0'};
  background: ${props => props.selected ? '#fef2f2' : 'white'};
  color: ${props => props.selected ? '#ef4444' : '#64748b'};
  font-weight: ${props => props.selected ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: #ef4444;
    background: #fef2f2;
    color: #ef4444;
    transform: translateY(-2px);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f1f5f9;
  background: #f9fafb;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default CancelOrderModal;
