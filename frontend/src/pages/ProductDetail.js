import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield, FiArrowLeft, FiZap } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Components
import ReviewSection from '../components/Product/ReviewSection';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

// Context
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

// Utils
import { productsAPI } from '../utils/api';
import { formatCurrency, calculateDiscount, generateStars, getImageUrl } from '../utils/helpers';

const ProductDetailContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
`;

const BackButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(-4px);
  }
`;

const ProductContent = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
  margin-bottom: 4rem;
  background: white;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
  }
`;

const ImageSection = styled.div`
  position: sticky;
  top: 2rem;
  height: fit-content;
`;

const MainImageContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
    pointer-events: none;
  }
`;

const MainImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${MainImageContainer}:hover & {
    transform: scale(1.1);
  }
`;

const ImageBadge = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.875rem;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 2;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
`;

const Thumbnail = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  position: relative;
  width: 100%;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #3b82f6;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  ${props => props.active && `
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 24px;
      background: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ProductHeader = styled.div`
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
`;

const CategoryBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  
  span {
    &:hover {
      color: #3b82f6;
      cursor: pointer;
    }
  }
  
  &::before {
    content: '🏠';
    margin-right: 0.25rem;
  }
`;

const ProductTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const ProductSKU = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #0369a1;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #bae6fd;
  
  &::before {
    content: '📦';
  }
`;

const RatingContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(251, 191, 36, 0.1);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(251, 191, 36, 0.3);
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
  font-size: 1.25rem;
`;

const RatingText = styled.span`
  color: #1f2937;
  font-weight: 700;
  font-size: 1rem;
`;

const ReviewCount = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
`;

const PriceSection = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem;
  border-radius: 16px;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const CurrentPrice = styled.div`
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const OriginalPrice = styled.div`
  font-size: 1.5rem;
  color: #9ca3af;
  text-decoration: line-through;
  font-weight: 600;
`;

const DiscountBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  
  &::before {
    content: '🔥';
    font-size: 1.25rem;
  }
`;

const SavingsText = styled.div`
  color: #059669;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 0.5rem;
  
  &::before {
    content: '💰';
    margin-right: 0.5rem;
  }
`;

const StockBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.inStock ? 
    'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9375rem;
  box-shadow: ${props => props.inStock ? 
    '0 4px 12px rgba(16, 185, 129, 0.3)' : 
    '0 4px 12px rgba(239, 68, 68, 0.3)'};
  margin-top: 1rem;
  
  &::before {
    content: '${props => props.inStock ? '✓' : '✗'}';
    font-size: 1.125rem;
  }
`;

const TrustBadges = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  svg {
    color: #3b82f6;
    font-size: 1.25rem;
  }
`;

const StockStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: ${props => props.inStock ? '#10b981' : '#ef4444'};
  font-weight: 500;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const QuantityLabel = styled.span`
  font-weight: 500;
  color: #374151;
`;

const QuantityInput = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  background: #f3f4f6;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover:not(:disabled) {
    background: #e5e7eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  padding: 0.5rem 1rem;
  min-width: 60px;
  text-align: center;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PrimaryButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SecondaryButtonRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const AddToCartButton = styled(motion.button)`
  flex: 2;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 1.25rem 2.5rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
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
    transition: left 0.6s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    font-size: 1.5rem;
  }
`;

const WishlistButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => prop !== 'isInWishlist'
})`
  flex: 1;
  background: white;
  color: #ef4444;
  border: 3px solid #ef4444;
  padding: 1.25rem;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: #ef4444;
    transition: width 0.3s ease;
    z-index: -1;
  }

  &:hover {
    color: white;
    border-color: #dc2626;
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
    
    &::before {
      width: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
  }
`;

const BuyNowButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    
    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }
  
  svg {
    font-size: 1.25rem;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const CompareButton = styled.button`
  flex: 1;
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;

  svg {
    font-size: 1.25rem;
  }

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  margin-bottom: 2rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: #374151;

    &::before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
    }
  }
`;

const SpecsSection = styled.div`
  margin-bottom: 2rem;
`;

const SpecsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
`;

const SpecLabel = styled.span`
  color: #6b7280;
`;

const SpecValue = styled.span`
  color: #374151;
  font-weight: 500;
`;

const BenefitsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
`;

const BenefitCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
`;

const BenefitIcon = styled.div`
  color: #3b82f6;
  font-size: 1.5rem;
`;

const BenefitText = styled.div`
  font-size: 0.9rem;
  color: #374151;
`;

const TabsSection = styled.div`
  margin-bottom: 3rem;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  background: none;
  border: none;
  padding: 1rem 2rem;
  font-weight: 500;
  color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #3b82f6;
  }
