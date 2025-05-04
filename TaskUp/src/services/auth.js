// src/services/auth.js
// Authentication service that can be easily swapped between mock and real implementation

import * as mockData from '../data/seeds';

// Flag to determine if we're using mock data or real API
// Set this to false when you're ready to connect to a real backend
const USE_MOCK_DATA = true;

// Helper for simulating API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Local storage keys
const TOKEN_KEY = 'taskup_token';
const USER_KEY = 'taskup_user';

// ===== AUTHENTICATION SERVICES =====

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (email, password) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    
    // For mock authentication, accept any well-formed email with any password
    if (!email || !isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Find a matching user in mock data or create a mock user
    let user = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Create a mock user based on the email
      const [firstName, lastName] = getNameFromEmail(email);
      user = {
        id: `user-${Date.now()}`,
        firstName,
        lastName,
        email,
        role: 'User',
        createdAt: new Date().toISOString()
      };
    }
    
    // Create a mock token
    const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in localStorage to maintain session
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return {
      user: {
        ...user,
        name: `${user.firstName} ${user.lastName}`
      },
      token
    };
  } else {
    // Real API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store authentication data
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data and token
 */
export const register = async (userData) => {
  if (USE_MOCK_DATA) {
    await delay(1500);
    
    // Validate required fields
    if (!userData.email || !isValidEmail(userData.email)) {
      throw new Error('Valid email is required');
    }
    
    if (!userData.password || userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    if (!userData.firstName || !userData.lastName) {
      throw new Error('First and last name are required');
    }
    
    // Create a new user
    const newUser = {
      id: `user-${Date.now()}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role || 'User',
      createdAt: new Date().toISOString()
    };
    
    // Create a mock token
    const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    
    return {
      user: {
        ...newUser,
        name: `${newUser.firstName} ${newUser.lastName}`
      },
      token
    };
  } else {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    // Store authentication data
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data;
  }
};

/**
 * Log out the current user
 * @returns {Promise<boolean>} Success status
 */
export const logout = async () => {
  if (USE_MOCK_DATA) {
    await delay(300);
    
    // Clear local storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    return { success: true };
  } else {
    try {
      // Call logout endpoint if needed
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage regardless of API success
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    return { success: true };
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  if (USE_MOCK_DATA) {
    await delay(500);
    
    // Get user from localStorage
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) {
      throw new Error('Not authenticated');
    }
    
    try {
      const user = JSON.parse(storedUser);
      return {
        ...user,
        name: `${user.firstName} ${user.lastName}`
      };
    } catch (error) {
      throw new Error('Invalid user data');
    }
  } else {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid authentication
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        throw new Error('Authentication expired');
      }
      throw new Error('Failed to get user data');
    }
    
    return response.json();
  }
};

/**
 * Reset password request (sends email)
 * @param {string} email - User email
 * @returns {Promise<Object>} Success status
 */
export const requestPasswordReset = async (email) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    
    if (!email || !isValidEmail(email)) {
      throw new Error('Valid email is required');
    }
    
    return { success: true, message: 'Password reset email sent' };
  } else {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset request failed');
    }
    
    return response.json();
  }
};

/**
 * Verify password reset token and reset password
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success status
 */
export const resetPassword = async (token, newPassword) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    
    if (!token) {
      throw new Error('Invalid token');
    }
    
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    return { success: true, message: 'Password reset successful' };
  } else {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, password: newPassword })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    }
    
    return response.json();
  }
};

/**
 * Change password for authenticated user
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success status
 */
export const changePassword = async (currentPassword, newPassword) => {
  if (USE_MOCK_DATA) {
    await delay(1000);
    
    if (!currentPassword) {
      throw new Error('Current password is required');
    }
    
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
    
    return { success: true, message: 'Password changed successfully' };
  } else {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password change failed');
    }
    
    return response.json();
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get the authentication token
 * @returns {string|null} The token or null if not authenticated
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if the user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Extract name from email address
 * @param {string} email - Email address
 * @returns {Array} [firstName, lastName]
 */
const getNameFromEmail = (email) => {
  const localPart = email.split('@')[0];
  
  // Handle common formats: first.last@domain, first_last@domain, etc.
  let parts = localPart.replace(/[._]/g, ' ').split(' ');
  
  if (parts.length >= 2) {
    return [
      parts[0].charAt(0).toUpperCase() + parts[0].slice(1), 
      parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    ];
  }
  
  // If no obvious separator, just capitalize the local part
  return [localPart.charAt(0).toUpperCase() + localPart.slice(1), 'User'];
};

// Export all auth services as a default object
export default {
  login,
  register,
  logout,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getToken,
  isAuthenticated
};