import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiCreditCard, 
  FiArrowLeft, 
  FiMapPin, 
  FiCheck,
  FiTruck,
  FiShield,
  FiPackage
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentsAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { formatCurrency, getImageUrl } from '../utils/helpers';

// Styled Components
const PageContainer = styled.div`
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    color: #2563eb;
    transform: translateX(-4px);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.05rem;
  margin: 0;
`;

const ProgressBar = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 2;
`;

const StepCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : props.completed ? '#10b981' : '#e5e7eb'};
  color: ${props => props.active || props.completed ? 'white' : '#9ca3af'};
  font-size: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'};
`;

const StepLabel = styled.span`
  margin-top: 0.75rem;
  font-weight: ${props => props.active ? '600' : '500'};
  color: ${props => props.active ? '#3b82f6' : props.completed ? '#10b981' : '#6b7280'};
  font-size: 0.95rem;
`;

const StepConnector = styled.div`
  position: absolute;
  top: 30px;
  left: calc(50% + 30px);
  right: calc(-50% + 30px);
  height: 3px;
  background: ${props => props.completed ? '#10b981' : '#e5e7eb'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div``;

const Card = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  svg {
    color: #3b82f6;
    font-size: 1.5rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  grid-column: ${props => props.fullWidth ? 'span 2' : 'span 1'};

  @media (max-width: 640px) {
    grid-column: span 1;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;

  span {
    color: #ef4444;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PaymentOption = styled.label`
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#eff6ff' : 'white'};
  margin-bottom: 1rem;

  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  input {
    margin-right: 1rem;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1.5rem;
    color: ${props => props.selected ? '#3b82f6' : '#6b7280'};
  }

  span {
    font-weight: ${props => props.selected ? '600' : '500'};
    color: ${props => props.selected ? '#1f2937' : '#374151'};
    font-size: 1rem;
  }
`;

const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
`;

const ItemImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.5rem;
`;

const ItemDetails = styled.div`
  flex: 1;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }

  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
