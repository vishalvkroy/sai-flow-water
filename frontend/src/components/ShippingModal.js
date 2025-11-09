import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiTruck, FiPackage, FiMapPin, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { ordersAPI } from '../utils/api';

const ModalOverlay = styled.div`
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
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 12px;

    svg {
      font-size: 1.75rem;
    }
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }

  svg {
    font-size: 1.25rem;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const OrderInfo = styled.div`
  background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  border-left: 4px solid #667eea;

  h3 {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    span {
      font-size: 0.95rem;
      color: #1f2937;
      font-weight: 500;
    }
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;

    svg {
      color: #667eea;
    }
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      color: #667eea;
      font-size: 1rem;
    }

    .required {
      color: #ef4444;
    }
  }

  input, textarea {
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &:disabled {
      background: #f9fafb;
      cursor: not-allowed;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const PackageDetails = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  .package-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;

  &.cancel {
    background: #f3f4f6;
    color: #374151;

    &:hover {
      background: #e5e7eb;
    }
  }

  &.submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  svg {
    font-size: 1.1rem;
  }
`;

const ShippingModal = ({ order, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    weight: 2,
    length: 30,
    breadth: 20,
    height: 15,
    notes: '',
    courierId: ''
  });
  
  const [courierOptions, setCourierOptions] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);

  useEffect(() => {
    if (order?.shippingAddress) {
      // Calculate total weight from order items
      let totalWeight = 0;
      let maxLength = 30;
      let maxBreadth = 20;
      let maxHeight = 15;
      
      if (order.orderItems && order.orderItems.length > 0) {
        console.log('🔍 DEBUG: Full order object:', order);
        console.log('🔍 DEBUG: Order items:', order.orderItems);
        
        order.orderItems.forEach(item => {
          const product = item.product;
          const quantity = item.quantity || 1;
          
          console.log('🔍 DEBUG: Complete product object:', product);
          
          // Parse weight - try specifications.weight FIRST (more accurate), then weightInKg
          let itemWeight = 2; // default
          
          if (product?.specifications?.weight) {
            // Weight from specifications (string like "8.5 kg" or "15 kg")
            const weightStr = product.specifications.weight.toString().toLowerCase();
            const weightMatch = weightStr.match(/(\d+\.?\d*)/);
            if (weightMatch) {
              itemWeight = parseFloat(weightMatch[1]);
              console.log(`  ✅ Using specifications.weight: ${itemWeight} kg`);
            }
          } else if (product?.weightInKg) {
            // Fallback to direct weight in kg (number)
            itemWeight = parseFloat(product.weightInKg);
            console.log(`  ✅ Using weightInKg: ${itemWeight} kg`);
          }
          
          totalWeight += itemWeight * quantity;
          
          // Parse dimensions from specifications
          // Supports: "45cm x 35cm x 50cm", "50x40x30 cm", "50 x 40 x 30"
          if (product?.specifications?.dimensions) {
            const dimStr = product.specifications.dimensions.toString().toLowerCase();
            // Remove all "cm" and "mm" units first
            const cleanDimStr = dimStr.replace(/cm|mm/gi, '').trim();
            // Match numbers separated by x or ×
            const dimMatch = cleanDimStr.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)/);
            if (dimMatch) {
              const l = parseFloat(dimMatch[1]);
              const b = parseFloat(dimMatch[2]);
              const h = parseFloat(dimMatch[3]);
              maxLength = Math.max(maxLength, l);
              maxBreadth = Math.max(maxBreadth, b);
              maxHeight = Math.max(maxHeight, h);
              console.log(`  ✅ Parsed dimensions: ${l}×${b}×${h} cm`);
            }
          }
          
          console.log(`📦 Product: ${product?.name}`, {
            weightInKg: product?.weightInKg,
            specificationsWeight: product?.specifications?.weight,
            parsedWeight: itemWeight,
            specificationsDimensions: product?.specifications?.dimensions,
            quantity
          });
        });
      }
      
      // Use calculated weight or default to 2kg
      const packageWeight = totalWeight > 0 ? totalWeight : 2;
      
      console.log(`📦 Calculated package details:`, {
        weight: packageWeight,
        length: maxLength,
        breadth: maxBreadth,
        height: maxHeight,
        items: order.orderItems?.length
      });
      
      setFormData(prev => {
        const updatedFormData = {
          ...prev,
          fullName: order.shippingAddress.fullName || '',
          phone: order.shippingAddress.phone || '',
          email: order.shippingAddress.email || '',
          address: order.shippingAddress.address || '',
          city: order.shippingAddress.city || '',
          state: order.shippingAddress.state || '',
          postalCode: order.shippingAddress.postalCode || '',
          country: order.shippingAddress.country || 'India',
          weight: packageWeight,
          length: maxLength,
          breadth: maxBreadth,
          height: maxHeight
        };
        
        console.log('✅ Form data updated with package details:', {
          weight: updatedFormData.weight,
          length: updatedFormData.length,
          breadth: updatedFormData.breadth,
          height: updatedFormData.height
        });
        
        return updatedFormData;
      });
      
      // Show success message
      if (totalWeight > 0) {
        toast.success(`📦 Package details auto-filled: ${packageWeight}kg, ${maxLength}×${maxBreadth}×${maxHeight}cm`, {
          position: 'top-right',
          autoClose: 3000
        });
      }
      
      // Fetch courier rates with calculated package details
      // IMPORTANT: Pass the calculated weight and dimensions to get accurate rates
      fetchCourierRates({
        weight: packageWeight,
        length: maxLength,
        breadth: maxBreadth,
        height: maxHeight
      });
    }
  }, [order]);
  
  const fetchCourierRates = async (customParams = null) => {
    if (!order?._id) return;
    
    try {
      setLoadingCouriers(true);
      
      // Show loading toast for auto-recalculation
      if (customParams) {
        toast.info('🔄 Updating courier rates...', {
          position: 'top-right',
          autoClose: 1000
        });
      }
      
      // Build URL with custom weight/dimensions if provided
      let url = `/orders/${order._id}/courier-rates`;
      if (customParams) {
        const params = new URLSearchParams();
        if (customParams.weight) params.append('weight', customParams.weight);
        if (customParams.length) params.append('length', customParams.length);
        if (customParams.breadth) params.append('breadth', customParams.breadth);
        if (customParams.height) params.append('height', customParams.height);
        url += `?${params.toString()}`;
      }
      
      const response = await ordersAPI.getCourierRates(order._id, customParams);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Real courier rates from Shipmozo
        console.log(`✅ Received ${response.data.data.length} real courier options from Shipmozo`);
        
        // Sort by total_charge (cheapest first)
        const sortedCouriers = [...response.data.data].sort((a, b) => 
          (a.total_charge || 0) - (b.total_charge || 0)
        );
        
        // Log price range for debugging
        const prices = sortedCouriers.map(c => c.total_charge);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        console.log(`💰 Price range: ₹${minPrice} - ₹${maxPrice} (sorted cheapest first)`);
        
        setCourierOptions(sortedCouriers);
        
        // Auto-select cheapest courier (first one after sorting)
        const cheapest = sortedCouriers[0];
        setFormData(prev => ({ ...prev, courierId: cheapest.courier_id }));
        
        // Show success message with price range
        if (customParams) {
          toast.success(`Updated! ${response.data.data.length} couriers • ₹${Math.round(minPrice)}-₹${Math.round(maxPrice)}`, {
            position: 'top-right',
            autoClose: 2000
          });
        } else {
          toast.success(`Found ${response.data.data.length} courier options!`, {
            position: 'top-right',
            autoClose: 2000
          });
        }
      } else {
        // No courier rates available
        console.warn('⚠️ No courier rates returned from Shipmozo');
        setCourierOptions([]);
        
        toast.error('Unable to fetch courier rates. Please check Shipmozo configuration or try again.', {
          position: 'top-right',
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch courier rates:', error);
      setCourierOptions([]);
      
      toast.error('Failed to fetch courier rates. Please try again or check your internet connection.', {
        position: 'top-right',
        autoClose: 5000
      });
    } finally {
      setLoadingCouriers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      
      // Auto-recalculate rates when package details change
      if (['weight', 'length', 'breadth', 'height'].includes(name)) {
        // Debounce the API call to avoid too many requests
        if (window.recalculateTimeout) {
          clearTimeout(window.recalculateTimeout);
        }
        
        window.recalculateTimeout = setTimeout(() => {
          console.log('🔄 Auto-recalculating rates with updated package details:', {
            weight: newFormData.weight,
            length: newFormData.length,
            breadth: newFormData.breadth,
            height: newFormData.height
          });
          
          fetchCourierRates({
            weight: newFormData.weight,
            length: newFormData.length,
            breadth: newFormData.breadth,
            height: newFormData.height
          });
        }, 1000); // Wait 1 second after user stops typing
      }
      
      return newFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (formData.postalCode.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN code');
      return;
    }

    onSubmit(formData);
  };

  if (!order) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>
            <FiTruck />
            Create Shipment via Shipmojo
          </h2>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <OrderInfo>
            <h3>
              <FiPackage />
              Order Details
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Order Number</label>
                <span>#{order.orderNumber || order._id?.slice(-8)}</span>
              </div>
              <div className="info-item">
                <label>Order Amount</label>
                <span>₹{(order.totalAmount || order.totalPrice || 0).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Payment Method</label>
                <span>{order.paymentMethod === 'cash_on_delivery' ? 'COD' : 'Prepaid'}</span>
              </div>
              <div className="info-item">
                <label>Items</label>
                <span>{order.orderItems?.length || 0} product(s)</span>
              </div>
            </div>
          </OrderInfo>

          <form onSubmit={handleSubmit}>
            <FormSection>
              <h3>
                <FiUser />
                Customer Information
              </h3>
              <FormGrid>
                <FormGroup>
                  <label>
                    <FiUser />
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>
                    <FiPhone />
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </FormGroup>

                <FormGroup className="full-width">
                  <label>
                    <FiMail />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            <FormSection>
              <h3>
                <FiMapPin />
                Delivery Address
              </h3>
              <FormGrid>
                <FormGroup className="full-width">
                  <label>
                    Street Address <span className="required">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House no., Building name, Street, Area"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>State <span className="required">*</span></label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>PIN Code <span className="required">*</span></label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="6-digit PIN"
                    maxLength="6"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Professional Courier Comparison */}
            {courierOptions.length > 0 && (
              <FormSection>
                <h3 style={{ marginBottom: '16px' }}>
                  <FiTruck />
                  Compare & Select Courier Partner
                </h3>
                
                {/* Volumetric Weight Info */}
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '0.85rem',
                  color: '#1e40af'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    ℹ️ About Chargeable Weight
                  </div>
                  <div style={{ lineHeight: '1.5' }}>
                    Couriers charge based on the <strong>higher value</strong> between actual weight ({formData.weight}kg) and volumetric weight 
                    (calculated as: Length × Breadth × Height ÷ 5000). 
                    Large but light packages may have higher chargeable weight.
                  </div>
                </div>
                
                {/* Courier Comparison Table */}
                <div style={{ 
                  overflowX: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  background: 'white'
                }}>
                  <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <th style={{ padding: '14px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600' }}>Select</th>
                        <th style={{ padding: '14px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600' }}>Courier</th>
                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>Type</th>
                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>Rate</th>
                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>Delivery</th>
                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>Success Rate</th>
                        <th style={{ padding: '14px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courierOptions.map((courier, index) => (
                        <tr 
                          key={courier.courier_id}
                          onClick={() => setFormData(prev => ({ ...prev, courierId: courier.courier_id }))}
                          style={{
                            background: formData.courierId === courier.courier_id ? '#f0f9ff' : index % 2 === 0 ? '#f9fafb' : 'white',
                            borderBottom: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = formData.courierId === courier.courier_id ? '#f0f9ff' : index % 2 === 0 ? '#f9fafb' : 'white'}
                        >
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <input
                              type="radio"
                              name="courierId"
                              value={courier.courier_id}
                              checked={formData.courierId === courier.courier_id}
                              onChange={handleChange}
                              style={{ 
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                accentColor: '#667eea'
                              }}
                            />
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.95rem' }}>
                              {courier.courier_name}
                            </div>
                            {courier.minimum_chargeable_weight && (
                              <div style={{ 
                                fontSize: '0.7rem', 
                                color: '#6b7280', 
                                marginTop: '2px',
                                fontStyle: 'italic'
                              }}>
                                Chg. Weight: {courier.minimum_chargeable_weight}
                              </div>
                            )}
                            {formData.courierId === courier.courier_id && (
                              <span style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                padding: '2px 8px',
                                background: '#10b981',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: '600'
                              }}>
                                SELECTED
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 10px',
                              background: courier.type === 'Express' ? '#fef3c7' : courier.type === 'Surface' ? '#dbeafe' : '#e0e7ff',
                              color: courier.type === 'Express' ? '#92400e' : courier.type === 'Surface' ? '#1e40af' : '#4338ca',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {courier.type || 'Standard'}
                            </span>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontWeight: '700', color: '#059669', fontSize: '1.1rem' }}>
                              ₹{Math.round(courier.total_charge)}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                              Base: ₹{courier.rate}
                            </div>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                            {courier.estimated_days || courier.estimated_delivery_days} {(courier.estimated_days || courier.estimated_delivery_days) === '1' ? 'day' : 'days'}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ fontSize: '1.1rem' }}>✓</span>
                              <span style={{ fontWeight: '600', color: '#059669' }}>
                                {courier.success_rate || '95%'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ color: '#f59e0b', fontSize: '1rem' }}>⭐</span>
                              <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                {courier.rating || '4.5'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Selected Courier Summary */}
                {formData.courierId && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: '12px',
                    border: '2px solid #0ea5e9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>📦</span>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0c4a6e', fontSize: '1rem' }}>
                          Selected: {courierOptions.find(c => c.courier_id === formData.courierId)?.courier_name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#075985', marginTop: '4px' }}>
                          Estimated delivery: {courierOptions.find(c => c.courier_id === formData.courierId)?.estimated_days || courierOptions.find(c => c.courier_id === formData.courierId)?.estimated_delivery_days} {((courierOptions.find(c => c.courier_id === formData.courierId)?.estimated_days || courierOptions.find(c => c.courier_id === formData.courierId)?.estimated_delivery_days) === '1' ? 'day' : 'days')} • 
                          Total cost: ₹{Math.round(courierOptions.find(c => c.courier_id === formData.courierId)?.total_charge || 0)} (Base: ₹{courierOptions.find(c => c.courier_id === formData.courierId)?.rate})
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </FormSection>
            )}

            <FormSection>
              <h3>
                <FiPackage />
                Package Details
              </h3>
              <div style={{ 
                background: '#f0f9ff', 
                padding: '10px 15px', 
                borderRadius: '8px', 
                marginBottom: '15px',
                border: '1px solid #0ea5e9'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.85rem', 
                  color: '#0c4a6e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                  <span>
                    Package details auto-filled from product data. Modify them to see updated courier rates automatically.
                  </span>
                </p>
              </div>
              <PackageDetails>
                <div className="package-grid">
                  <FormGroup>
                    <label>Weight (kg) <span style={{ color: '#0ea5e9', fontSize: '0.75rem' }}>✓ Auto-filled</span></label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Length (cm) <span style={{ color: '#0ea5e9', fontSize: '0.75rem' }}>✓ Auto-filled</span></label>
                    <input
                      type="number"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      min="1"
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Breadth (cm) <span style={{ color: '#0ea5e9', fontSize: '0.75rem' }}>✓ Auto-filled</span></label>
                    <input
                      type="number"
                      name="breadth"
                      value={formData.breadth}
                      onChange={handleChange}
                      min="1"
                    />
                  </FormGroup>

                  <FormGroup>
                    <label>Height (cm) <span style={{ color: '#0ea5e9', fontSize: '0.75rem' }}>✓ Auto-filled</span></label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="1"
                    />
                  </FormGroup>
                </div>

                <FormGroup className="full-width" style={{ marginTop: '12px' }}>
                  <label>Special Instructions (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special handling instructions..."
                    rows="2"
                  />
                </FormGroup>
                
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      fetchCourierRates({
                        weight: formData.weight,
                        length: formData.length,
                        breadth: formData.breadth,
                        height: formData.height
                      });
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#f0f9ff',
                      color: '#0c4a6e',
                      border: '1px solid #0ea5e9',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    🔄 Recalculate Now
                  </button>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
                    Rates update automatically 1 second after you stop typing
                  </p>
                </div>
              </PackageDetails>
            </FormSection>

            <ButtonGroup>
              <Button type="button" className="cancel" onClick={onClose}>
                <FiX />
                Cancel
              </Button>
              <Button type="submit" className="submit" disabled={isLoading}>
                <FiTruck />
                {isLoading ? 'Creating Shipment...' : 'Create Shipment via Shipmojo'}
              </Button>
            </ButtonGroup>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ShippingModal;
