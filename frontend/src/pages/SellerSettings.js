import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiLock, 
  FiBell, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiSave,
  FiEdit2
} from 'react-icons/fi';
import SellerNavbar from '../components/Seller/SellerNavbar';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { authAPI } from '../utils/api';

const SellerSettings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    businessName: user?.businessName || 'Sai Enterprises',
    gst: user?.gst || '',
  });

  // Update profile data when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        businessName: user.businessName || 'Sai Enterprises',
        gst: user.gst || '',
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    serviceUpdates: true,
    marketingEmails: false,
    smsNotifications: true
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        businessName: profileData.businessName,
        gst: profileData.gst
      });
      
      if (response.data.success) {
        // Update user in context
        setUser(response.data.data);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      // API call to update notification settings
      toast.success('Notification settings updated!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <>
      <SellerNavbar />
      <Container>
        <Header>
          <h1>⚙️ Settings</h1>
          <p>Manage your account and preferences</p>
        </Header>

        <ContentWrapper>
          <Sidebar>
            <TabButton 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
            >
              <FiUser /> Profile Settings
            </TabButton>
            <TabButton 
              active={activeTab === 'password'} 
              onClick={() => setActiveTab('password')}
            >
              <FiLock /> Change Password
            </TabButton>
            <TabButton 
              active={activeTab === 'notifications'} 
              onClick={() => setActiveTab('notifications')}
            >
              <FiBell /> Notifications
            </TabButton>
          </Sidebar>

          <Content>
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SectionTitle>
                  <div>
                    <h2>Profile Information</h2>
                    <p>Update your account details</p>
                  </div>
                  {!isEditing && (
                    <EditButton onClick={() => setIsEditing(true)}>
                      <FiEdit2 /> Edit Profile
                    </EditButton>
                  )}
                </SectionTitle>

                <Form onSubmit={handleProfileUpdate}>
                  <FormRow>
                    <FormGroup>
                      <Label>Full Name</Label>
                      <Input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Business Name</Label>
                      <Input
                        type="text"
                        value={profileData.businessName}
                        onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                        disabled={!isEditing}
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <Label><FiMail /> Email</Label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label><FiPhone /> Phone</Label>
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        required
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label><FiMapPin /> Business Address</Label>
                    <TextArea
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      disabled={!isEditing}
                      rows="3"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>GST Number (Optional)</Label>
                    <Input
                      type="text"
                      value={profileData.gst}
                      onChange={(e) => setProfileData({...profileData, gst: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Enter GST number"
                    />
                  </FormGroup>

                  {isEditing && (
                    <ButtonGroup>
                      <CancelButton type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                      </CancelButton>
                      <SaveButton type="submit" disabled={loading}>
                        <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                      </SaveButton>
                    </ButtonGroup>
                  )}
                </Form>
              </motion.div>
            )}

            {/* Password Settings */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SectionTitle>
                  <div>
                    <h2>Change Password</h2>
                    <p>Update your password regularly for security</p>
                  </div>
                </SectionTitle>

                <Form onSubmit={handlePasswordChange}>
                  <FormGroup>
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                      placeholder="Enter current password"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                      placeholder="Enter new password"
                      minLength="6"
                    />
                    <HelpText>Password must be at least 6 characters long</HelpText>
                  </FormGroup>

                  <FormGroup>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                      placeholder="Confirm new password"
                    />
                  </FormGroup>

                  <SaveButton type="submit" disabled={loading}>
                    <FiLock /> {loading ? 'Changing...' : 'Change Password'}
                  </SaveButton>
                </Form>
              </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SectionTitle>
                  <div>
                    <h2>Notification Preferences</h2>
                    <p>Choose how you want to be notified</p>
                  </div>
                </SectionTitle>

                <NotificationList>
                  <NotificationItem>
                    <div>
                      <NotificationTitle>Email Notifications</NotificationTitle>
                      <NotificationDesc>Receive notifications via email</NotificationDesc>
                    </div>
                    <Toggle
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                    />
                  </NotificationItem>

                  <NotificationItem>
                    <div>
                      <NotificationTitle>Order Updates</NotificationTitle>
                      <NotificationDesc>Get notified about new orders and updates</NotificationDesc>
                    </div>
                    <Toggle
                      type="checkbox"
                      checked={notificationSettings.orderUpdates}
                      onChange={(e) => setNotificationSettings({...notificationSettings, orderUpdates: e.target.checked})}
                    />
                  </NotificationItem>

                  <NotificationItem>
                    <div>
                      <NotificationTitle>Service Updates</NotificationTitle>
                      <NotificationDesc>Get notified about service bookings</NotificationDesc>
                    </div>
                    <Toggle
                      type="checkbox"
                      checked={notificationSettings.serviceUpdates}
                      onChange={(e) => setNotificationSettings({...notificationSettings, serviceUpdates: e.target.checked})}
                    />
                  </NotificationItem>

                  <NotificationItem>
                    <div>
                      <NotificationTitle>SMS Notifications</NotificationTitle>
                      <NotificationDesc>Receive important updates via SMS</NotificationDesc>
                    </div>
                    <Toggle
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
                    />
                  </NotificationItem>

                  <NotificationItem>
                    <div>
                      <NotificationTitle>Marketing Emails</NotificationTitle>
                      <NotificationDesc>Receive promotional offers and updates</NotificationDesc>
                    </div>
                    <Toggle
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={(e) => setNotificationSettings({...notificationSettings, marketingEmails: e.target.checked})}
                    />
                  </NotificationItem>
                </NotificationList>

                <SaveButton onClick={handleNotificationUpdate}>
                  <FiSave /> Save Preferences
                </SaveButton>
              </motion.div>
            )}
          </Content>
        </ContentWrapper>
      </Container>
    </>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #64748b;
    font-size: 1.1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${props => props.active ? '#eff6ff' : 'transparent'};
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  border: none;
  border-left: 3px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 0.95rem;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #f1f5f9;
    color: #3b82f6;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const Content = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }
  
  p {
    color: #64748b;
    font-size: 0.9rem;
  }
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  
  svg {
    color: #3b82f6;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.disabled ? '#f1f5f9' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.95rem;
  background: ${props => props.disabled ? '#f8fafc' : 'white'};
  color: #1e293b;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.disabled ? '#f1f5f9' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 0.95rem;
  background: ${props => props.disabled ? '#f8fafc' : 'white'};
  color: #1e293b;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const HelpText = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  margin-top: -0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 2rem;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const NotificationDesc = styled.div`
  font-size: 0.85rem;
  color: #64748b;
`;

const Toggle = styled.input`
  width: 50px;
  height: 26px;
  appearance: none;
  background: #cbd5e1;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:checked {
    background: #10b981;
  }
  
  &::before {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:checked::before {
    left: 26px;
  }
`;

export default SellerSettings;
