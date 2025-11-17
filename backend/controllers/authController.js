const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const { generateRandomString } = require('../utils/helpers');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    console.log('📝 Registration attempt:', { name, email, phone, hasPassword: !!password, hasAddress: !!address });

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and phone'
      });
    }

    // Validate email format and domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Registration failed: Invalid email format -', email);
      return res.status(400).json({
        success: false,
        message: 'Wrong email! Please enter a valid email address.',
        field: 'email'
      });
    }

    // Check if email domain is valid (common providers)
    const emailDomain = email.toLowerCase().split('@')[1];
    const validDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
      'icloud.com', 'protonmail.com', 'zoho.com', 'aol.com',
      'mail.com', 'yandex.com', 'gmx.com', 'live.com',
      'rediffmail.com', 'yahoo.co.in', 'outlook.in'
    ];
    
    // Check if it's a common email provider or has valid TLD
    const hasValidTLD = emailDomain.endsWith('.com') || emailDomain.endsWith('.in') || 
                        emailDomain.endsWith('.org') || emailDomain.endsWith('.net') ||
                        emailDomain.endsWith('.edu') || emailDomain.endsWith('.co.in');
    
    if (!validDomains.includes(emailDomain) && !hasValidTLD) {
      console.log('❌ Registration failed: Invalid email domain -', emailDomain);
      return res.status(400).json({
        success: false,
        message: 'Wrong email! This email address does not appear to be valid. Please use a valid email like Gmail, Yahoo, or Outlook.',
        field: 'email'
      });
    }

    // Validate phone number format (Indian mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[\s\-\+()]/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      console.log('❌ Registration failed: Invalid phone number -', phone);
      return res.status(400).json({
        success: false,
        message: 'Wrong phone number! Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
        field: 'phone'
      });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      console.log('❌ Registration failed: Email already registered -', email);
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Please use a different email or login to your account.',
        field: 'email'
      });
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({ phone: phone.trim() });
    if (phoneExists) {
      console.log('❌ Registration failed: Phone number already registered -', phone);
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered. Please use a different phone number or login to your account.',
        field: 'phone'
      });
    }

    // Validate and enrich address if location data is provided
    let enrichedAddress = address;
    if (address) {
      try {
        const locationService = require('../services/locationService');
        enrichedAddress = await locationService.validateAndEnrichAddress(address);
        console.log('✅ Address enriched with location data');
      } catch (locError) {
        console.warn('⚠️ Address enrichment failed, using provided data:', locError.message);
        enrichedAddress = address;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address: enrichedAddress
    });

    if (user) {
      const token = generateToken(user._id);

      console.log('✅ User registered successfully:', user.email);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          token
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    // Handle duplicate key errors (MongoDB unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'This information is already registered.';
      
      if (field === 'email') {
        message = 'This email is already registered. Please use a different email or login to your account.';
      } else if (field === 'phone') {
        message = 'This phone number is already registered. Please use a different phone number or login to your account.';
      }
      
      console.log(`❌ Duplicate ${field} detected:`, error.keyValue[field]);
      
      return res.status(400).json({
        success: false,
        message: message,
        field: field
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ User found:', email, '- Role:', user.role);

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    console.log('🔑 Password match:', isPasswordMatch);

    if (isPasswordMatch) {
      if (!user.isActive) {
        console.log('❌ Account deactivated:', email);
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      const token = generateToken(user._id);

      console.log('✅ Login successful for:', email);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar
        },
        token
      });
    } else {
      console.log('❌ Invalid password for:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          address: updatedUser.address
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(`🔐 Password reset requested for: ${email}`);

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    console.log(`✅ User found: ${user.email}`);

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    console.log(`🔑 Generated reset token`);

    // Hash token and save to user
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire time (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });
    
    console.log(`💾 Token saved to database`);

    // Create reset URL
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
    
    console.log(`🔗 Reset URL created: ${resetUrl}`);

    // Send email using the enhanced email service
    try {
      const emailTemplate = emailTemplates.passwordReset(user, resetToken);
      
      await sendEmail({
        email: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });

      console.log(`✅ Password reset email sent successfully to: ${email}`);
      return res.json({
        success: true,
        message: 'Password reset email sent successfully. Please check your inbox.'
      });
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      
      // Reset token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // Provide more detailed error message
      let errorMessage = 'Failed to send reset email. Please try again later.';
      if (emailError.message.includes('getaddrinfo ENOTFOUND')) {
        errorMessage = 'Email server is not reachable. Please check your internet connection.';
      } else if (emailError.message.includes('Invalid login')) {
        errorMessage = 'Email authentication failed. Please check your email configuration.';
      }

      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset request',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log(`🔐 Password reset attempt`);
    console.log(`Token received: ${token ? 'Yes' : 'No'}`);
    console.log(`Password received: ${password ? 'Yes' : 'No'}`);
    console.log(`Password length: ${password?.length || 0}`);

    if (!password || password.length < 6) {
      console.log(`❌ Password validation failed: ${password?.length || 0} characters`);
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token from URL to match with database
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log(`🔍 Looking for user with hashed token...`);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log(`❌ Invalid or expired reset token`);
      console.log(`Token hash: ${resetPasswordToken.substring(0, 20)}...`);
      console.log(`Current time: ${Date.now()}`);
      
      // Check if token exists but expired
      const expiredUser = await User.findOne({ resetPasswordToken });
      if (expiredUser) {
        console.log(`⏰ Token found but expired. Expiry was: ${expiredUser.resetPasswordExpire}`);
      } else {
        console.log(`🔍 No user found with this token at all`);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.'
      });
    }

    console.log(`✅ Valid reset token for user: ${user.email}`);

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log(`✅ Password reset successfully for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};