import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiBarChart2, 
  FiSettings, 
  FiUser, 
  FiLogOut,
  FiBell,
  FiSearch,
  FiMenu,
  FiX,
  FiTool,
  FiPhone
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../utils/api';
import { io } from 'socket.io-client';

const NavbarContainer = styled.nav`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  width: 100%;
  overflow: visible;
`;

const NavbarContent = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  height: 75px;
  gap: 2rem;
  position: relative;
  
  @media (max-width: 1200px) {
    padding: 0 1.5rem;
    height: 70px;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 65px;
    gap: 1rem;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
  white-space: nowrap;
  z-index: 10;
  min-width: fit-content;
  
  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
    transition: transform 0.3s ease;
  }
  
  &:hover .logo-icon {
    transform: scale(1.05) rotate(5deg);
  }
  
  .logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }
  
  .logo-title {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  
  .logo-subtitle {
    font-size: 0.65rem;
    opacity: 0.9;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  @media (max-width: 1024px) {
    .logo-text {
      display: none;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  justify-content: flex-start;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  padding: 0.5rem 0;
  margin: 0 1rem;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 0.875rem;
  position: relative;
  white-space: nowrap;
  flex-shrink: 0;
  
  svg {
    font-size: 1.125rem;
    flex-shrink: 0;
  }
  
  span {
    display: inline;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.active {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #06b6d4, transparent);
      border-radius: 2px 2px 0 0;
    }
  }
  
  @media (max-width: 1400px) {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
    gap: 0.375rem;
  }
  
  @media (max-width: 1200px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    
    span {
      display: none;
    }
  }
  
  @media (max-width: 1024px) {
    padding: 0.5rem 0.625rem;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 25px;
  padding: 0.6rem 1.25rem;
  min-width: 180px;
  max-width: 250px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  flex-shrink: 1;
  
  &:focus-within {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    flex-shrink: 0;
    opacity: 0.8;
  }
  
  input {
    background: none;
    border: none;
    color: white;
    outline: none;
    width: 100%;
    margin-left: 0.75rem;
    font-size: 0.9rem;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.65);
    }
  }
  
  @media (max-width: 1300px) {
    min-width: 150px;
    max-width: 200px;
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  font-size: 1.15rem;
  flex-shrink: 0;
  z-index: 1;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .notification-badge {
    position: absolute;
    top: 3px;
    right: 3px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border-radius: 50%;
    min-width: 20px;
    height: 20px;
    padding: 0 4px;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border: 2px solid #1e3a8a;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
    z-index: 1;
  }
`;

const UserMenu = styled.div`
  position: relative;
  z-index: 1100;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.3;
  }
  
  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .user-role {
    font-size: 0.7rem;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    gap: 0;
    
    .user-info {
      display: none;
    }
  }
`;

const UserDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid #e5e7eb;
  min-width: 220px;
  overflow: hidden;
  z-index: 1200;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 1200px) {
    display: flex;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: calc(100vh - 70px);
  overflow-y: auto;
  z-index: 1050;
  
  @media (max-width: 1200px) {
    display: block;
  }
  
  @media (max-width: 1200px) and (min-height: 600px) {
    top: 65px;
    max-height: calc(100vh - 65px);
  }
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SellerNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await notificationsAPI.getNotifications('unread');
        setNotificationCount(response.data.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchNotificationCount();
    
    // Setup Socket.IO for real-time updates
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('new-notification', () => {
      setNotificationCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/seller-dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/seller/products', label: 'Products', icon: FiPackage },
    { path: '/seller/orders', label: 'Orders', icon: FiShoppingCart },
    { path: '/seller/services', label: 'Services', icon: FiTool },
    { path: '/seller/call-requests', label: 'Call Requests', icon: FiPhone },
    { path: '/seller/customers', label: 'Customers', icon: FiUsers },
    { path: '/seller/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/seller/settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/seller-dashboard">
          <img 
            src="/saiflow-logo.jpg" 
            alt="Sai Flow Water" 
            style={{ 
              height: '50px', 
              width: 'auto',
              marginRight: '12px'
            }}
          />
          <div className="logo-text">
            <div className="logo-title">Sai Flow Water</div>
            <div className="logo-subtitle">Seller Portal</div>
          </div>
        </Logo>

        <NavLinks>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? 'active' : ''}
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </NavLinks>

        <RightSection>
          <SearchBar>
            <FiSearch />
            <input
              type="text"
              placeholder="Search products, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>

          <IconButton as={Link} to="/seller/notifications">
            <FiBell />
            {notificationCount > 0 && (
              <div className="notification-badge">{notificationCount}</div>
            )}
          </IconButton>

          <UserMenu>
            <UserButton onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              <div className="avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {user?.name || 'Seller'}
                </div>
                <div className="user-role">
                  Seller Account
                </div>
              </div>
            </UserButton>

            {isUserMenuOpen && (
              <UserDropdown
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DropdownItem 
                  to="/seller/settings" 
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FiUser />
                  Profile Settings
                </DropdownItem>
                <DropdownItem 
                  to="/seller/settings" 
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FiSettings />
                  Account Settings
                </DropdownItem>
                <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#6b7280' }}>
                  {user?.email}
                </div>
                <DropdownButton onClick={handleLogout}>
                  <FiLogOut />
                  Logout
                </DropdownButton>
              </UserDropdown>
            )}
          </UserMenu>

          <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </RightSection>
      </NavbarContent>

      {isMobileMenuOpen && (
        <MobileMenu
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <MobileNavLink
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon />
                {item.label}
              </MobileNavLink>
            );
          })}
        </MobileMenu>
      )}
    </NavbarContainer>
  );
};

export default SellerNavbar;
