import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import SellerNavbar from '../components/Seller/SellerNavbar';
import axios from 'axios';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const MainContent = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #6b7280;
    margin: 0;
  }
`;

const FormCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e5e7eb;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  input, select, textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  small {
    color: #6b7280;
    margin-top: 0.25rem;
    font-size: 0.75rem;
  }
`;

const ImageUploadSection = styled.div`
  margin-top: 1rem;
  
  .upload-area {
    border: 2px dashed #d1d5db;
    border-radius: 0.5rem;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: #3b82f6;
      background: #f9fafb;
    }
    
    &.drag-over {
      border-color: #3b82f6;
      background: #eff6ff;
    }
  }
  
  .images-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .image-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: #dc2626;
      }
    }
  }
`;

const FeaturesSection = styled.div`
  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .feature-item {
    display: flex;
    gap: 0.5rem;
    
    input {
      flex: 1;
    }
    
    button {
      padding: 0.75rem 1rem;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: #fecaca;
      }
    }
  }
  
  .add-feature-btn {
    margin-top: 0.5rem;
    padding: 0.75rem 1rem;
    background: #dbeafe;
    color: #1d4ed8;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover {
      background: #bfdbfe;
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }
  
  &.secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
    }
  }
`;

const SellerAddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    category: 'countertop',
    subCategory: '',
    brand: 'Arroh',
    stock: '',
    sku: '',
    features: [''],
    specifications: {
      filtrationStages: '',
      filterLife: '',
      flowRate: '',
      dimensions: '',
      weight: '',
      warranty: '1 year',
      technology: ''
    },
    shipping: {
      isFreeShipping: false,
      shippingCharge: ''
    },
    images: [],
    tags: '',
    isFeatured: false,
    isActive: true
  });

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/seller/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const product = response.data.data;
        setFormData({
          ...product,
          tags: product.tags?.join(', ') || '',
          features: product.features?.length > 0 ? product.features : ['']
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }));
  };

  const handleShippingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      files.forEach(file => {
        formDataToSend.append('productImages', file);
      });

      const response = await axios.post(`${API_URL}/upload/products`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        console.log('✅ Images uploaded:', response.data.data);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...response.data.data]
        }));
        console.log('📦 Current product images:', [...formData.images, ...response.data.data]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/upload/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { imageUrl }
      });
      
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageUrl)
      }));
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.stock) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        features: formData.features.filter(f => f.trim() !== ''),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        specifications: {
          ...formData.specifications,
          filtrationStages: formData.specifications.filtrationStages ? parseInt(formData.specifications.filtrationStages) : undefined
        },
        shipping: {
          isFreeShipping: formData.shipping.isFreeShipping,
          shippingCharge: formData.shipping.isFreeShipping ? 0 : (formData.shipping.shippingCharge ? parseFloat(formData.shipping.shippingCharge) : 0)
        }
      };

      const url = isEditMode 
        ? `${API_URL}/seller/products/${id}`
        : `${API_URL}/seller/products`;
      
      const method = isEditMode ? 'put' : 'post';
      
      const response = await axios[method](url, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert(`Product ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/seller/products');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <SellerNavbar />
      
      <MainContent>
        <PageHeader>
          <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
          <p>Fill in the details below to {isEditMode ? 'update' : 'create'} your product</p>
        </PageHeader>

        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <FormSection>
              <h3>Basic Information</h3>
              <FormGrid>
                <FormGroup>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., RO Water Purifier 7L"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="e.g., WF-123456"
                    required
                  />
                  <small>Unique product identifier</small>
                </FormGroup>

                <FormGroup>
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="countertop">Countertop</option>
                    <option value="under-sink">Under Sink</option>
                    <option value="whole-house">Whole House</option>
                    <option value="faucet-mount">Faucet Mount</option>
                    <option value="reverse-osmosis">Reverse Osmosis</option>
                    <option value="portable">Portable</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </FormGroup>

                <FormGroup>
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Brand name"
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup style={{ marginTop: '1.5rem' }}>
                <label>Short Description *</label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief product description (max 200 characters)"
                  maxLength="200"
                  required
                />
              </FormGroup>

              <FormGroup style={{ marginTop: '1.5rem' }}>
                <label>Full Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed product description"
                  required
                />
              </FormGroup>
            </FormSection>

            {/* Pricing & Inventory */}
            <FormSection>
              <h3>Pricing & Inventory</h3>
              <FormGrid>
                <FormGroup>
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <small>For showing discounts</small>
                </FormGroup>

                <FormGroup>
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Shipping Configuration */}
            <FormSection>
              <h3>Shipping Configuration</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isFreeShipping"
                    checked={formData.shipping.isFreeShipping}
                    onChange={handleShippingChange}
                  />
                  <span style={{ fontWeight: '600', color: '#374151' }}>Offer Free Shipping</span>
                </label>
                <small style={{ color: '#6b7280', marginLeft: '1.75rem' }}>
                  Enable this to offer free shipping for this product
                </small>
              </div>

              {!formData.shipping.isFreeShipping && (
                <FormGroup>
                  <label>Shipping Charge (₹)</label>
                  <input
                    type="number"
                    name="shippingCharge"
                    value={formData.shipping.shippingCharge}
                    onChange={handleShippingChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <small>Enter the shipping charge for this product</small>
                </FormGroup>
              )}
            </FormSection>

            {/* Product Images */}
            <FormSection>
              <h3>Product Images</h3>
              <ImageUploadSection>
                <div className="upload-area">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                    <FiUpload style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, color: '#374151', fontWeight: '600' }}>
                      {uploading ? 'Uploading...' : 'Click to upload images'}
                    </p>
                    <small style={{ color: '#6b7280' }}>PNG, JPG up to 5MB</small>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="images-preview">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-item">
                        <img src={`http://localhost:5000${image}`} alt={`Product ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeImage(image)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ImageUploadSection>
            </FormSection>

            {/* Features */}
            <FormSection>
              <h3>Product Features</h3>
              <FeaturesSection>
                <div className="feature-list">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Enter a product feature"
                      />
                      {formData.features.length > 1 && (
                        <button type="button" onClick={() => removeFeature(index)}>
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="add-feature-btn" onClick={addFeature}>
                  + Add Feature
                </button>
              </FeaturesSection>
            </FormSection>

            {/* Specifications */}
            <FormSection>
              <h3>Specifications</h3>
              <FormGrid>
                <FormGroup>
                  <label>Filtration Stages</label>
                  <input
                    type="number"
                    name="filtrationStages"
                    value={formData.specifications.filtrationStages}
                    onChange={handleSpecChange}
                    placeholder="e.g., 7"
                    min="1"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Filter Life</label>
                  <input
                    type="text"
                    name="filterLife"
                    value={formData.specifications.filterLife}
                    onChange={handleSpecChange}
                    placeholder="e.g., 6 months"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Flow Rate</label>
                  <input
                    type="text"
                    name="flowRate"
                    value={formData.specifications.flowRate}
                    onChange={handleSpecChange}
                    placeholder="e.g., 15 L/hour"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.specifications.dimensions}
                    onChange={handleSpecChange}
                    placeholder="e.g., 40x30x50 cm"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.specifications.weight}
                    onChange={handleSpecChange}
                    placeholder="e.g., 8 kg"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.specifications.warranty}
                    onChange={handleSpecChange}
                    placeholder="e.g., 1 year"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Technology</label>
                  <input
                    type="text"
                    name="technology"
                    value={formData.specifications.technology}
                    onChange={handleSpecChange}
                    placeholder="e.g., RO + UV + UF"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Additional Settings */}
            <FormSection>
              <h3>Additional Settings</h3>
              <FormGroup>
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., water filter, purifier, RO"
                />
              </FormGroup>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  <span>Featured Product</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span>Active</span>
                </label>
              </div>
            </FormSection>

            {/* Form Actions */}
            <FormActions>
              <Button type="button" className="secondary" onClick={() => navigate('/seller/products')}>
                <FiX />
                Cancel
              </Button>
              <Button type="submit" className="primary" disabled={loading || uploading}>
                <FiSave />
                {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            </FormActions>
          </form>
        </FormCard>
      </MainContent>
    </PageContainer>
  );
};

export default SellerAddProduct;
