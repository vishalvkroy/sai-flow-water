const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      
      // Handle specific JWT errors
      let message = 'Not authorized, token failed';
      if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token format';
      } else if (error.name === 'TokenExpiredError') {
        message = 'Token expired';
      }
      
      return res.status(401).json({
        success: false,
        message
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Professional error message based on attempted access
      let message = 'Access denied. Invalid credentials or insufficient permissions.';
      
      // If customer trying to access seller/admin routes
      if (req.user.role === 'customer' && (roles.includes('seller') || roles.includes('admin'))) {
        message = 'Access denied. You do not have the required permissions to access this resource. Please contact support if you believe this is an error.';
      }
      // If seller trying to access admin routes
      else if (req.user.role === 'seller' && roles.includes('admin') && !roles.includes('seller')) {
        message = 'Access denied. Administrator privileges required.';
      }
      
      return res.status(403).json({
        success: false,
        message: message,
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    next();
  };
};

// Optional auth (doesn't throw error if no token)
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without user if token is invalid
      console.error('Optional auth error:', error);
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};