`;

const TabContent = styled.div`
  line-height: 1.7;
  color: #374151;
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchProduct();
    } else {
      toast.error('Invalid product ID');
      navigate('/products');
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getProductById(id);
      if (response.data.success) {
        // Handle both nested and flat response structures
        const productData = response.data.data?.product || response.data.data;
        const relatedData = response.data.data?.relatedProducts || [];
        const reviewsData = response.data.data?.reviews || [];
        
        setProduct(productData);
        setRelatedProducts(relatedData);
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      try {
        await addToCart(product._id || product.id, quantity);
        toast.success(`${product.name} added to cart!`);
      } catch (error) {
        console.error('Add to cart error:', error);
        toast.error('Failed to add item to cart');
      }
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      try {
        // Add product to cart
        await addToCart(product._id || product.id, quantity);
        
        // Show loading toast
        toast.info('Processing...', { autoClose: 1000 });
        
        // Small delay to ensure cart is updated
        setTimeout(() => {
          // Navigate directly to checkout, skipping cart page
          navigate('/checkout', { 
            state: { 
              fromBuyNow: true,
              productId: product._id || product.id,
              quantity: quantity
            }
          });
        }, 500);
      } catch (error) {
        console.error('Buy now error:', error);
        toast.error('Failed to process purchase');
      }
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    const inWishlist = isInWishlist(product._id);
    if (inWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  if (!product) {
    return (
      <ProductDetailContainer>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              marginTop: '1rem',
              cursor: 'pointer'
            }}
          >
            Back to Products
          </button>
        </div>
      </ProductDetailContainer>
    );
  }

  const discount = calculateDiscount(product.originalPrice, product.price);
  const stars = generateStars(product.rating?.average || 0);

  return (
    <ProductDetailContainer>
      <BackButton onClick={() => navigate(-1)}>
        <FiArrowLeft />
        Back to Products
      </BackButton>

      <ProductContent>
        <ImageSection>
          <MainImage
            src={getImageUrl(product.images?.[selectedImage]) || '/default-product.svg'}
            alt={product.name}
            onError={(e) => { e.target.src = '/default-product.svg'; }}
          />
          {product.images && product.images.length > 1 && (
            <ThumbnailGrid>
              {product.images.map((image, index) => (
                <Thumbnail
                  key={index}
                  src={getImageUrl(image)}
                  alt={`${product.name} view ${index + 1}`}
                  active={index === selectedImage}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => { e.target.src = '/default-product.svg'; }}
                />
              ))}
            </ThumbnailGrid>
          )}
        </ImageSection>

        <InfoSection>
          <ProductHeader>
            <ProductTitle>{product.name}</ProductTitle>
            <ProductSKU>SKU: {product.sku}</ProductSKU>
            
            <RatingContainer>
              <Stars>{stars}</Stars>
              <ReviewCount>({product.rating?.count || 0} reviews)</ReviewCount>
            </RatingContainer>

            <PriceContainer>
              <CurrentPrice>{formatCurrency(product.price)}</CurrentPrice>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <OriginalPrice>{formatCurrency(product.originalPrice)}</OriginalPrice>
                  <DiscountBadge>{discount}% OFF</DiscountBadge>
                </>
              )}
            </PriceContainer>

            <StockStatus inStock={product.stock > 0}>
              {product.stock > 0 ? 
                `✓ In Stock (${product.stock} available)` : 
                '✗ Out of Stock'
              }
            </StockStatus>
          </ProductHeader>

          <FeaturesList>
            {product.features?.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </FeaturesList>

          <QuantitySelector>
            <QuantityLabel>Quantity:</QuantityLabel>
            <QuantityInput>
              <QuantityButton
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </QuantityButton>
              <QuantityDisplay>{quantity}</QuantityDisplay>
              <QuantityButton
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                +
              </QuantityButton>
            </QuantityInput>
          </QuantitySelector>

          <ButtonGroup>
            <PrimaryButtonRow>
              <BuyNowButton
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                <FiZap />
                Buy Now
              </BuyNowButton>
              <AddToCartButton
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FiShoppingCart />
                Add to Cart
              </AddToCartButton>
            </PrimaryButtonRow>
            <SecondaryButtonRow>
              <WishlistButton
                onClick={handleWishlistToggle}
                isInWishlist={isInWishlist(product._id)}
                title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart />
                {isInWishlist(product._id) ? 'Saved' : 'Save for Later'}
              </WishlistButton>
            </SecondaryButtonRow>
          </ButtonGroup>

          <BenefitsSection>
            <BenefitCard>
              <BenefitIcon>
                <FiTruck />
              </BenefitIcon>
              <BenefitText>
                {product.shipping?.isFreeShipping 
                  ? 'Free Shipping' 
                  : product.shipping?.shippingCharge 
                    ? `Shipping: ${formatCurrency(product.shipping.shippingCharge)}`
                    : 'Shipping Available'}
              </BenefitText>
            </BenefitCard>
            <BenefitCard>
              <BenefitIcon>
                <FiShield />
              </BenefitIcon>
              <BenefitText>{product.specifications?.warranty || '1 Year Warranty & 5 Years Free Service'}</BenefitText>
            </BenefitCard>
          </BenefitsSection>

          {product.specifications && (
            <SpecsSection>
              <SpecsTitle>Specifications</SpecsTitle>
              <SpecsGrid>
                {product.specifications.filtrationStages && (
                  <SpecItem>
                    <SpecLabel>Filtration Stages</SpecLabel>
                    <SpecValue>{product.specifications.filtrationStages}</SpecValue>
                  </SpecItem>
                )}
                {product.specifications.filterLife && (
                  <SpecItem>
                    <SpecLabel>Filter Life</SpecLabel>
                    <SpecValue>{product.specifications.filterLife}</SpecValue>
                  </SpecItem>
                )}
                {product.specifications.flowRate && (
                  <SpecItem>
                    <SpecLabel>Flow Rate</SpecLabel>
                    <SpecValue>{product.specifications.flowRate}</SpecValue>
                  </SpecItem>
                )}
                {product.specifications.dimensions && (
                  <SpecItem>
                    <SpecLabel>Dimensions</SpecLabel>
                    <SpecValue>{product.specifications.dimensions}</SpecValue>
                  </SpecItem>
                )}
                {product.specifications.warranty && (
                  <SpecItem>
                    <SpecLabel>Warranty</SpecLabel>
                    <SpecValue>{product.specifications.warranty}</SpecValue>
                  </SpecItem>
                )}
                {product.specifications.technology && (
                  <SpecItem>
                    <SpecLabel>Technology</SpecLabel>
                    <SpecValue>{product.specifications.technology}</SpecValue>
                  </SpecItem>
                )}
              </SpecsGrid>
            </SpecsSection>
          )}
        </InfoSection>
      </ProductContent>

      <TabsSection>
        <TabsHeader>
          <Tab
            active={activeTab === 'description'}
            onClick={() => setActiveTab('description')}
          >
            Description
          </Tab>
          <Tab
            active={activeTab === 'specifications'}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </Tab>
          <Tab
            active={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </Tab>
        </TabsHeader>

        <TabContent>
          {activeTab === 'description' && (
            <div>
              <p>{product.description}</p>
            </div>
          )}
          
          {activeTab === 'specifications' && product.specifications && (
            <SpecsGrid>
              {Object.entries(product.specifications).map(([key, value]) => (
                <SpecItem key={key}>
                  <SpecLabel>
                    {key.split(/(?=[A-Z])/).join(' ')}
                  </SpecLabel>
                  <SpecValue>{value}</SpecValue>
                </SpecItem>
              ))}
            </SpecsGrid>
          )}
          
          {activeTab === 'reviews' && (
            <ReviewSection 
              reviews={reviews}
              productId={product._id}
              onReviewAdded={fetchProduct}
            />
          )}
        </TabContent>
      </TabsSection>
    </ProductDetailContainer>
  );
};

export default ProductDetail;