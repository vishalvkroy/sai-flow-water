// Mock authentication service for development
const MOCK_USERS = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+91 9876543210',
    address: 'Main Street, Aurangabad',
    city: 'Aurangabad',
    state: 'Bihar',
    role: 'customer'
  },
  {
    id: 2,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@saiflowwater.com',
    password: 'admin123',
    phone: '+91 8084924834',
    address: 'Sai Flow Water Office',
    city: 'Aurangabad',
    state: 'Bihar',
    role: 'admin'
  },
  {
    id: 3,
    firstName: 'Seller',
    lastName: 'Manager',
    email: 'seller@saiflowwater.com',
    password: 'seller123',
    phone: '+91 8084924835',
    address: 'Sai Flow Water Store',
    city: 'Aurangabad',
    state: 'Bihar',
    role: 'seller'
  },
  {
    id: 4,
    firstName: 'Demo',
    lastName: 'Seller',
    email: 'demo@seller.com',
    password: 'demo123',
    phone: '+91 9999999999',
    address: 'Demo Store Location',
    city: 'Aurangabad',
    state: 'Bihar',
    role: 'seller'
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthAPI = {
  login: async ({ email, password }) => {
    await delay(1000); // Simulate network delay
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userData } = user;
      const token = `mock_token_${user.id}_${Date.now()}`;
      
      return {
        data: {
          success: true,
          data: userData,
          token
        }
      };
    } else {
      throw {
        response: {
          data: {
            message: 'Invalid email or password'
          }
        }
      };
    }
  },

  register: async (userData) => {
    await delay(1500); // Simulate network delay
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw {
        response: {
          data: {
            message: 'User with this email already exists'
          }
        }
      };
    }
    
    // Create new user
    const newUser = {
      id: MOCK_USERS.length + 1,
      ...userData,
      role: 'customer'
    };
    
    // Remove password from response
    const { password: _, ...userResponse } = newUser;
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    
    // Add to mock database
    MOCK_USERS.push(newUser);
    
    return {
      data: {
        success: true,
        data: userResponse,
        token
      }
    };
  },

  getMe: async () => {
    await delay(500);
    
    const token = localStorage.getItem('token');
    if (!token || !token.startsWith('mock_token_')) {
      throw {
        response: {
          status: 401,
          data: {
            message: 'Invalid token'
          }
        }
      };
    }
    
    // Extract user ID from token (format: mock_token_userId_timestamp)
    const tokenParts = token.split('_');
    if (tokenParts.length < 3) {
      throw {
        response: {
          status: 401,
          data: {
            message: 'Invalid token format'
          }
        }
      };
    }
    
    const userId = parseInt(tokenParts[2]);
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (user) {
      const { password: _, ...userData } = user;
      return {
        data: {
          success: true,
          data: userData
        }
      };
    } else {
      throw {
        response: {
          status: 401,
          data: {
            message: 'User not found'
          }
        }
      };
    }
  },

  updateProfile: async (profileData) => {
    await delay(1000);
    
    const token = localStorage.getItem('token');
    const userId = parseInt(token.split('_')[2]);
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...profileData };
      const { password: _, ...userData } = MOCK_USERS[userIndex];
      
      return {
        data: {
          success: true,
          data: userData
        }
      };
    } else {
      throw {
        response: {
          data: {
            message: 'User not found'
          }
        }
      };
    }
  },

  changePassword: async (passwordData) => {
    await delay(1000);
    
    const token = localStorage.getItem('token');
    const userId = parseInt(token.split('_')[2]);
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const user = MOCK_USERS[userIndex];
      
      if (user.password !== passwordData.currentPassword) {
        throw {
          response: {
            data: {
              message: 'Current password is incorrect'
            }
          }
        };
      }
      
      MOCK_USERS[userIndex].password = passwordData.newPassword;
      
      return {
        data: {
          success: true
        }
      };
    } else {
      throw {
        response: {
          data: {
            message: 'User not found'
          }
        }
      };
    }
  }
};
