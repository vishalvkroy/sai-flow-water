import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { FiUser, FiShoppingCart, FiHeart, FiMenu, FiX, FiSearch } from 'react-icons/fi';

const NavbarContainer = styled.nav`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #2563eb;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #e5e7eb;
  }
`;

const NavLink = styled(Link)`
  color: #374151;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;

  &:hover {
    color: #3b82f6;
  }

  &.active {
    color: #3b82f6;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      right: 0;
      height: 2px;
      background: #3b82f6;
    }
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #374151;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: #f3f4f6;
    color: #3b82f6;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  min-width: 200px;
  z-index: 1000;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  color: #374151;
  transition: all 0.3s ease;

  &:hover {
    background: #f3f4f6;
    color: #3b82f6;
  }
`;

const DropdownButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  color: #374151;
  background: none;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background: #f3f4f6;
    color: #3b82f6;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #374151;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-right: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 250px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartItemsCount = totalItems || 0;
  const wishlistCount = wishlist?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <NavbarContainer>
      <NavContent>
        <Logo to="/">
          <img 
            src="/saiflow-logo.jpg" 
            alt="Sai Flow Water" 
            style={{ 
              height: '60px', 
              width: 'auto',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          />
        </Logo>

        <NavLinks isOpen={isMenuOpen}>
          <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/products" onClick={() => setIsMenuOpen(false)}>
            Products
          </NavLink>
          <NavLink to="/service-booking" onClick={() => setIsMenuOpen(false)}>
            Services
          </NavLink>
          <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>
            Contact
          </NavLink>
        </NavLinks>

        <NavActions>
          <SearchContainer>
            <form onSubmit={handleSearch}>
              <SearchInput
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon />
            </form>
          </SearchContainer>

          <IconButton onClick={() => navigate('/wishlist')} title="Wishlist">
            <FiHeart />
            {wishlistCount > 0 && <CartBadge>{wishlistCount}</CartBadge>}
          </IconButton>

          <IconButton onClick={() => navigate('/cart')} title="Cart">
            <FiShoppingCart />
            {cartItemsCount > 0 && <CartBadge>{cartItemsCount}</CartBadge>}
          </IconButton>

          {isAuthenticated ? (
            <UserMenu>
              <IconButton onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <FiUser />
              </IconButton>
              
              {isUserMenuOpen && (
                <UserDropdown
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <DropdownItem 
                    to="/profile" 
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </DropdownItem>
                  <DropdownItem 
                    to="/dashboard" 
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Dashboard
                  </DropdownItem>
                  <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#6b7280' }}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <DropdownButton onClick={handleLogout}>
                    Logout
                  </DropdownButton>
                </UserDropdown>
              )}
            </UserMenu>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </NavActions>
      </NavContent>
    </NavbarContainer>
  );
};

export default Navbar;