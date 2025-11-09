import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { servicesAPI } from '../../utils/api';

const PaymentModal = ({ show, onClose, booking, onSuccess }) => {
  useEffect(() => {
    if (show && booking) {
      loadRazorpayScript();
    }
  }, [show, booking]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        return;
      }

      console.log('Creating payment order for booking:', booking._id);

      // Create payment order
      const orderResponse = await servicesAPI.createPaymentOrder(booking._id);
      
      console.log('Payment order response:', orderResponse.data);
      
      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || 'Failed to create payment order');
        return;
      }

      const { razorpayOrderId, amount, currency, keyId } = orderResponse.data.data;

      // Check if this is a mock payment (development mode)
      const isMockPayment = razorpayOrderId?.startsWith('order_mock_');

      if (isMockPayment) {
        // Handle mock payment for development
        console.log('⚠️  Mock payment mode - simulating payment');
        
        const confirmPayment = window.confirm(
          `🧪 DEVELOPMENT MODE - Mock Payment\n\n` +
          `Booking: ${booking.bookingNumber}\n` +
          `Amount: ₹${booking.advanceAmount}\n\n` +
          `Click OK to simulate successful payment\n` +
          `Click Cancel to simulate payment failure`
        );

        if (confirmPayment) {
          try {
            // Simulate payment success
            const mockPaymentId = `pay_mock_${Date.now()}`;
            const mockSignature = `sig_mock_${Date.now()}`;

            const verifyResponse = await servicesAPI.verifyPayment(booking._id, {
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: mockPaymentId,
              razorpay_signature: mockSignature
            });

            if (verifyResponse.data.success) {
              toast.success('✅ Mock payment successful! Your service is confirmed.');
              onSuccess(verifyResponse.data.data.booking);
            }
          } catch (error) {
            console.error('Mock payment verification error:', error);
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        } else {
          toast.info('Payment cancelled');
        }
      } else {
        // Real Razorpay payment
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'Sai Enterprises',
          description: `Service Booking - ${booking.bookingNumber}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await servicesAPI.verifyPayment(booking._id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyResponse.data.success) {
                toast.success('Payment successful! Your service is confirmed.');
                onSuccess(verifyResponse.data.data.booking);
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error(error.response?.data?.message || 'Payment verification failed');
            }
          },
          prefill: {
            name: booking.address.fullName,
            email: booking.address.email,
            contact: booking.address.phone
          },
          notes: {
            bookingNumber: booking.bookingNumber,
            serviceType: booking.serviceType
          },
          theme: {
            color: '#3b82f6'
          },
          modal: {
            ondismiss: function() {
              toast.info('Payment cancelled');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment';
      toast.error(errorMessage);
    }
  };

  if (!show || !booking) return null;

  // Debug logging
  console.log('PaymentModal - Booking data:', {
    id: booking._id,
    bookingNumber: booking.bookingNumber,
    serviceCost: booking.serviceCost,
    advanceAmount: booking.advanceAmount,
    remainingAmount: booking.remainingAmount,
    distance: booking.distanceFromWarehouse,
    termsAccepted: booking.termsAccepted
  });

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Complete Payment</h2>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <Content>
          <SuccessIcon>
            <FiCheckCircle />
          </SuccessIcon>
          
          <Title>Service Booking Created!</Title>
          <BookingNumber>Booking #{booking.bookingNumber}</BookingNumber>

          <InfoBox>
            <InfoRow>
              <span>Service Type:</span>
              <strong>{booking.serviceType?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</strong>
            </InfoRow>
            <InfoRow>
              <span>Distance:</span>
              <strong>{booking.distanceFromWarehouse || 0} km</strong>
            </InfoRow>
            <InfoRow>
              <span>Total Service Cost:</span>
              <strong>₹{booking.serviceCost || 0}</strong>
            </InfoRow>
            <InfoRow highlight>
              <span>Advance Payment (50%):</span>
              <strong>₹{booking.advanceAmount || 0}</strong>
            </InfoRow>
            <InfoRow>
              <span>Remaining Amount:</span>
              <strong>₹{booking.remainingAmount || 0}</strong>
            </InfoRow>
          </InfoBox>

          <Note>
            <FiCreditCard />
            <div>
              <strong>Pay ₹{booking.advanceAmount} now</strong> to confirm your service booking. 
              The remaining ₹{booking.remainingAmount} will be collected after service completion.
            </div>
          </Note>

          <PayButton onClick={handlePayment}>
            <FiCreditCard />
            <span>Pay ₹{booking.advanceAmount} Now</span>
          </PayButton>

          <SkipText onClick={onClose}>
            I'll pay later (Booking will remain pending)
          </SkipText>
        </Content>
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
  max-width: 500px;
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
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    font-size: 2.5rem;
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const BookingNumber = styled.div`
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 2rem;
`;

const InfoBox = styled.div`
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
`;

const InfoRow = styled.div`
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

const Note = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  text-align: left;

  svg {
    color: #3b82f6;
    font-size: 1.5rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  div {
    color: #1e40af;
    line-height: 1.6;

    strong {
      color: #1e3a8a;
    }
  }
`;

const PayButton = styled.button`
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  }

  svg {
    font-size: 1.5rem;
  }
`;

const SkipText = styled.div`
  margin-top: 1rem;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #3b82f6;
    text-decoration: underline;
  }
`;

export default PaymentModal;
