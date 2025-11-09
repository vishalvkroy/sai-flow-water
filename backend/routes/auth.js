const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email')
];

const changePasswordValidation = [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please include a valid email')
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/register', registerValidation, handleValidationErrors, registerUser);
router.post('/login', loginValidation, handleValidationErrors, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, handleValidationErrors, updateProfile);
router.put('/change-password', protect, changePasswordValidation, handleValidationErrors, changePassword);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, handleValidationErrors, resetPassword);

module.exports = router;