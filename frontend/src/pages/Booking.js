import React from 'react';
import styled from 'styled-components';
import { FiTool, FiPhone } from 'react-icons/fi';

const BookingContainer = styled.div`
  min-height: 80vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const BookingHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
  }
  
  p {
    color: #6b7280;
    font-size: 1.1rem;
  }
`;

const ServiceInfo = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  .service-icon {
    font-size: 5rem;
    color: #3b82f6;
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #374151;
    margin-bottom: 1rem;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .contact-info {
    background: #f0f9ff;
    border: 1px solid #0ea5e9;
    border-radius: 1rem;
    padding: 2rem;
    margin-top: 2rem;
    
    h3 {
      color: #0c4a6e;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .phone {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 0.5rem;
    }
    
    .email {
      color: #075985;
      font-weight: 500;
    }
  }
`;

const Booking = () => {
  return (
    <BookingContainer>
      <BookingHeader>
        <h1>Service Booking</h1>
        <p>Professional water purifier services in Aurangabad, Bihar</p>
      </BookingHeader>
      
      <ServiceInfo>
        <FiTool className="service-icon" />
        <h2>Book Your Service</h2>
        <p>
          We provide professional installation, repair, and maintenance services for all types of water purifiers 
          and RO systems in Aurangabad, Bihar and surrounding areas within 50km radius.
        </p>
        
        <div className="contact-info">
          <h3>
            <FiPhone />
            Contact Us Directly
          </h3>
          <div className="phone">+91 8084924834</div>
          <div className="email">saienterprises8084924834@gmail.com</div>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            Call us to schedule your service appointment. Our technicians are available for same-day service in most areas.
          </p>
        </div>
      </ServiceInfo>
    </BookingContainer>
  );
};

export default Booking;