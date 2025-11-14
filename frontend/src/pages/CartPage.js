import React, { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingCart, 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiArrowRight,
  FiArrowLeft,
  FiTag,
  FiTruck
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../utils/helpers';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

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

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    
    svg {
      color: #3b82f6;
    }
  }
  
  p {
    color: #6b7280;
    font-size: 1.1rem;
  }
`;

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const CartItemsHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
  
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
`;

const CartItemsList = styled.div`
  max-height: 600px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 4px;
  }
`;

const CartItem = styled(motion.div)`
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  align-items: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }
`;

const ItemImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
    
    a {
      color: inherit;
      text-decoration: none;
      transition: color 0.2s ease;
      
      &:hover {
        color: #3b82f6;
      }
    }
  }
  
  .price {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.5rem;
  }
  
  .stock-status {
    font-size: 0.875rem;
    color: #10b981;
    font-weight: 500;
    
    &.low-stock {
      color: #f59e0b;
    }
    
    &.out-of-stock {
      color: #ef4444;
    }
  }
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  color: #374151;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #3b82f6;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #1f2937;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #fecaca;
  }
`;

const ItemSubtotal = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CartSummary = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const SummaryTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  .label {
    color: #6b7280;
    font-size: 0.9375rem;
  }
  
  .value {
    font-weight: 600;
    color: #1f2937;
    font-size: 1rem;
  }
  
  &.total {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid #e5e7eb;
    
    .label {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }
    
    .value {
      font-size: 1.5rem;
      color: #3b82f6;
    }
  }
`;

const PromoSection = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 0.5rem;
  border: 1px dashed #3b82f6;
  
  .promo-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #3b82f6;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .promo-input {
    display: flex;
    gap: 0.5rem;
    
    input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
      }
    }
    
    button {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
      
      &:hover {
        background: #2563eb;
      }
    }
  }
`;

const ShippingInfo = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: #10b981;
    font-size: 1.5rem;
  }
  
  .info {
    flex: 1;
    
    .title {
      font-weight: 600;
      color: #065f46;
      margin-bottom: 0.25rem;
    }
    
    .description {
      font-size: 0.875rem;
      color: #047857;
    }
  }
`;

const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContinueShoppingButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: 1rem;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const EmptyCart = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 4rem 2rem;
  text-align: center;
  
  .icon {
    font-size: 5rem;
    color: #d1d5db;
    margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 2rem;
  }
`;

const ShopNowButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }
`;

