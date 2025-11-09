import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

    svg {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 1.2rem;
    }

    input {
      width: 100%;
      padding: 12px 12px 12px 45px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: #f59e0b;
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }
  }
`;

const Button = styled(motion.button)`
  padding: 14px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
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
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;

  p {
    margin: 0;
    color: #92400e;
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
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
        {!emailSent ? (
          <>
            <Icon>
              <FiMail />
            </Icon>

            <Header>
              <h1>Forgot Password?</h1>
              <p>No worries! Enter your email and we'll send you reset instructions.</p>
            </Header>

            <InfoBox>
              <p>
                <strong>📧 What happens next:</strong><br />
                We'll send a password reset link to your email. The link will expire in 10 minutes.
              </p>
            </InfoBox>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Email Address</label>
                <div className="input-wrapper">
                  <FiMail />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </FormGroup>

              <Button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
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
              <h3>Email Sent!</h3>
              <p>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </SuccessMessage>

            <InfoBox>
              <p>
                <strong>📬 Check your inbox:</strong><br />
                • Click the reset link in the email<br />
                • The link expires in 10 minutes<br />
                • Check spam folder if you don't see it
              </p>
            </InfoBox>

            <Button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              whileTap={{ scale: 0.98 }}
            >
              Send Another Email
            </Button>

            <BackLink to="/login">
              <FiArrowLeft />
              Back to Login
            </BackLink>
          </>
        )}
      </Card>
    </Container>
  );
};

export default ForgotPassword;
