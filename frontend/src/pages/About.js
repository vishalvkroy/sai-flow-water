import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiDroplet, 
  FiAward, 
  FiUsers, 
  FiTrendingUp, 
  FiShield, 
  FiCheckCircle,
  FiTarget,
  FiHeart,
  FiZap
} from 'react-icons/fi';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0 60px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/water-pattern.svg') center/cover;
    opacity: 0.1;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0 20px;
  }
`;

const ContentSection = styled.section`
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 0 20px 80px;
  position: relative;
  z-index: 1;
`;

const StoryCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #667eea;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Paragraph = styled.p`
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 1rem;
  font-size: 1.05rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1rem;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ValueCard = styled(motion.div)`
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
  border-radius: 1rem;
  padding: 2rem;
  border: 2px solid #e0e7ff;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
  }
`;

const ValueIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const ValueTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const ValueDescription = styled.p`
  color: #4b5563;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ServiceItem = styled(motion.div)`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border-left: 4px solid #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
`;

const ServiceTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #667eea;
  }
`;

const ServiceDescription = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const TeamSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-top: 3rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const TeamDescription = styled.p`
  color: #4b5563;
  line-height: 1.8;
  margin: 1.5rem auto;
  max-width: 800px;
  font-size: 1.05rem;
`;

const About = () => {
  const stats = [
    { icon: <FiUsers />, number: '500+', label: 'Happy Customers' },
    { icon: <FiAward />, number: '10+', label: 'Years Experience' },
    { icon: <FiDroplet />, number: '1000+', label: 'Installations' },
    { icon: <FiTrendingUp />, number: '98%', label: 'Satisfaction Rate' }
  ];

  const values = [
    {
      icon: <FiShield />,
      title: 'Quality Assurance',
      description: 'We provide only certified and tested water purification systems that meet international quality standards.'
    },
    {
      icon: <FiHeart />,
      title: 'Customer First',
      description: 'Your health and satisfaction are our top priorities. We go the extra mile to ensure you get the best service.'
    },
    {
      icon: <FiZap />,
      title: 'Quick Service',
      description: 'Fast installation and prompt repair services within 50km radius of Aurangabad, Bihar.'
    },
    {
      icon: <FiTarget />,
      title: 'Expert Team',
      description: 'Our certified technicians have years of experience in water purification systems and maintenance.'
    }
  ];

  const services = [
    { title: 'RO Installation', description: 'Professional installation of all types of RO water purifiers' },
    { title: 'Repair & Maintenance', description: 'Quick and reliable repair services for all brands' },
    { title: 'Filter Replacement', description: 'Genuine filters and timely replacement services' },
    { title: 'Water Testing', description: 'Free water quality testing and consultation' },
    { title: 'AMC Services', description: 'Annual maintenance contracts for hassle-free service' },
    { title: 'Emergency Support', description: '24/7 customer support for urgent issues' }
  ];

  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About Sai Flow Water
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Your trusted partner for clean, safe, and healthy drinking water solutions in Aurangabad, Bihar
        </HeroSubtitle>
      </HeroSection>

      <ContentSection>
        <StoryCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>
            <FiDroplet />
            Our Story
          </SectionTitle>
          <Paragraph>
            Sai Flow Water was founded with a simple yet powerful mission: to provide every household in 
            Aurangabad, Bihar with access to clean, safe, and healthy drinking water. We understand that 
            water is the foundation of good health, and we're committed to ensuring that families have 
            access to the best water purification solutions.
          </Paragraph>
          <Paragraph>
            Starting as a small service provider, we've grown into a trusted name in the region, serving 
            over 500 satisfied customers across a 50km radius. Our journey has been driven by our 
            commitment to quality, customer satisfaction, and continuous innovation in water purification 
            technology.
          </Paragraph>
          <Paragraph>
            Today, we're proud to offer a comprehensive range of services including RO installation, 
            repair, maintenance, and water quality testing. Our team of certified technicians brings 
            years of experience and expertise to every job, ensuring that your water purification system 
            operates at peak performance.
          </Paragraph>
        </StoryCard>

        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatIcon>{stat.icon}</StatIcon>
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

        <StoryCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>
            <FiHeart />
            Our Core Values
          </SectionTitle>
          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ValueIcon>{value.icon}</ValueIcon>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueDescription>{value.description}</ValueDescription>
              </ValueCard>
            ))}
          </ValuesGrid>
        </StoryCard>

        <StoryCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>
            <FiCheckCircle />
            What We Offer
          </SectionTitle>
          <ServicesGrid>
            {services.map((service, index) => (
              <ServiceItem
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ServiceTitle>
                  <FiCheckCircle />
                  {service.title}
                </ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
              </ServiceItem>
            ))}
          </ServicesGrid>
        </StoryCard>

        <TeamSection>
          <SectionTitle style={{ justifyContent: 'center' }}>
            <FiUsers />
            Our Commitment
          </SectionTitle>
          <TeamDescription>
            At Sai Flow Water, we believe that access to clean water is a fundamental right. Our team 
            of dedicated professionals works tirelessly to ensure that every customer receives not just 
            a product, but a complete water purification solution tailored to their specific needs.
          </TeamDescription>
          <TeamDescription>
            We stay updated with the latest technologies in water purification and continuously train 
            our technicians to provide the best service possible. Whether it's a new installation, 
            routine maintenance, or emergency repair, we're here to serve you with professionalism 
            and care.
          </TeamDescription>
          <TeamDescription>
            Thank you for trusting Sai Flow Water with your family's health and well-being. We look 
            forward to serving you and being your partner in ensuring clean, safe drinking water for 
            years to come.
          </TeamDescription>
        </TeamSection>
      </ContentSection>
    </PageContainer>
  );
};

export default About;
