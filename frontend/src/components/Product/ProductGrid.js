import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';
import { useCart } from '../../contexts/CartContext';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(59, 130, 246, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 280px;
  overflow: hidden;
  position: relative;
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
  
  ${ProductCard}:hover &::after {
    opacity: 1;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${ProductCard}:hover & img {
    transform: scale(1.15);
  }

  .placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    opacity: 0.3;
  }
`;

const ProductInfo = styled.div`
  padding: 1.75rem;
  background: white;
`;

const ProductTitle = styled.h3`
  font-size: 1.25rem;
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
  
  ${ProductCard}:hover & {
    color: #3b82f6;
  }
`;

const ProductDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
`;

const ProductPrice = styled.div`
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.25rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  width: fit-content;
  
  span {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &.primary {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }
  }

  &.secondary {
    background: #f3f4f6;
    color: #374151;

    &:hover {
      background: #e5e7eb;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;

  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #374151;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const ProductGrid = ({ products = [] }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Sample products if none provided
  const sampleProducts = [
    {
      id: 1,
      name: 'RO Water Purifier 7L',
      description: 'Advanced RO technology with 7-stage purification process',
      price: '₹12,999',
      image: null
    },
    {
      id: 2,
      name: 'UV Water Filter 10L',
      description: 'UV sterilization with activated carbon filter',
      price: '₹8,999',
      image: null
    },
    {
      id: 3,
      name: 'Alkaline Water Purifier',
      description: 'Alkaline water with essential minerals retention',
      price: '₹15,999',
      image: null
    }
  ];

  const displayProducts = products.length > 0 ? products : sampleProducts;

  if (displayProducts.length === 0) {
    return (
      <EmptyState>
        <div className="icon">💧</div>
        <h3>No Products Available</h3>
        <p>We're currently updating our product catalog. Please check back soon!</p>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      {displayProducts.map((product, index) => (
        <ProductCard
          key={product._id || index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <ProductImage>
            {product.images && product.images.length > 0 ? (
              <img 
                src={getImageUrl(product.images[0])} 
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = 'https://via.placeholder.com/400x400/e5e7eb/6b7280?text=Product+Image';
                }}
              />
            ) : (
              <img 
                src="https://via.placeholder.com/400x400/e5e7eb/6b7280?text=No+Image"
                alt={product.name}
              />
            )}
          </ProductImage>
          <ProductInfo>
            <ProductTitle>{product.name}</ProductTitle>
            <ProductDescription>
              {product.description || 'High-quality water purification system for your home'}
            </ProductDescription>
            <ProductPrice><span>₹{product.price?.toLocaleString('en-IN') || 0}</span></ProductPrice>
            
            <ProductActions>
              <ActionButton className="secondary" as={Link} to={`/product/${product._id}`}>
                <FiEye />
                View Details
              </ActionButton>
              <ActionButton 
                className="primary"
                onClick={() => handleAddToCart(product)}
              >
                <FiShoppingCart />
                Add to Cart
              </ActionButton>
            </ProductActions>
          </ProductInfo>
        </ProductCard>
      ))}
    </GridContainer>
  );
};

export default ProductGrid;