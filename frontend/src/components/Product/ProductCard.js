import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { getImageUrl } from '../../utils/helpers';
import { formatCurrency, calculateDiscount } from '../../utils/helpers';
import { handleImageError } from '../../utils/imageFallback';
import { toast } from 'react-toastify';

const Card = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transform: translateY(-8px);
    border-color: rgba(59, 130, 246, 0.3);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  ${Card}:hover &::after {
    opacity: 1;
  }
`;

const QuickViewOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  border-top: 2px solid #3b82f6;
  
  ${Card}:hover & {
    transform: translateY(0);
  }
`;

const QuickViewButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
  
  svg {
    font-size: 1.125rem;
  }
`;

const CategoryBadge = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const StockBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: ${props => props.lowStock ? 
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 
    'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '${props => props.lowStock ? '⚠️' : '✓'}';
    font-size: 0.875rem;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  ${Card}:hover & {
    transform: scale(1.1);
  }
`;

const DiscountBadge = styled.span`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  z-index: 3;
  backdrop-filter: blur(10px);
  animation: pulse 2s ease-in-out infinite;
  
  &::before {
    content: '🔥';
    margin-right: 0.375rem;
    animation: flame 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes flame {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;

  &:hover {
    background: white;
    transform: scale(1.15) rotate(10deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    color: ${props => props.isInWishlist ? '#ef4444' : '#6b7280'};
    fill: ${props => props.isInWishlist ? '#ef4444' : 'none'};
    transition: all 0.3s ease;
    font-size: 1.25rem;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  background: white;
`;

const ProductName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  min-height: 2.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
  
  ${Card}:hover & {
    color: #3b82f6;
  }
`;

const ProductDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
`;

const FeatureHighlights = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FeatureTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #0369a1;
  
  svg {
    font-size: 0.875rem;
  }
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
`;

const CurrentPrice = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  color: #059669;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
  font-weight: 500;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 6px;
  width: fit-content;
`;

const Stars = styled.span`
  color: #fbbf24;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 2px;
`;

const RatingText = styled.span`
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
  margin-left: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    font-size: 1.125rem;
  }
`;

const ViewDetailsButton = styled(Link)`
  flex: 1;
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: white;
    border-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    
    &::before {
      width: 100%;
    }
  }
  
  svg {
    font-size: 1.125rem;
  }
`;

const StockStatus = styled.div`
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  
  ${props => props.inStock ? `
    color: #10b981;
  ` : `
    color: #ef4444;
  `}
`;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const discount = calculateDiscount(product.originalPrice, product.price);
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    try {
      await addToCart(product._id || product.id, 1);
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('Please login to add items to wishlist');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  return (
    <Card
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/product/${product._id}`}>
        <ImageContainer>
          <ProductImage 
            src={getImageUrl(product.images?.[0])} 
            alt={product.name}
            onError={(e) => handleImageError(e, 'product')}
          />
          
          {/* Stock Badge */}
          {product.stock > 0 && (
            <StockBadge lowStock={product.stock <= 5}>
              {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
            </StockBadge>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && !product.stock <= 5 && (
            <DiscountBadge>{discount}% OFF</DiscountBadge>
          )}
          
          {/* Category Badge */}
          {product.category && (
            <CategoryBadge>
              {product.category.replace('-', ' ')}
            </CategoryBadge>
          )}
          
          {/* Wishlist Button */}
          <WishlistButton
            onClick={handleWishlistToggle}
            isInWishlist={inWishlist}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart />
          </WishlistButton>
          
          {/* Quick View Overlay */}
          <QuickViewOverlay>
            <QuickViewButton onClick={(e) => {
              e.preventDefault();
              navigate(`/product/${product._id}`);
            }}>
              <FiStar />
              Quick View
            </QuickViewButton>
          </QuickViewOverlay>
        </ImageContainer>
      </Link>

      <CardContent>
        <Link to={`/product/${product._id}`}>
          <ProductName>{product.name}</ProductName>
        </Link>
        
        <ProductDescription>
          {product.description?.substring(0, 100) || 'Premium water purification system'}
        </ProductDescription>
        
        {/* Feature Highlights */}
        <FeatureHighlights>
          {product.features?.slice(0, 2).map((feature, index) => (
            <FeatureTag key={index}>
              <FiStar />
              {feature.length > 15 ? feature.substring(0, 15) + '...' : feature}
            </FeatureTag>
          ))}
        </FeatureHighlights>

        <StockStatus inStock={product.stock > 0}>
          {product.stock > 0 ? 
            `${product.stock} in stock` : 
            'Out of stock'
          }
        </StockStatus>

        <RatingContainer>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              filled={star <= Math.floor(product.rating?.average || 0)}
            />
          ))}
          <RatingText>
            ({product.rating?.count || 0})
          </RatingText>
        </RatingContainer>

        <PriceContainer>
          <CurrentPrice>{formatCurrency(product.price)}</CurrentPrice>
          {product.originalPrice && product.originalPrice > product.price && (
            <OriginalPrice>{formatCurrency(product.originalPrice)}</OriginalPrice>
          )}
        </PriceContainer>

        <ButtonGroup>
          <AddToCartButton
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <FiShoppingCart />
            Add to Cart
          </AddToCartButton>
          <ViewDetailsButton to={`/product/${product._id}`}>
            View Details
          </ViewDetailsButton>
        </ButtonGroup>
      </CardContent>
    </Card>
  );
};

export default ProductCard;