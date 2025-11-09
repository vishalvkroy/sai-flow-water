import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 2rem;
    color: #1f2937;
    margin-bottom: 10px;
  }

  p {
    color: #6b7280;
    font-size: 0.95rem;
  }
`;

const Icon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  
  svg {
    font-size: 2.5rem;
    color: white;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .icon-left {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 1.2rem;
    }

    .icon-right {
      position: absolute;
      right: 12px;
      color: #9ca3af;
      font-size: 1.2rem;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #667eea;
      }
    }

    input {
      width: 100%;
      padding: 12px 45px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }
  }
`;

const PasswordStrength = styled.div`
  margin-top: -10px;
  
  .strength-bar {
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 8px;

    .strength-fill {
      height: 100%;
      transition: all 0.3s;
      background: ${props => {
        if (props.strength === 'weak') return '#ef4444';
        if (props.strength === 'medium') return '#f59e0b';
        if (props.strength === 'strong') return '#10b981';
        return '#e5e7eb';
      }};
      width: ${props => {
        if (props.strength === 'weak') return '33%';
        if (props.strength === 'medium') return '66%';
        if (props.strength === 'strong') return '100%';
        return '0%';
      }};
    }
  }

  .strength-text {
    font-size: 0.85rem;
    color: ${props => {
      if (props.strength === 'weak') return '#ef4444';
      if (props.strength === 'medium') return '#f59e0b';
      if (props.strength === 'strong') return '#10b981';
      return '#6b7280';
    }};
    font-weight: 600;
  }
`;

const Button = styled(motion.button)`
  padding: 14px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  justify-content: center;
  margin-top: 20px;
  transition: all 0.2s;

  &:hover {
    color: #764ba2;
    gap: 12px;
  }

  svg {
    font-size: 1.2rem;
  }
`;

const SuccessMessage = styled(motion.div)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;

  .icon {
    font-size: 3rem;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }

  p {
    font-size: 0.95rem;
    opacity: 0.9;
  }
`;

const InfoBox = styled.div`
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;

  p {
    margin: 0;
    color: #1e40af;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (pwd) => {
    if (pwd.length === 0) return '';
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 10) return 'medium';
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong';
    return 'medium';
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔐 Sending password reset request...');
      console.log('Token:', token);
      console.log('Password length:', password.length);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      console.log('Request URL:', `${API_URL}/auth/reset-password/${token}`);
      console.log('Request body:', { password: '***' });
      
      const response = await axios.put(
        `${API_URL}/auth/reset-password/${token}`,
        { password }
      );

      if (response.data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(validationErrors);
        console.error('Validation errors:', validationErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!success ? (
          <>
            <Icon>
              <FiLock />
            </Icon>

            <Header>
              <h1>Reset Password</h1>
              <p>Enter your new password below</p>
            </Header>

            <InfoBox>
              <p>
                <strong>🔒 Password Requirements:</strong><br />
                • At least 6 characters long<br />
                • Use a mix of letters, numbers, and symbols<br />
                • Avoid common words or patterns
              </p>
            </InfoBox>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>New Password</label>
                <div className="input-wrapper">
                  <FiLock className="icon-left" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <div
                    className="icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
                {password && (
                  <PasswordStrength strength={passwordStrength}>
                    <div className="strength-bar">
                      <div className="strength-fill"></div>
                    </div>
                    <div className="strength-text">
                      {passwordStrength === 'weak' && 'Weak password'}
                      {passwordStrength === 'medium' && 'Medium strength'}
                      {passwordStrength === 'strong' && 'Strong password'}
                    </div>
                  </PasswordStrength>
                )}
              </FormGroup>

              <FormGroup>
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="icon-left" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <div
                    className="icon-right"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                    Passwords do not match
                  </span>
                )}
              </FormGroup>

              <Button
                type="submit"
                disabled={loading || password !== confirmPassword}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form>

            <BackLink to="/login">
              <FiArrowLeft />
              Back to Login
            </BackLink>
          </>
        ) : (
          <>
            <SuccessMessage
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="icon">
                <FiCheckCircle />
              </div>
              <h3>Password Reset Successfully!</h3>
              <p>
                You can now login with your new password
              </p>
            </SuccessMessage>

            <InfoBox>
              <p>
                <strong>✅ What's next:</strong><br />
                Redirecting you to login page in 3 seconds...
              </p>
            </InfoBox>

            <Button
              onClick={() => navigate('/login')}
              whileTap={{ scale: 0.98 }}
            >
              Go to Login Now
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
};

export default ResetPassword;
