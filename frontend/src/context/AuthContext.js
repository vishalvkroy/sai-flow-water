import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { handleApiError, showSuccess, showInfo } from '../utils/errorHandler';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setToken(token);
        try {
          // Verify token and get user data
          const response = await authAPI.getMe();
          if (response.data.success) {
            setUser(response.data.data);
            console.log('User authenticated:', response.data.data);
          }
        } catch (error) {
          console.log('Token verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      
      console.log('📥 Login response:', response.data);
      
      if (response.data.success) {
        const { data, token } = response.data;
        setUser(data);
        setToken(token);
        localStorage.setItem('token', token);
        showSuccess(`Welcome back, ${data.name}!`);
        console.log('✅ Login successful:', data);
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      }
      
      const errorInfo = handleApiError(error, errorMessage);
      return { success: false, message: errorInfo.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registering user with data:', userData);
      
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { data, token } = response.data;
        
        // Don't auto-login, just show success
        showSuccess('Registration successful! Please login to continue.');
        
        console.log('✅ Registration successful:', data.name);
        
        return { 
          success: true, 
          message: 'Registration successful! Redirecting to login...',
          shouldRedirectToLogin: true 
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract validation errors if present
      let errorMessage = 'Registration failed. Please try again.';
      let errorField = null;
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map(err => err.message || err).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        errorField = error.response.data.field; // Get the specific field (email or phone)
      }
      
      return { 
        success: false, 
        message: errorMessage,
        field: errorField
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    showInfo('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.data.success) {
        setUser(response.data.data);
        showSuccess('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const errorInfo = handleApiError(error, 'Profile update failed');
      return { success: false, message: errorInfo.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      
      if (response.data.success) {
        showSuccess('Password changed successfully!');
        return { success: true };
      }
    } catch (error) {
      const errorInfo = handleApiError(error, 'Password change failed');
      return { success: false, message: errorInfo.message };
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};