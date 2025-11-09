import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiPhone, FiMapPin, FiNavigation, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const RegisterCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 90vh;
  overflow-y: auto;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  .logo {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: white;
    font-size: 2rem;
    font-weight: bold;
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      transform: rotate(45deg);
      animation: shine 3s infinite;
    }
    
    @keyframes shine {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
      100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    }
  }
  
  h1 {
    color: #1f2937;
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  position: relative;
  
  label {
    display: block;
    color: #374151;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  .input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    z-index: 1;
    font-size: 1rem;
  }
  
  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    cursor: pointer;
    z-index: 1;
    font-size: 1rem;
    
    &:hover {
      color: #6b7280;
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(255, 255, 255, 1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(255, 255, 255, 1);
  }
`;

const RegisterButton = styled(motion.button)`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px -5px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0.5rem 0;
  
  input {
    margin-top: 0.25rem;
    transform: scale(1.2);
  }
  
  label {
    color: #374151;
    font-size: 0.75rem;
    line-height: 1.5;
    cursor: pointer;
    
    a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  
  span {
    padding: 0 1rem;
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 500;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 1rem;
  
  p {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  a {
    color: #3b82f6;
    font-weight: 700;
    text-decoration: none;
    font-size: 1rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BackToSite = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  text-decoration: none;
  margin-top: 1.5rem;
  justify-content: center;
  font-weight: 500;
  
  &:hover {
    color: #3b82f6;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #16a34a;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LocationButton = styled(motion.button)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    animation: ${props => props.loading ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const AddressSection = styled.div`
  background: rgba(59, 130, 246, 0.05);
  border: 2px dashed #3b82f6;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  
  h3 {
    color: #1f2937;
    font-size: 0.875rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const FieldError = styled.div`
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      landmark: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  // Fetch Indian states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (formData.address.state) {
      fetchCities(formData.address.state);
    }
  }, [formData.address.state]);

  const fetchStates = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/location/states`);
      if (response.data.success) {
        setStates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (state) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/location/cities/${encodeURIComponent(state)}`);
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationSuccess(false);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          const response = await axios.post(`${API_URL}/location/reverse-geocode`, {
            latitude,
            longitude
          });

          if (response.data.success) {
            const addressData = response.data.data;
            setFormData(prev => ({
              ...prev,
              address: {
                street: addressData.street || '',
                landmark: addressData.landmark || '',
                city: addressData.city || '',
                district: addressData.district || '',
                state: addressData.state || '',
                pincode: addressData.pincode || '',
                coordinates: {
                  latitude,
                  longitude
                }
              }
            }));
            setLocationSuccess(true);
            setTimeout(() => setLocationSuccess(false), 3000);
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setError('Could not fetch address from location');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to retrieve your location. Please enter address manually.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handlePincodeChange = async (pincode) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, pincode }
    }));

    // Clear previous success state
    setPincodeSuccess(false);

    // Auto-fetch location from pincode if valid (6 digits)
    if (pincode.length === 6 && /^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeLoading(true);
      console.log('🔍 Fetching location for PIN code:', pincode);
      
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/location/pincode/${pincode}`);
        if (response.data.success) {
          const data = response.data.data;
          
          console.log('✅ PIN code location found:', data);
          
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              city: data.city || prev.address.city,
              district: data.district || prev.address.district,
              state: data.state || prev.address.state,
              coordinates: data.coordinates || prev.address.coordinates
            }
          }));
          
          // Show success feedback
          setPincodeSuccess(true);
          setTimeout(() => setPincodeSuccess(false), 3000);
        }
      } catch (error) {
        console.error('❌ PIN code lookup error:', error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Handle nested address fields
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
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Real-time validation for email
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldErrors(prev => ({ ...prev, email: 'Wrong email format' }));
      } else {
        setFieldErrors(prev => ({ ...prev, email: '' }));
      }
    }
    
    // Real-time validation for phone
    if (name === 'phone' && value) {
      const cleanPhone = value.replace(/[\s\-\+()]/g, '');
      const phoneRegex = /^[6-9]\d{9}$/;
      
      if (cleanPhone.length > 0 && cleanPhone.length < 10) {
        setFieldErrors(prev => ({ ...prev, phone: 'Phone number must be 10 digits' }));
      } else if (cleanPhone.length === 10 && !phoneRegex.test(cleanPhone)) {
        setFieldErrors(prev => ({ ...prev, phone: 'Wrong number. Must start with 6, 7, 8, or 9' }));
      } else if (cleanPhone.length === 10 && phoneRegex.test(cleanPhone)) {
        setFieldErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Client-side validation
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }
    
    // Email validation with proper regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError('Wrong email! Please enter a valid email address');
      setFieldErrors({ email: 'Wrong email format. Example: user@example.com' });
      return;
    }
    
    // Phone validation - Indian phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/[\s\-\+()]/g, ''); // Remove spaces, dashes, etc.
    
    if (!formData.phone || cleanPhone.length < 10) {
      setError('Wrong phone number! Please enter a valid 10-digit mobile number');
      setFieldErrors({ phone: 'Wrong number. Enter 10-digit mobile number starting with 6-9' });
      return;
    }
    
    if (!phoneRegex.test(cleanPhone)) {
      setError('Wrong phone number! Indian mobile numbers start with 6, 7, 8, or 9');
      setFieldErrors({ phone: 'Wrong number. Must start with 6, 7, 8, or 9' });
      return;
    }

    if (!formData.address.city || !formData.address.state) {
      setError('Please provide your city and state');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password
      };
      
      console.log('✅ Client validation passed. Submitting registration...');
      
      const result = await register(userData);
      
      if (result.success) {
        // Show success message
        setRegistrationSuccess(true);
        setError('');
        setFieldErrors({});
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        
        // Set field-specific error if provided
        if (result.field) {
          setFieldErrors({ [result.field]: result.message });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <LogoSection>
          <div className="logo">
            <img src="/saiflow-logo.jpg" alt="Sai Flow Water" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1>Join Sai Flow Water</h1>
          <p>Create your account for premium water solutions across India</p>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage><FiAlertCircle /> {error}</ErrorMessage>}
          {locationSuccess && <SuccessMessage><FiCheck /> Location detected successfully!</SuccessMessage>}
          {registrationSuccess && (
            <SuccessMessage>
              <FiCheck /> Registration successful! Redirecting to login page...
            </SuccessMessage>
          )}
          
          <InputGroup>
            <label htmlFor="name">Full Name</label>
            <InputWrapper>
              <FiUser className="input-icon" />
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <label htmlFor="email">Email Address</label>
            <InputWrapper>
              <FiMail className="input-icon" />
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  borderColor: fieldErrors.email ? '#ef4444' : undefined
                }}
              />
            </InputWrapper>
            {fieldErrors.email && (
              <FieldError>
                <FiAlertCircle size={14} /> {fieldErrors.email}
              </FieldError>
            )}
          </InputGroup>

          <InputGroup>
            <label htmlFor="phone">Phone Number</label>
            <InputWrapper>
              <FiPhone className="input-icon" />
              <Input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{
                  borderColor: fieldErrors.phone ? '#ef4444' : undefined
                }}
              />
            </InputWrapper>
            {fieldErrors.phone && (
              <FieldError>
                <FiAlertCircle size={14} /> {fieldErrors.phone}
              </FieldError>
            )}
          </InputGroup>

          <AddressSection>
            <h3><FiMapPin /> Your Address</h3>
            
            <LocationButton
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              loading={locationLoading ? 1 : 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiNavigation />
              {locationLoading ? 'Detecting Location...' : 'Use My Current Location'}
            </LocationButton>

            <InputGroup>
              <label htmlFor="address.street">Street Address</label>
              <InputWrapper>
                <FiMapPin className="input-icon" />
                <Input
                  type="text"
                  id="address.street"
                  name="address.street"
                  placeholder="House/Flat No., Street Name"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <label htmlFor="address.landmark">Landmark (Optional)</label>
              <InputWrapper>
                <FiMapPin className="input-icon" />
                <Input
                  type="text"
                  id="address.landmark"
                  name="address.landmark"
                  placeholder="Near..."
                  value={formData.address.landmark}
                  onChange={handleChange}
                />
              </InputWrapper>
            </InputGroup>

            <InputRow>
              <InputGroup>
                <label htmlFor="address.pincode">
                  PIN Code
                  {pincodeLoading && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#3b82f6' }}>🔍 Fetching location...</span>}
                  {pincodeSuccess && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#10b981' }}>✓ Location found!</span>}
                </label>
                <InputWrapper>
                  <FiMapPin className="input-icon" />
                  <Input
                    type="text"
                    id="address.pincode"
                    name="address.pincode"
                    placeholder="6-digit PIN"
                    value={formData.address.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    maxLength="6"
                    pattern="[1-9][0-9]{5}"
                    style={{
                      borderColor: pincodeSuccess ? '#10b981' : pincodeLoading ? '#3b82f6' : undefined
                    }}
                  />
                </InputWrapper>
                {pincodeSuccess && formData.address.city && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.75rem', 
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <FiCheck size={14} /> Auto-filled: {formData.address.city}, {formData.address.state}
                  </div>
                )}
              </InputGroup>

              <InputGroup>
                <label htmlFor="address.city">City</label>
                <InputWrapper>
                  <FiMapPin className="input-icon" />
                  <Input
                    type="text"
                    id="address.city"
                    name="address.city"
                    placeholder="Enter your city"
                    value={formData.address.city}
                    onChange={handleChange}
                    required
                    list="cities-list"
                  />
                  {cities.length > 0 && (
                    <datalist id="cities-list">
                      {cities.map(city => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  )}
                </InputWrapper>
              </InputGroup>
            </InputRow>

            <InputRow>
              <InputGroup>
                <label htmlFor="address.district">District (Optional)</label>
                <InputWrapper>
                  <FiMapPin className="input-icon" />
                  <Input
                    type="text"
                    id="address.district"
                    name="address.district"
                    placeholder="District"
                    value={formData.address.district}
                    onChange={handleChange}
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <label htmlFor="address.state">State</label>
                <InputWrapper>
                  <FiMapPin className="input-icon" />
                  <Input
                    type="text"
                    id="address.state"
                    name="address.state"
                    placeholder="Enter your state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                    list="states-list"
                  />
                  {states.length > 0 && (
                    <datalist id="states-list">
                      {states.map(state => (
                        <option key={state.code} value={state.name} />
                      ))}
                    </datalist>
                  )}
                </InputWrapper>
              </InputGroup>
            </InputRow>
          </AddressSection>

          <InputGroup>
            <label htmlFor="password">Password (minimum 6 characters)</label>
            <InputWrapper>
              <FiLock className="input-icon" />
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Create password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
                style={{
                  borderColor: formData.password && formData.password.length < 6 ? '#ef4444' : undefined
                }}
              />
              <div 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </div>
            </InputWrapper>
            {formData.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ 
                  height: '4px', 
                  background: '#e5e7eb', 
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((formData.password.length / 6) * 100, 100)}%`,
                    background: formData.password.length < 6 ? '#ef4444' : '#10b981',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  color: formData.password.length < 6 ? '#ef4444' : '#10b981', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem',
                  fontWeight: '600'
                }}>
                  {formData.password.length < 6 
                    ? `Too short: ${formData.password.length}/6 characters` 
                    : `Strong password ✓`
                  }
                </div>
              </div>
            )}
          </InputGroup>

          <InputGroup>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <InputWrapper>
              <FiLock className="input-icon" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <div 
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </div>
            </InputWrapper>
          </InputGroup>

          <TermsCheckbox>
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="agreeToTerms">
              I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>. 
              I understand that Sai Flow Water provides premium water purifier services in Aurangabad, Bihar and surrounding areas.
            </label>
          </TermsCheckbox>

          <RegisterButton
            type="submit"
            disabled={isLoading || formData.password.length < 6 || !formData.agreeToTerms}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              opacity: (isLoading || formData.password.length < 6 || !formData.agreeToTerms) ? 0.6 : 1,
              cursor: (isLoading || formData.password.length < 6 || !formData.agreeToTerms) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Creating Account...' : 
             formData.password.length < 6 ? 'Password Too Short' :
             !formData.agreeToTerms ? 'Accept Terms to Continue' :
             'Create Account'}
          </RegisterButton>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <LoginLink>
          <p>Already have an account?</p>
          <Link to="/login">Sign In</Link>
        </LoginLink>

        <BackToSite to="/">
          ← Back to Sai Flow Water
        </BackToSite>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;