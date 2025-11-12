import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiClock, FiAward } from 'react-icons/fi';

// Components
import ProductGrid from '../components/Product/ProductGrid';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

// Utils
import { productsAPI } from '../utils/api';
import { handleApiError } from '../utils/errorHandler';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/hero-bg.jpg') center/cover;
  opacity: 0.1;
`;

const HeroContent = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.3rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButton = styled(motion(Link))`
  display: inline-block;
  background: #ff6b6b;
  color: white;
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  }
`;

const FeaturesSection = styled.section`
  padding: 80px 0;
  background: #f8fafc;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2.5rem 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 2rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
`;

const FeatureDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
`;

const ProductsSection = styled.section`
  padding: 80px 0;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const ViewAllButton = styled(Link)`
  display: inline-block;
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const StatsSection = styled.section`
  padding: 60px 0;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
`;

const StatItem = styled(motion.div)`
  padding: 2rem 1rem;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.2rem;
  opacity: 0.9;
`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getFeaturedProducts();
      if (response.data.success) {
        setFeaturedProducts(response.data.data);
      }
    } catch (error) {
      // Use professional error handling but don't show toast for this
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
      
      // Only show error if it's not a network issue (server might be starting)
      if (error.response && error.response.status !== 404) {
        handleApiError(error, 'Unable to load featured products');
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <FiTruck />,
      title: 'Free Installation',
      description: 'Professional installation services across Aurangabad and 50km radius by our certified technicians.'
    },
    {
      icon: <FiShield />,
      title: '1 Year Warranty & 5 Years Free Service',
      description: 'Get 1 year comprehensive warranty plus 5 years of free service on all our water filtration systems.'
    },
    {
      icon: <FiClock />,
      title: 'Local Support',
      description: 'Dedicated local support and quick repair services throughout Aurangabad, Bihar region.'
    },
    {
      icon: <FiAward />,
      title: 'Certified Quality',
      description: 'All our products meet international quality standards and are certified for safety.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Happy Customers' },
    { number: '50km', label: 'Service Radius' },
    { number: '24/7', label: 'Support Available' },
    { number: '10+', label: 'Years Experience' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <HeroSection>
        <HeroBackground />
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Pure Water Solutions for Aurangabad
          </HeroTitle>
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Sai Flow Water brings you premium RO water purifiers and comprehensive 
            water solutions in Aurangabad, Bihar. Professional installation, repair, 
            and maintenance services within 50km radius.
          </HeroSubtitle>
          <CTAButton
            to="/products"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now
          </CTAButton>
        </HeroContent>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <div className="container">
          <SectionTitle>Why Choose Sai Flow Water?</SectionTitle>
          <SectionSubtitle>
            Premium water purifier service provider in Aurangabad, Bihar with professional installation and maintenance
          </SectionSubtitle>
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </div>
      </FeaturesSection>

      {/* Featured Products Section */}
      <ProductsSection>
        <div className="container">
          <SectionHeader>
            <SectionTitle>Featured Products</SectionTitle>
            <SectionSubtitle>
              Discover our best-selling water filtration systems
            </SectionSubtitle>
          </SectionHeader>

          {loading ? (
            <LoadingSpinner text="Loading featured products..." />
          ) : (
            <>
              <ProductGrid products={featuredProducts} />
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <ViewAllButton to="/products">
                  View All Products
                </ViewAllButton>
              </div>
            </>
          )}
        </div>
      </ProductsSection>

      {/* Stats Section */}
      <StatsSection>
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatItem>
          ))}
        </StatsGrid>
      </StatsSection>
    </div>
  );
};

export default Home;