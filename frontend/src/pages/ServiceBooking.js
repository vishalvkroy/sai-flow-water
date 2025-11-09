import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiTool,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import { servicesAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import TermsModal from '../components/Service/TermsModal';
import PaymentModal from '../components/Service/PaymentModal';

const ServiceBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [pricingInfo, setPricingInfo] = useState(null);
  const [distance, setDistance] = useState(10); // Initialize with default value
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    productType: '',
    issueDescription: '',
    preferredDate: '',
    preferredTimeSlot: '',
    address: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      landmark: ''
    }
  });

  const serviceTypes = [
    { value: 'installation', label: '🔧 Installation', desc: 'New product installation' },
    { value: 'repair', label: '🛠️ Repair', desc: 'Fix existing issues' },
    { value: 'maintenance', label: '⚙️ Maintenance', desc: 'Regular maintenance' },
    { value: 'filter_replacement', label: '🔄 Filter Replacement', desc: 'Replace water filters' },
    { value: 'annual_maintenance', label: '📅 Annual Maintenance', desc: 'Yearly service contract' },
    { value: 'emergency_service', label: '🚨 Emergency Service', desc: 'Urgent repair needed' },
    { value: 'consultation', label: '💬 Consultation', desc: 'Expert advice' }
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
    { value: 'evening', label: 'Evening (4 PM - 7 PM)' }
  ];

  // Calculate pricing when distance changes
  useEffect(() => {
    if (distance) {
      calculatePricing(distance);
    }
  }, [distance]);

  const calculatePricing = async (dist) => {
    try {
      const response = await servicesAPI.calculatePricing({ distance: dist });
      setPricingInfo(response.data.data);
    } catch (error) {
      console.error('Pricing calculation error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.serviceType) {
      toast.error('Please select a service type');
      return;
    }
    if (!formData.productType) {
      toast.error('Please enter product type');
      return;
    }
    if (!formData.issueDescription) {
      toast.error('Please describe the issue');
      return;
    }
    if (!formData.preferredDate) {
      toast.error('Please select preferred date');
      return;
    }
    if (!formData.preferredTimeSlot) {
      toast.error('Please select time slot');
      return;
    }

    // Validate address
    const requiredAddressFields = ['fullName', 'phone', 'email', 'address', 'city', 'state', 'postalCode'];
    for (const field of requiredAddressFields) {
      if (!formData.address[field]) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    // Calculate pricing and show terms modal
    if (!distance || distance <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }
    
    calculatePricing(distance);
    setShowTerms(true);
  };

  const confirmBooking = async () => {
    try {
      setLoading(true);
      const bookingData = {
        ...formData,
        distance,
        termsAccepted: true,
        customerCoordinates: { latitude: 0, longitude: 0 }
      };
      
      const response = await servicesAPI.createServiceBooking(bookingData);
      
      if (response.data.success) {
        setCreatedBooking(response.data.data);
        setShowTerms(false);
        setShowPayment(true);
        toast.success('Service booking created! Please complete payment.');
      }
    } catch (error) {
      console.error('Service booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to create service booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (booking) => {
    setShowPayment(false);
    toast.success('Payment successful! Your service is confirmed.');
    navigate('/customer-dashboard');
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Container>
      <Header>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <IconWrapper>
            <FiTool size={40} />
          </IconWrapper>
          <h1>Book a Service</h1>
          <p>Professional water purifier service at your doorstep</p>
        </motion.div>
      </Header>

      <ServiceRadiusNotice
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FiMapPin />
        <div>
          <strong>Service Area:</strong> Services are available only within 50 km radius from Aurangabad, Bihar
        </div>
      </ServiceRadiusNotice>

      <FormContainer
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Form onSubmit={handleSubmit}>
          {/* Service Type */}
          <Section>
            <SectionTitle>
              <FiTool />
              <span>Service Details</span>
            </SectionTitle>

            <FormGroup>
              <Label>Service Type *</Label>
              <ServiceTypeGrid>
                {serviceTypes.map((service) => (
                  <ServiceCard
                    key={service.value}
                    selected={formData.serviceType === service.value}
                    onClick={() => setFormData(prev => ({ ...prev, serviceType: service.value }))}
                  >
                    <ServiceLabel>{service.label}</ServiceLabel>
                    <ServiceDesc>{service.desc}</ServiceDesc>
                    {formData.serviceType === service.value && (
                      <CheckIcon>
                        <FiCheckCircle />
                      </CheckIcon>
                    )}
                  </ServiceCard>
                ))}
              </ServiceTypeGrid>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiPackage />
                <span>Product Type *</span>
              </Label>
              <Input
                type="text"
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                placeholder="e.g., RO Water Purifier, UV Purifier"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <FiAlertCircle />
                <span>Issue Description *</span>
              </Label>
              <TextArea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                placeholder="Please describe the issue or service requirement in detail..."
                rows="5"
                required
              />
            </FormGroup>
          </Section>

          {/* Schedule */}
          <Section>
            <SectionTitle>
              <FiCalendar />
              <span>Schedule</span>
            </SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>
                  <FiCalendar />
                  <span>Preferred Date *</span>
                </Label>
                <Input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FiClock />
                  <span>Preferred Time Slot *</span>
                </Label>
                <Select
                  name="preferredTimeSlot"
                  value={formData.preferredTimeSlot}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>
          </Section>

          {/* Address */}
          <Section>
            <SectionTitle>
              <FiMapPin />
              <span>Service Address</span>
            </SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>
                  <FiUser />
                  <span>Full Name *</span>
                </Label>
                <Input
                  type="text"
                  name="address.fullName"
                  value={formData.address.fullName}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FiPhone />
                  <span>Phone Number *</span>
                </Label>
                <Input
                  type="tel"
                  name="address.phone"
                  value={formData.address.phone}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>
                <FiMail />
                <span>Email *</span>
              </Label>
              <Input
                type="email"
                name="address.email"
                value={formData.address.email}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <FiMapPin />
                <span>Address *</span>
              </Label>
              <TextArea
                name="address.address"
                value={formData.address.address}
                onChange={handleChange}
                placeholder="House/Flat No., Street, Area"
                rows="3"
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>City *</Label>
                <Input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>State *</Label>
                <Input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Postal Code *</Label>
                <Input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Landmark (Optional)</Label>
              <Input
                type="text"
                name="address.landmark"
                value={formData.address.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark for easy location"
              />
            </FormGroup>
          </Section>

          {/* Distance & Pricing */}
          <Section>
            <SectionTitle>
              <FiMapPin />
              <span>Distance & Pricing</span>
            </SectionTitle>

            <FormGroup>
              <Label>
                <span>Approximate Distance from Warehouse (km) *</span>
              </Label>
              <Input
                type="number"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                min="1"
                max="100"
                placeholder="Enter distance in kilometers"
                required
              />
              <HelpText>
                Enter approximate distance from Aurangabad, Bihar. This determines the service cost.
              </HelpText>
            </FormGroup>

            {pricingInfo && (
              <PricingPreview>
                <PricingTitle>💰 Service Pricing Breakdown</PricingTitle>
                <PricingDetail>
                  <span>Distance Range:</span>
                  <strong>{pricingInfo.distanceRange}</strong>
                </PricingDetail>
                <PricingDetail>
                  <span>Total Service Cost:</span>
                  <strong>₹{pricingInfo.serviceCost}</strong>
                </PricingDetail>
                <PricingDetail highlight>
                  <span>Advance Payment (50%):</span>
                  <strong>₹{pricingInfo.advanceAmount}</strong>
                </PricingDetail>
                <PricingDetail>
                  <span>Remaining Amount:</span>
                  <strong>₹{pricingInfo.remainingAmount}</strong>
                </PricingDetail>
                <PricingNote>
                  <FiAlertCircle />
                  <span>Pay ₹{pricingInfo.advanceAmount} now, ₹{pricingInfo.remainingAmount} after service completion</span>
                </PricingNote>
              </PricingPreview>
            )}
          </Section>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Review & Book Service'}
          </SubmitButton>
        </Form>
      </FormContainer>

      {/* Terms & Conditions Modal */}
      <TermsModal
        show={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={confirmBooking}
        pricingInfo={pricingInfo}
      />

      {/* Payment Modal */}
      <PaymentModal
        show={showPayment}
        onClose={() => setShowPayment(false)}
        booking={createdBooking}
        onSuccess={handlePaymentSuccess}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 1rem;

  h1 {
    font-size: 2.5rem;
    color: #1e293b;
    margin: 1rem 0 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 1.1rem;
  }
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
`;

const ServiceRadiusNotice = styled.div`
  max-width: 900px;
  margin: 0 auto 2rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);

  svg {
    color: #3b82f6;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  div {
    color: #1e40af;
    font-size: 1rem;
    line-height: 1.5;

    strong {
      color: #1e3a8a;
      font-weight: 600;
    }
  }

  @media (max-width: 768px) {
    margin: 0 1rem 2rem;
    padding: 1rem;
    font-size: 0.9rem;
  }
`;

const FormContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Form = styled.form`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 2px solid #f1f5f9;

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 1.5rem;

  svg {
    color: #3b82f6;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;

  svg {
    color: #64748b;
    font-size: 1rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ServiceTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ServiceCard = styled.div`
  position: relative;
  padding: 1.25rem;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e2e8f0'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#eff6ff' : 'white'};

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
`;

const ServiceLabel = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  font-size: 1rem;
`;

const ServiceDesc = styled.div`
  font-size: 0.85rem;
  color: #64748b;
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: #3b82f6;
  font-size: 1.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
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

const ModalBody = styled.div`
  padding: 2rem;
`;

const ConfirmationSection = styled.div`
  margin-bottom: 2rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const ConfirmationSectionTitle = styled.h3`
  font-size: 1.125rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const DetailRow = styled.div`
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  flex: 0 0 140px;
  font-weight: 600;
  color: #64748b;
  font-size: 0.95rem;
`;

const DetailValue = styled.div`
  flex: 1;
  color: #1e293b;
  font-size: 0.95rem;
`;

const IssueText = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const ConfirmationNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 10px;
  margin-top: 1.5rem;

  svg {
    color: #3b82f6;
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  span {
    color: #1e40af;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ModalFooter = styled.div`
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

const ConfirmButton = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// New styled components for pricing
const HelpText = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
  line-height: 1.5;
`;

const PricingPreview = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const PricingTitle = styled.div`
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 1.125rem;
`;

const PricingDetail = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  background: ${props => props.highlight ? '#eff6ff' : 'transparent'};
  margin: ${props => props.highlight ? '0 -1.5rem' : '0'};
  padding: ${props => props.highlight ? '0.75rem 1.5rem' : '0.75rem 0'};
  border-radius: ${props => props.highlight ? '8px' : '0'};

  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0.75rem;
  }

  span {
    color: #64748b;
    font-size: 0.95rem;
  }

  strong {
    color: ${props => props.highlight ? '#3b82f6' : '#1e293b'};
    font-size: ${props => props.highlight ? '1.25rem' : '1rem'};
    font-weight: 700;
  }
`;

const PricingNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  margin-top: 0.5rem;

  svg {
    color: #f59e0b;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  span {
    color: #92400e;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.5;
  }
`;

export default ServiceBooking;
