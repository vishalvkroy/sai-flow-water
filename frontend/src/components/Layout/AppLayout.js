import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // Check if current path is a seller page
  const isSellerPage = location.pathname.startsWith('/seller') || 
                      location.pathname === '/seller-dashboard' ||
                      location.pathname === '/seller-login';
  
  return (
    <>
      {/* Only show main navbar on non-seller pages */}
      {!isSellerPage && <Navbar />}
      
      <main style={{ minHeight: isSellerPage ? '100vh' : '80vh' }}>
        {children}
      </main>
      
      {/* Only show footer on non-seller pages */}
      {!isSellerPage && <Footer />}
    </>
  );
};

export default AppLayout;
