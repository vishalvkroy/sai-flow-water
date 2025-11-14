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
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../utils/api';
import { getImageUrl } from '../utils/helpers';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const EmptyCartMessage = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  h2 {
    color: #1f2937;
    margin-bottom: 1rem;
  }

  p {
    color: #6b7280;
    margin-bottom: 2rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const CheckoutSafe = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice } = useCart();
  const { user } = useAuth();

  // Bulletproof filtering with comprehensive validation
  const validItems = useMemo(() => {
    try {
      if (!Array.isArray(items)) {
        console.warn('Items is not an array:', items);
        return [];
      }

      const filtered = items.filter(item => {
        // Comprehensive validation
        if (!item) {
          console.warn('Found null/undefined item');
          return false;
        }

        if (!item.product) {
          console.warn('Found item without product:', item);
          return false;
        }

        if (!item.product._id) {
          console.warn('Found product without _id:', item.product);
          return false;
        }

        if (!item.product.name) {
          console.warn('Found product without name:', item.product);
          return false;
        }

        if (!item.quantity || item.quantity <= 0) {
          console.warn('Found item with invalid quantity:', item);
          return false;
        }

        return true;
      });

      console.log(`✅ Filtered ${items.length} items down to ${filtered.length} valid items`);
      return filtered;

    } catch (error) {
      console.error('Error filtering checkout items:', error);
      return [];
    }
  }, [items]);

  // Redirect if no valid items
  useEffect(() => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (validItems.length === 0) {
      console.log('No valid items for checkout, redirecting to cart');
      toast.error('Your cart is empty or contains invalid items');
      navigate('/cart');
      return;
    }
  }, [user, validItems, navigate]);

  // Don't render if no valid items
  if (!validItems || validItems.length === 0) {
    return (
      <PageContainer>
        <Container>
          <EmptyCartMessage>
            <FiAlertCircle size={48} color="#f59e0b" />
            <h2>No Items to Checkout</h2>
            <p>Your cart is empty or contains invalid items. Please add some products to continue.</p>
            <BackButton onClick={() => navigate('/products')}>
              <FiArrowLeft />
              Continue Shopping
            </BackButton>
          </EmptyCartMessage>
        </Container>
      </PageContainer>
    );
  }

  // Safe rendering with error boundaries
  const renderCartItems = () => {
    try {
      return validItems.map((item, index) => {
        // Additional safety check for each item
        if (!item || !item.product) {
          return null;
        }

        return (
          <div key={item.product._id || index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <img 
              src={getImageUrl(item.product?.images?.[0]) || '/default-product.jpg'}
              alt={item.product?.name || 'Product'}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '0.5rem'
              }}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23e5e7eb" width="60" height="60"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#1f2937' }}>
                {item.product?.name || 'Unknown Product'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                Qty: {item.quantity || 1} × ₹{(item.product?.price || 0).toLocaleString()}
              </p>
            </div>
            <div style={{ fontWeight: '600', color: '#1f2937' }}>
              ₹{((item.product?.price || 0) * (item.quantity || 1)).toLocaleString()}
            </div>
          </div>
        );
      }).filter(Boolean); // Remove any null items
    } catch (error) {
      console.error('Error rendering cart items:', error);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          <FiAlertCircle size={24} />
          <p>Error loading cart items. Please refresh the page.</p>
        </div>
      );
    }
  };

  return (
    <PageContainer>
      <Container>
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <FiShield size={24} color="#10b981" />
            <h1 style={{ margin: 0, color: '#1f2937' }}>Secure Checkout</h1>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
              Order Summary ({validItems.length} items)
            </h3>
            {renderCartItems()}
          </div>

          <div style={{
            background: '#f0f9ff',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>₹{totalPrice?.toLocaleString() || '0'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Tax (18% GST):</span>
              <span>₹{Math.round((totalPrice || 0) * 0.18).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Shipping:</span>
              <span style={{ color: '#10b981' }}>FREE</span>
            </div>
            <hr style={{ margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.125rem' }}>
              <span>Total:</span>
              <span>₹{((totalPrice || 0) + Math.round((totalPrice || 0) * 0.18)).toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <BackButton onClick={() => navigate('/cart')}>
              <FiArrowLeft />
              Back to Cart
            </BackButton>
            
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
            onClick={() => toast.info('Checkout functionality will be implemented soon!')}>
              <FiCreditCard />
              Proceed to Payment
            </button>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: '0.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#166534'
          }}>
            🔒 Your payment information is secure and encrypted
          </div>
        </div>
      </Container>
    </PageContainer>
  );
};

export default CheckoutSafe;
