import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Role-based Protected Route Component
 * Restricts access based on user role
 */
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Show professional error message if user tries to access unauthorized route
    if (!loading && user && !allowedRoles.includes(user.role)) {
      toast.error('🔒 Access Denied: You do not have permission to access this page.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '600'
        }
      });
    }
  }, [user, loading, allowedRoles]);

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    toast.error('Please login to access this page', {
      duration: 3000,
      icon: '🔐'
    });
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    // Professional error handling
    const roleNames = {
      'customer': 'Customer',
      'seller': 'Seller',
      'admin': 'Administrator'
    };

    const requiredRoles = allowedRoles.map(role => roleNames[role] || role).join(' or ');
    
    console.error(`Access denied: User role "${user.role}" not in allowed roles:`, allowedRoles);
    
    // Redirect based on user role
    if (user.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'seller') {
      return <Navigate to="/seller-dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    
    // Fallback to home
    return <Navigate to="/" replace />;
  }

  // User has correct role - render children
  return children;
};

export default RoleProtectedRoute;
