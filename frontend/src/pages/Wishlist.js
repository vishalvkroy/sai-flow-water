import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { formatCurrency, getImageUrl } from '../utils/helpers';

const PageContainer = styled.div`
  min-height: calc(100vh - 70px); /* Account for navbar height */
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding-top: 2rem;
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
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: #ef4444;
    }
  }
  
  p {
    color: #6b7280;
    margin: 0;
  }
`;

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const WishlistCard = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #dc2626;
    transform: scale(1.1);
  }
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
  }
`;

const ProductDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const CurrentPrice = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const StockStatus = styled.div`
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
  
  ${props => props.inStock ? `
    color: #10b981;
  ` : `
    color: #ef4444;
  `}
`;

const ShippingInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  ${props => props.isFree && `
    color: #10b981;
    font-weight: 600;
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ViewDetailsButton = styled.button`
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 4rem;
    color: #d1d5db;
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }
`;

const BrowseButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }
`;

const ClearAllButton = styled.button`
  background: transparent;
  color: #ef4444;
  border: 2px solid #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #ef4444;
    color: white;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <MainContent>
          <PageHeader>
            <h1><FiHeart /> My Wishlist</h1>
            <p>Loading your wishlist...</p>
          </PageHeader>
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <MainContent>
        <PageHeader>
          <h1><FiHeart /> My Wishlist</h1>
          <p>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist</p>
        </PageHeader>

        {wishlist.length > 0 && (
          <HeaderActions>
            <div></div>
            <ClearAllButton onClick={handleClearAll}>
              <FiTrash2 />
              Clear All
            </ClearAllButton>
          </HeaderActions>
        )}

        {wishlist.length === 0 ? (
          <EmptyState>
            <FiHeart />
            <h2>Your Wishlist is Empty</h2>
            <p>Start adding products you love to your wishlist</p>
            <BrowseButton onClick={() => navigate('/products')}>
              Browse Products
            </BrowseButton>
          </EmptyState>
        ) : (
          <WishlistGrid>
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ImageContainer>
                  <ProductImage 
                    src={getImageUrl(product.images?.[0])} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/default-product.jpg';
                    }}
                  />
                  <RemoveButton
                    onClick={() => removeFromWishlist(product._id)}
                    title="Remove from wishlist"
                  >
                    <FiX />
                  </RemoveButton>
                </ImageContainer>

                <CardContent>
                  <ProductName onClick={() => navigate(`/product/${product._id}`)}>
                    {product.name}
                  </ProductName>
                  
                  <ProductDescription>
                    {product.shortDescription || product.description}
                  </ProductDescription>

                  <StockStatus inStock={product.stock > 0}>
                    {product.stock > 0 ? 
                      `${product.stock} in stock` : 
                      'Out of stock'
                    }
                  </StockStatus>

                  {product.shipping && (
                    <ShippingInfo isFree={product.shipping.isFreeShipping}>
                      {product.shipping.isFreeShipping ? (
                        '✓ Free Shipping'
                      ) : (
                        `Shipping: ${formatCurrency(product.shipping.shippingCharge)}`
                      )}
                    </ShippingInfo>
                  )}

                  <PriceContainer>
                    <CurrentPrice>{formatCurrency(product.price)}</CurrentPrice>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <OriginalPrice>{formatCurrency(product.originalPrice)}</OriginalPrice>
                    )}
                  </PriceContainer>

                  <ButtonGroup>
                    <AddToCartButton
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stock === 0}
                    >
                      <FiShoppingCart />
                      Add to Cart
                    </AddToCartButton>
                    <ViewDetailsButton onClick={() => navigate(`/product/${product._id}`)}>
                      View
                    </ViewDetailsButton>
                  </ButtonGroup>
                </CardContent>
              </WishlistCard>
            ))}
          </WishlistGrid>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default Wishlist;
