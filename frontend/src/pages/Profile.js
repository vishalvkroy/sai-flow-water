import React from 'react';
import styled from 'styled-components';
import { FiUser } from 'react-icons/fi';

const ProfileContainer = styled.div`
  min-height: 80vh;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
  }
  
  p {
    color: #6b7280;
    font-size: 1.1rem;
  }
`;

const ProfileContent = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  .profile-icon {
    font-size: 5rem;
    color: #3b82f6;
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #374151;
    margin-bottom: 1rem;
  }
  
  p {
    color: #6b7280;
    line-height: 1.6;
  }
`;

const Profile = () => {
  return (
    <ProfileContainer>
      <ProfileHeader>
        <h1>User Profile</h1>
        <p>Manage your account information</p>
      </ProfileHeader>
      
      <ProfileContent>
        <FiUser className="profile-icon" />
        <h2>Profile Management</h2>
        <p>
          Profile management features are coming soon. You'll be able to update your personal information, 
          contact details, and service preferences here.
        </p>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default Profile;