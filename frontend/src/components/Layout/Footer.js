import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';

const FooterContainer = styled.footer`
  background: #1f2937;
  color: white;
  padding: 3rem 0 1rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div`
  h3 {
    color: #3b82f6;
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  ul {
    li {
      margin-bottom: 0.5rem;
      
      a {
        color: #d1d5db;
        transition: color 0.3s ease;

        &:hover {
          color: #3b82f6;
        }
      }
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #d1d5db;

  svg {
    color: #3b82f6;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  a {
    color: #d1d5db;
    font-size: 1.5rem;
    transition: color 0.3s ease;

    &:hover {
      color: #3b82f6;
    }
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;

  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #374151;
    border-radius: 0.375rem;
    background: #374151;
    color: white;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }

  button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: #2563eb;
    }
  }
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  border-top: 1px solid #374151;
  padding-top: 1rem;
  text-align: center;
  color: #9ca3af;
`;

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Sai Flow Water</h3>
          <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>
            Premium water purifier and RO service provider in Aurangabad, Bihar. 
            Providing clean, safe, and healthy drinking water solutions with professional 
            installation, repair, and maintenance services within 50km radius.
          </p>
          <SocialLinks>
            <a href="https://facebook.com/saienterprises" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="https://twitter.com/saienterprises" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="https://instagram.com/saienterprises" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FiInstagram />
            </a>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/booking">Services</Link></li>
            <li><Link to="/track-order">Track Order</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Services</h3>
          <ul>
            <li><Link to="/booking?service=installation">Installation</Link></li>
            <li><Link to="/booking?service=repair">Repair Service</Link></li>
            <li><Link to="/booking?service=maintenance">Maintenance</Link></li>
            <li><Link to="/booking?service=filter-replacement">Filter Replacement</Link></li>
            <li><Link to="/booking?service=inspection">Water Inspection</Link></li>
          </ul>
        </FooterSection>

        <FooterSection>
          <h3>Contact Info</h3>
          <ContactInfo>
            <FiMapPin />
            <span>Aurangabad, Bihar (50km Service Area)</span>
          </ContactInfo>
          <ContactInfo>
            <FiPhone />
            <span>+91 8084924834</span>
          </ContactInfo>
          <ContactInfo>
            <FiMail />
            <span>saienterprises8084924834@gmail.com</span>
          </ContactInfo>

          <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Newsletter</h4>
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              required 
            />
            <button type="submit">Subscribe</button>
          </NewsletterForm>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2024 Sai Flow Water. All rights reserved.</p>
          <Link 
            to="/seller-login" 
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-300 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:border-blue-500"
          >
            <FiUser className="text-sm" />
            <span className="text-sm font-medium">Seller Login</span>
          </Link>
        </div>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;