const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, loading, removeFromCart, updateCartItem, clearCart, fetchCart } = useCart();

  // Clean up null items when cart loads
  useEffect(() => {
    const cleanupNullItems = async () => {
      const nullItems = items.filter(item => !item.product);
      if (nullItems.length > 0) {
        console.log(`🧹 Found ${nullItems.length} corrupted cart items, cleaning up...`);
        // Refresh cart to get clean data
        if (fetchCart) {
          await fetchCart();
        }
      }
    };
    
    if (items.length > 0) {
      cleanupNullItems();
    }
  }, [items, fetchCart]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      try {
        await removeFromCart(productId);
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && items.length === 0) {
    return (
      <PageContainer>
        <Container>
          <LoadingSpinner text="Loading your cart..." />
        </Container>
      </PageContainer>
    );
  }

  // Filter valid items (items with products) with error handling
  const validItems = React.useMemo(() => {
    try {
      return items.filter(item => {
        return item && 
               item.product && 
               item.product._id && 
               item.product.name &&
               Array.isArray(item.product.images);
      });
    } catch (error) {
      console.error('Error filtering cart items:', error);
      return [];
    }
  }, [items]);
  
  if (validItems.length === 0) {
    return (
      <PageContainer>
        <Container>
          <PageHeader>
            <h1>
              <FiShoppingCart />
              Shopping Cart
            </h1>
          </PageHeader>
          
          <EmptyCart>
            <div className="icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <ShopNowButton to="/products">
              Start Shopping
              <FiArrowRight />
            </ShopNowButton>
          </EmptyCart>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <PageHeader>
          <h1>
            <FiShoppingCart />
            Shopping Cart
          </h1>
          <p>{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
        </PageHeader>

        <CartContent>
          <CartItems>
            <CartItemsHeader>
              <h2>Cart Items ({validItems.length})</h2>
            </CartItemsHeader>
            
            <CartItemsList>
              <AnimatePresence>
                {(() => {
                  try {
                    return validItems.map((item, index) => {
                      // Additional safety check
                      if (!item || !item.product || !item.product.images) {
                        return null;
                      }
                      
                      return (
                        <CartItem
                          key={`cart-item-${item.product._id || item._id || index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ItemImage>
                            <img 
                              src={getImageUrl(item.product.images[0] || '')} 
                              alt={item.product.name || 'Product'}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%236b7280" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          </ItemImage>
                          <ItemDetails>
                            <h3>
                              <Link to={`/product/${item.product?._id || '#'}`}>
                                {item.product?.name || 'Unknown Product'}
                              </Link>
                            </h3>
                            <div className="price">₹{(item.product?.price || 0).toLocaleString('en-IN')}</div>
                            <div className={`stock-status ${(item.product?.stock || 0) <= 5 ? 'low-stock' : ''}`}>
                              {(item.product?.stock || 0) > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                            </div>
                          </ItemDetails>
                          
                          <ItemActions>
                            <QuantityControl>
                              <QuantityButton
                                onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || loading || !item.product}
                              >
                                <FiMinus />
                              </QuantityButton>
                              <QuantityDisplay>{item.quantity || 0}</QuantityDisplay>
                              <QuantityButton
                                onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                                disabled={item.quantity >= (item.product?.stock || 0) || loading || !item.product}
                              >
                                <FiPlus />
                              </QuantityButton>
                            </QuantityControl>
                            
                            <ItemSubtotal>
                              ₹{((item.product?.price || 0) * (item.quantity || 0)).toLocaleString()}
                            </ItemSubtotal>
                            
                            <RemoveButton
                              onClick={() => handleRemoveItem(item.product?._id)}
                              disabled={loading || !item.product}
                            >
                              <FiTrash2 />
                              Remove
                            </RemoveButton>
                          </ItemActions>
                        </CartItem>
                      );
                    }).filter(Boolean); // Remove any null items
                  } catch (error) {
                    console.error('Error rendering cart items:', error);
                    return (
                      <div style={{padding: '20px', textAlign: 'center'}}>
                        <p>Error loading cart items. Please refresh the page.</p>
                        <button onClick={() => window.location.reload()}>Refresh</button>
                      </div>
                    );
                  }
                })()}
              </AnimatePresence>
            </CartItemsList>
          </CartItems>

          <CartSummary>
            <SummaryTitle>Order Summary</SummaryTitle>
            
            <SummaryRow>
              <span className="label">Subtotal ({totalItems} items)</span>
              <span className="value">₹{totalPrice.toLocaleString()}</span>
            </SummaryRow>
            
            <SummaryRow>
              <span className="label">Shipping</span>
              <span className="value" style={{ color: '#10b981' }}>FREE</span>
            </SummaryRow>
            
            <SummaryRow>
              <span className="label">Tax (18% GST)</span>
              <span className="value">₹{Math.round(totalPrice * 0.18).toLocaleString()}</span>
            </SummaryRow>
            
            <PromoSection>
              <div className="promo-header">
                <FiTag />
                Have a promo code?
              </div>
              <div className="promo-input">
                <input type="text" placeholder="Enter code" />
                <button>Apply</button>
              </div>
            </PromoSection>
            
            <ShippingInfo>
              <FiTruck />
              <div className="info">
                <div className="title">Free Shipping</div>
                <div className="description">On all orders within 50km radius</div>
              </div>
            </ShippingInfo>
            
            <SummaryRow className="total">
              <span className="label">Total</span>
              <span className="value">
                ₹{Math.round(totalPrice * 1.18).toLocaleString()}
              </span>
            </SummaryRow>
            
            <CheckoutButton
              onClick={handleCheckout}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Proceed to Checkout
              <FiArrowRight />
            </CheckoutButton>
            
            <ContinueShoppingButton to="/products">
              <FiArrowLeft />
              Continue Shopping
            </ContinueShoppingButton>
          </CartSummary>
        </CartContent>
      </Container>
    </PageContainer>
  );
};

export default CartPage;