`;

const ItemPrice = styled.div`
  text-align: right;

  .price {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
  }

  .quantity {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f3f4f6;
  color: #374151;

  &:hover:not(:disabled) {
    background: #e5e7eb;
  }
`;

const SuccessButton = styled(Button)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  }
`;

const Sidebar = styled.div`
  @media (max-width: 1024px) {
    order: -1;
  }
`;

const SummaryCard = styled(Card)`
  position: sticky;
  top: 2rem;
`;

const SummaryHeader = styled.div`
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  span:first-child {
    color: #6b7280;
    font-size: 0.95rem;
  }

  span:last-child {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.95rem;
  }
`;

const TotalRow = styled(SummaryRow)`
  padding: 1.5rem 0 0 0;
  margin-top: 1rem;
  border-top: 2px solid #e5e7eb;
  border-bottom: none;

  span:first-child {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
  }

  span:last-child {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
  }
`;

const FreeShippingBadge = styled.div`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-top: 1rem;
  text-align: center;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  svg {
    font-size: 1.25rem;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 0.75rem;
  margin-top: 1rem;
  color: #059669;
  font-size: 0.875rem;
  font-weight: 500;

  svg {
    font-size: 1.25rem;
  }
`;

const Checkout = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter valid items (items with products) to prevent null reference errors
  const validItems = useMemo(() => {
    try {
      return items.filter(item => {
        return item && 
               item.product && 
               item.product._id && 
               item.product.name;
      });
    } catch (error) {
      console.error('Error filtering checkout items:', error);
      return [];
    }
  }, [items]);
  
  const [loading, setLoading] = useState(false);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [step, setStep] = useState(1);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: user?.address?.street || '',
    landmark: '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Maharashtra',
    postalCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    phone: user?.phone || '',
    alternatePhone: '',
    email: user?.email || ''
  });
  
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];
  
  const maharashtraDistricts = [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur',
    'Kolhapur', 'Thane', 'Navi Mumbai', 'Kalyan', 'Vasai', 'Ahmednagar',
    'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Amravati', 'Nanded',
    'Parbhani', 'Jalna', 'Satara', 'Sangli', 'Ratnagiri', 'Sindhudurg',
    'Chandrapur', 'Gondia', 'Wardha', 'Yavatmal', 'Washim', 'Hingoli',
    'Beed', 'Osmanabad', 'Buldhana', 'Bhandara', 'Gadchiroli', 'Raigad'
  ];
  
  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    
    if (!validItems || validItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
  }, [user, validItems, navigate]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate delivery when postal code is entered (6 digits)
    if (name === 'postalCode' && value.length === 6) {
      calculateDeliveryCharges({
        ...shippingAddress,
        postalCode: value
      });
    }
  };
  
  const calculateDeliveryCharges = async (address) => {
    if (!address.city || !address.state || !address.postalCode) {
      return;
    }
    
    try {
      setCalculatingDelivery(true);
      const response = await ordersAPI.calculateDelivery({
        city: address.city,
        state: address.state,
        pincode: address.postalCode,
        items: validItems.map(item => ({
          product: item.product?._id || item.productId,
          quantity: item.quantity
        }))
      });
      
      if (response.data.success) {
        setDeliveryInfo(response.data.data);
        if (response.data.data.isFreeDelivery) {
          toast.success('🎉 You earned FREE delivery!');
        }
      }
    } catch (error) {
      console.error('Delivery calculation error:', error);
      toast.error('Could not calculate delivery charges');
    } finally {
      setCalculatingDelivery(false);
    }
  };

  const validateAddress = () => {
    const required = ['fullName', 'address', 'city', 'state', 'postalCode', 'phone', 'email'];
    for (const field of required) {
      if (!shippingAddress[field]) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }
    
    if (shippingAddress.postalCode.length !== 6) {
      toast.error('PIN code must be 6 digits');
      return false;
    }
    
    if (shippingAddress.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    
    // If delivery info not calculated, calculate it now
    if (!deliveryInfo) {
      toast.info('Calculating delivery charges...');
      await calculateDeliveryCharges(shippingAddress);
      
      // Wait a moment for state to update
      setTimeout(() => {
        if (!deliveryInfo) {
          toast.error('Unable to calculate delivery charges. Please check your address.');
          return;
        }
      }, 1000);
      return;
    }
    
    try {
      setLoading(true);
      
      const orderData = {
        shippingAddress,
        paymentMethod,
        deliveryInfo: {
          distanceFromWarehouse: deliveryInfo.distance,
          totalWeight: deliveryInfo.totalWeight,
          deliveryChargeBreakdown: deliveryInfo.breakdown,
          isFreeDelivery: deliveryInfo.isFreeDelivery,
          estimatedDeliveryDays: Math.ceil(deliveryInfo.distance / 100) + 2
        }
      };
      
      // If COD, create order directly
      if (paymentMethod === 'cash_on_delivery') {
        const response = await ordersAPI.createOrderFromCart(orderData);
        
        if (response.data?.success) {
          const order = response.data.data;
          toast.success(`✅ Order #${order.orderNumber} placed successfully! Pay on delivery.`);
          
          // Navigate to customer dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      } 
      // If Razorpay, initiate payment
      else if (paymentMethod === 'razorpay') {
        // Create order first to get order ID
        const response = await ordersAPI.createOrderFromCart(orderData);
        
        if (response.data?.success) {
          const order = response.data.data;

          // Initialize payment with backend so that Razorpay order + session token are generated server-side
          let paymentData;
          try {
            const paymentInitResponse = await paymentsAPI.createPaymentOrder(order._id);
            paymentData = paymentInitResponse.data?.data;
          } catch (paymentError) {
            console.error('Payment initialization error:', paymentError);
            toast.error(paymentError.response?.data?.message || 'Unable to initiate payment. Please try again or choose COD.');
            setLoading(false);
            return;
          }

          if (!paymentData?.razorpayOrderId) {
            toast.error('Payment gateway is unavailable right now. Please try Cash on Delivery or retry later.');
            setLoading(false);
            return;
          }
          
          // Determine if backend switched to mock mode (usually when Razorpay creds are missing)
          const isMockPayment = paymentData.isMockMode || paymentData.razorpayOrderId.startsWith('order_mock_');

          if (isMockPayment) {
            console.log('⚠️  Mock payment mode - simulating payment');
            
            const confirmPayment = window.confirm(
              `🧪 DEVELOPMENT MODE - Mock Payment\n\n` +
              `Order: ${order.orderNumber}\n` +
              `Amount: ₹${order.totalPrice}\n\n` +
              `Click OK to simulate successful payment\n` +
              `Click Cancel to simulate payment failure`
            );

            if (confirmPayment) {
              try {
                setLoading(true);
                toast.loading('Processing mock payment...');

                // Simulate payment success
                const mockPaymentId = `pay_mock_${Date.now()}`;
                const mockSignature = `sig_mock_${Date.now()}`;

                const verifyResponse = await ordersAPI.verifyPayment({
                  orderId: order._id,
                  razorpay_payment_id: mockPaymentId,
                  razorpay_order_id: paymentData.razorpayOrderId,
                  razorpay_signature: mockSignature
                });

                if (verifyResponse.data?.success) {
                  toast.dismiss();
                  toast.success('🎉 Mock Payment Successful!');
                  
                  setTimeout(() => {
                    toast.success(`Order #${order.orderNumber} confirmed! Redirecting...`);
                  }, 500);
                  
                  setTimeout(() => {
                    navigate('/dashboard');
                  }, 2000);
                }
              } catch (error) {
                toast.dismiss();
                console.error('Mock payment verification error:', error);
                toast.error('Payment verification failed');
              } finally {
                setLoading(false);
              }
            } else {
              toast.info('Payment cancelled');
              setLoading(false);
            }
          } else {
            if (!window.Razorpay) {
              toast.error('Payment SDK not loaded. Please refresh the page and try again.');
              setLoading(false);
              return;
            }

            // Real Razorpay payment with backend-generated order id
            const razorpayKey = paymentData.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RaxhPfGsI6kH89';
            const options = {
              key: razorpayKey,
              amount: paymentData.amount, // Amount in paise
              currency: 'INR',
              name: 'Sai Enterprises',
              description: `Order #${order.orderNumber}`,
              image: '/logo.png',
              order_id: paymentData.razorpayOrderId,
              
              method: {
                upi: true,
                card: true,
                netbanking: true,
                wallet: true
              },
              
              handler: async function (response) {
                try {
                  setLoading(true);
                  toast.loading('Verifying payment...');
                  
                  const verifyResponse = await ordersAPI.verifyPayment({
                    orderId: order._id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                  });
                  
                  if (verifyResponse.data?.success) {
                    toast.dismiss();
                    toast.success('🎉 Payment Successful!', {
                      duration: 3000,
                      icon: '✅'
                    });
                    
                    setTimeout(() => {
                      toast.success(`Order #${order.orderNumber} confirmed! Redirecting...`);
                    }, 500);
                    
                    setTimeout(() => {
                      navigate('/dashboard');
                    }, 2000);
                  } else {
                    toast.dismiss();
                    toast.error('❌ Payment verification failed. Please contact support with Payment ID: ' + response.razorpay_payment_id);
                  }
                } catch (error) {
                  toast.dismiss();
                  console.error('Payment verification error:', error);
                  toast.error('Payment verification failed. Please contact support.');
                } finally {
                  setLoading(false);
                }
              },
              
              prefill: {
                name: shippingAddress.fullName,
                email: shippingAddress.email,
                contact: shippingAddress.phone
              },
              notes: {
                order_id: order._id,
                order_number: order.orderNumber,
                customer_name: shippingAddress.fullName,
                shipping_address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}`
              },
              theme: {
                color: '#667eea',
                backdrop_color: 'rgba(0, 0, 0, 0.5)'
              },
              modal: {
                backdropclose: false,
                escape: true,
                handleback: true,
                confirm_close: true,
                ondismiss: function() {
                  toast.info('💳 Payment cancelled. You can retry from your orders page.');
                  setLoading(false);
                },
                animation: true
              },
              retry: {
                enabled: true,
                max_count: 3
              },
              timeout: 900,
              remember_customer: false
            };
          
            const razorpay = new window.Razorpay(options);
            
            razorpay.on('payment.failed', function (response) {
              toast.error('❌ Payment failed: ' + response.error.description);
              setLoading(false);
            });
            
            razorpay.open();
          }
        }
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  const subtotal = totalPrice || 0;
  const tax = Math.round(subtotal * 0.18);
  const shipping = deliveryInfo ? deliveryInfo.deliveryCharge : 0;
  const total = subtotal + tax + shipping;

  if (!validItems || validItems.length === 0) {
    return null;
  }

  const steps = [
    { number: 1, title: 'Shipping Address', icon: FiMapPin },
    { number: 2, title: 'Payment Method', icon: FiCreditCard },
    { number: 3, title: 'Review Order', icon: FiCheck }
  ];

  return (
    <PageContainer>
      <Container>
        {/* Header */}
        <Header>
          <BackButton onClick={() => navigate('/cart')}>
            <FiArrowLeft />
            Back to Cart
          </BackButton>
          <Title>Secure Checkout</Title>
          <Subtitle>Complete your order in 3 simple steps</Subtitle>
        </Header>

        {/* Progress Steps */}
        <ProgressBar>
          <StepsContainer>
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.number;
              const isCompleted = step > stepItem.number;
              
              return (
                <React.Fragment key={stepItem.number}>
                  <StepItem>
                    <StepCircle active={isActive} completed={isCompleted}>
                      <Icon />
                    </StepCircle>
                    <StepLabel active={isActive} completed={isCompleted}>
                      {stepItem.title}
                    </StepLabel>
                  </StepItem>
                  {index < steps.length - 1 && (
                    <StepConnector completed={isCompleted} />
                  )}
                </React.Fragment>
              );
            })}
          </StepsContainer>
        </ProgressBar>

        <ContentGrid>
          {/* Main Content */}
          <MainContent>
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <Card
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <FiMapPin />
                  <h2>Shipping Address</h2>
                </CardHeader>
                
                <FormGrid>
                  <FormGroup>
                    <Label>Full Name <span>*</span></Label>
                    <Input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Phone Number <span>*</span></Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                      placeholder="+91 XXXXX XXXXX"
                      maxLength="10"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Alternate Phone <span style={{color: '#f59e0b', fontSize: '0.85rem'}}>(Recommended for delivery)</span></Label>
                    <Input
                      type="tel"
                      name="alternatePhone"
                      value={shippingAddress.alternatePhone}
                      onChange={handleAddressChange}
                      placeholder="+91 XXXXX XXXXX"
                      maxLength="10"
                    />
                    <small style={{color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block'}}>
                      💡 Courier partner will use this if primary number is unreachable
                    </small>
                  </FormGroup>
                  
                  <FormGroup fullWidth>
                    <Label>Email Address <span>*</span></Label>
                    <Input
                      type="email"
                      name="email"
                      value={shippingAddress.email}
                      onChange={handleAddressChange}
                      placeholder="your@email.com"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup fullWidth>
                    <Label>Complete Address <span>*</span></Label>
                    <Input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleAddressChange}
                      placeholder="House no., Building name, Street, Area"
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup fullWidth>
                    <Label>Landmark</Label>
                    <Input
                      type="text"
                      name="landmark"
                      value={shippingAddress.landmark}
                      onChange={handleAddressChange}
                      placeholder="Nearby landmark for easy location (Optional)"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>State <span>*</span></Label>
                    <select
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontFamily: 'inherit'
                      }}
                      required
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>City/District <span>*</span></Label>
                    {shippingAddress.state === 'Maharashtra' ? (
                      <select
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                        required
                      >
                        <option value="">Select District</option>
                        {maharashtraDistricts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="Enter your city"
                        required
                      />
                    )}
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>PIN Code <span>*</span></Label>
                    <Input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleAddressChange}
                      placeholder="6-digit PIN Code"
                      maxLength="6"
                      required
                    />
                    {calculatingDelivery && (
                      <small style={{ color: '#3b82f6', marginTop: '0.5rem', display: 'block' }}>
                        Calculating delivery charges...
                      </small>
                    )}
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Country <span>*</span></Label>
                    <Input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                      placeholder="Country"
                      required
                    />
                  </FormGroup>
                </FormGrid>
                
                <ButtonGroup>
                  <PrimaryButton onClick={async () => {
                    if (!validateAddress()) return;
                    
                    // Calculate delivery charges before moving to payment
                    if (!deliveryInfo && shippingAddress.postalCode?.length === 6) {
                      toast.info('Calculating delivery charges...');
                      await calculateDeliveryCharges(shippingAddress);
                    }
                    
                    setStep(2);
                  }}>
                    Continue to Payment
                    <FiArrowLeft style={{ transform: 'rotate(180deg)' }} />
                  </PrimaryButton>
                </ButtonGroup>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <FiCreditCard />
                  <h2>Payment Method</h2>
                </CardHeader>
                
                <div>
                  {/* Razorpay Online Payment */}
                  <PaymentOption selected={paymentMethod === 'razorpay'}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <FiCreditCard />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>💳 Online Payment (Razorpay)</span>
                        <span style={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>RECOMMENDED</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0' }}>
                        Pay securely using Credit/Debit Card, UPI, Net Banking, Wallets
                      </p>
                      
                      {/* Payment Methods Preview */}
                      <div style={{ 
                        display: 'flex',
                        gap: '12px',
                        marginTop: '12px',
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>💳 Cards</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📱 UPI</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>🏦 Net Banking</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>👛 Wallets</span>
                      </div>
                      
                      {/* Security Badge */}
                      <div style={{ 
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: '500' }}>
                          Secure payment powered by Razorpay • 256-bit SSL Encryption
                        </span>
                      </div>
                    </div>
                  </PaymentOption>

                  {/* Cash on Delivery */}
                  <PaymentOption selected={paymentMethod === 'cash_on_delivery'}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <FiPackage />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>💵 Cash on Delivery (COD)</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 8px 0' }}>
                        Pay with cash when you receive the product at your doorstep
                      </p>
                      
                      {/* COD Info */}
                      <div style={{ 
                        marginTop: '12px',
                        padding: '10px 12px',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '1rem' }}>ℹ️</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
                            COD Available
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#78350f' }}>
                            • No extra charges • Pay exact amount to delivery person • Get instant receipt
                          </span>
                        </div>
                      </div>
                    </div>
                  </PaymentOption>
                </div>
                
                <ButtonGroup>
                  <SecondaryButton onClick={() => setStep(1)}>
                    <FiArrowLeft />
                    Back
                  </SecondaryButton>
                  <PrimaryButton onClick={async () => {
                    // Calculate delivery if not already done
                    if (!deliveryInfo && shippingAddress.postalCode?.length === 6) {
                      toast.info('Calculating delivery charges...');
                      await calculateDeliveryCharges(shippingAddress);
                    }
                    setStep(3);
                  }}>
                    Review Order
                    <FiArrowLeft style={{ transform: 'rotate(180deg)' }} />
                  </PrimaryButton>
                </ButtonGroup>
              </Card>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <Card
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader>
                  <FiCheck />
                  <h2>Review Your Order</h2>
                </CardHeader>
                
                {/* Payment Method Selected */}
                <div style={{
                  padding: '16px',
                  background: paymentMethod === 'razorpay' ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : '#fffbeb',
                  border: paymentMethod === 'razorpay' ? '2px solid #667eea' : '2px solid #fbbf24',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    {paymentMethod === 'razorpay' ? (
                      <>
                        <FiCreditCard style={{ fontSize: '1.5rem', color: '#667eea' }} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '1rem', color: '#1e293b' }}>
                            💳 Online Payment via Razorpay
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                            You'll be redirected to secure Razorpay payment gateway
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <FiPackage style={{ fontSize: '1.5rem', color: '#f59e0b' }} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '1rem', color: '#1e293b' }}>
                            💵 Cash on Delivery (COD)
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#92400e', marginTop: '4px' }}>
                            Pay ₹{formatCurrency(total).replace('₹', '')} when you receive the product
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {paymentMethod === 'razorpay' && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'white',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#475569'
                    }}>
                      🔒 Secure payment • UPI, Cards, Net Banking, Wallets supported
                    </div>
                  )}
                </div>
                
                <div>
                  {(() => {
                    try {
                      return validItems
                        .filter(item => item && item.product && item.product._id)
                        .map((item) => {
                          // Additional safety check for each item
                          if (!item || !item.product) {
                            return null;
                          }
                          
                          return (
                            <OrderItem key={item.product._id || Math.random()}>
                              <ItemImage
                                src={getImageUrl(item.product.images?.[0]) || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                alt={item.product.name || 'Product'}
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <ItemDetails>
                                <h4>{item.product.name || 'Unknown Product'}</h4>
                                <p>SKU: {item.product.sku || 'N/A'}</p>
                                <p className="quantity">Qty: {item.quantity || 1}</p>
                              </ItemDetails>
                              <ItemPrice>
                                <div className="price">
                                  ₹{((item.product.price || 0) * (item.quantity || 1)).toLocaleString()}
                                </div>
                                <div className="quantity">
                                  ₹{(item.product.price || 0).toLocaleString()} each
                                </div>
                              </ItemPrice>
                            </OrderItem>
                          );
                        })
                        .filter(Boolean); // Remove any null items
                    } catch (error) {
                      console.error('Error rendering checkout items:', error);
                      return (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center',
                          background: '#fee2e2',
                          borderRadius: '8px',
                          color: '#dc2626'
                        }}>
                          <p>Error loading cart items. Please refresh the page.</p>
                          <button 
                            onClick={() => window.location.reload()}
                            style={{
                              padding: '8px 16px',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Refresh Page
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <ButtonGroup>
                  <SecondaryButton onClick={() => setStep(2)}>
                    <FiArrowLeft />
                    Back
                  </SecondaryButton>
                  <SuccessButton onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? (
                      paymentMethod === 'razorpay' ? 'Processing Payment...' : 'Placing Order...'
                    ) : (
                      paymentMethod === 'razorpay' ? '💳 Pay Now with Razorpay' : '✅ Place Order (COD)'
                    )}
                    <FiCheck />
                  </SuccessButton>
                </ButtonGroup>
              </Card>
            )}
          </MainContent>

          {/* Order Summary Sidebar */}
          <Sidebar>
            <SummaryCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SummaryHeader>
                <h3>Order Summary</h3>
              </SummaryHeader>
              
              <div>
                <SummaryRow>
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </SummaryRow>
                
                <SummaryRow>
                  <span>Tax (18% GST)</span>
                  <span>{formatCurrency(tax)}</span>
                </SummaryRow>
                
                {deliveryInfo ? (
                  <>
                    <SummaryRow>
                      <span>Delivery Charge</span>
                      <span style={{ color: shipping === 0 ? '#10b981' : '#1f2937', fontWeight: '600' }}>
                        {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                      </span>
                    </SummaryRow>
                    {shipping > 0 && deliveryInfo.breakdown && (
                      <div style={{ paddingLeft: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <SummaryRow style={{ padding: '0.25rem 0' }}>
                          <span>• Base charge</span>
                          <span>{formatCurrency(deliveryInfo.breakdown.baseCharge)}</span>
                        </SummaryRow>
                        <SummaryRow style={{ padding: '0.25rem 0' }}>
                          <span>• Weight charge ({deliveryInfo.totalWeight}kg)</span>
                          <span>{formatCurrency(deliveryInfo.breakdown.weightCharge)}</span>
                        </SummaryRow>
                        {deliveryInfo.breakdown.distanceCharge > 0 && (
                          <SummaryRow style={{ padding: '0.25rem 0' }}>
                            <span>• Distance surcharge</span>
                            <span>{formatCurrency(deliveryInfo.breakdown.distanceCharge)}</span>
                          </SummaryRow>
                        )}
                      </div>
                    )}
                  </>
                ) : calculatingDelivery ? (
                  <SummaryRow>
                    <span>Delivery Charge</span>
                    <span style={{ color: '#667eea', fontSize: '0.9rem', fontWeight: '500' }}>
                      Calculating...
                    </span>
                  </SummaryRow>
                ) : (
                  <SummaryRow>
                    <span>Delivery Charge</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      Enter PIN code
                    </span>
                  </SummaryRow>
                )}
                
                <TotalRow>
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </TotalRow>
              </div>

              {deliveryInfo && shipping === 0 && (
                <FreeShippingBadge>
                  <FiTruck />
                  🎉 FREE Delivery! (Within 50km & under 5kg)
                </FreeShippingBadge>
              )}
              
              {deliveryInfo && shipping > 0 && (
                <div style={{ 
                  background: '#eff6ff', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  marginTop: '1rem',
                  fontSize: '0.9rem',
                  color: '#1e40af'
                }}>
                  <FiTruck style={{ marginRight: '0.5rem' }} />
                  Delivery: {Math.round(deliveryInfo.distance)}km from Aurangabad, Bihar
                </div>
              )}

              <SecurityBadge>
                <FiShield />
                Secure & encrypted checkout
              </SecurityBadge>
            </SummaryCard>
          </Sidebar>
        </ContentGrid>
      </Container>
    </PageContainer>
  );
};

export default Checkout;
