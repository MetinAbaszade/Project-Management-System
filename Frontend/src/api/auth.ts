// src/api/auth.ts

import { api } from '@/lib/axios';
import { toast } from '@/lib/toast';

export interface LoginCredentials {
  Email: string;
  Password: string;
}

export interface UserData {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
}

/**
 * Login user and store authentication token
 */
export async function loginUser(credentials: LoginCredentials): Promise<UserData> {
  try {
    // Clear any existing tokens first to prevent stale auth issues
    localStorage.removeItem('authToken');
    
    const response = await api.post('/auth/login', credentials);
    
    // According to API docs, the response should be a string token
    const token = response.data;
    
    if (!token || typeof token !== 'string') {
      console.error('Unexpected login response format:', response.data);
      throw new Error('Login failed: invalid token format');
    }
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Get user data with the token
    try {
      const userResponse = await api.get('/users/get-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = userResponse.data;
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      return userData;
    } catch (userError) {
      console.error('Error fetching user data after login:', userError);
      // Create minimal user data from token if possible
      const userData = extractUserFromToken(token, credentials.Email);
      localStorage.setItem('userData', JSON.stringify(userData));
      return userData;
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (status === 403) {
        throw new Error('Your account is locked or disabled. Please contact support.');
      } else {
        throw new Error(`Login failed: ${error.response.data?.detail || 'Server error'}`);
      }
    } else if (error.request) {
      throw new Error('Server not responding. Please check your connection and try again.');
    }
    
    // For other types of errors
    throw error;
  }
}

/**
 * Extract user info from JWT token
 */
function extractUserFromToken(token: string, email: string): UserData {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    return {
      Id: decodedPayload.sub || decodedPayload.id || decodedPayload.userId || `user-${Date.now()}`,
      FirstName: decodedPayload.firstName || decodedPayload.first_name || '',
      LastName: decodedPayload.lastName || decodedPayload.last_name || '',
      Email: email,
      Role: decodedPayload.role || ''
    };
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    // Return minimal user object
    return {
      Id: `user-${Date.now()}`,
      FirstName: '',
      LastName: '',
      Email: email,
      Role: ''
    };
  }
}

/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // If token isn't available but we attempt to make an authenticated request,
    // this is likely due to a session timeout or logout
    console.error('No authentication token found for API request');
    
    // Only show toast if we're in the browser
    if (typeof window !== 'undefined') {
      toast.error('Your session has expired. Please log in again.');
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }, 1000);
    }
    
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('authToken');
}

/**
 * Logout user
 */
export function logout(redirectTo: string = '/login'): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  
  // Redirect only if in browser
  if (typeof window !== 'undefined') {
    window.location.href = redirectTo;
  }
}

/**
 * Check if token is expired
 */
export function checkTokenExpiration(): boolean {
  const token = localStorage.getItem('authToken');
  
  if (!token) return false;
  
  try {
    // Parse JWT payload (assuming JWT token)
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    if (decodedPayload.exp) {
      // exp is in seconds since epoch, Date.now() is in milliseconds
      const isExpired = decodedPayload.exp < Date.now() / 1000;
      
      if (isExpired) {
        // Token expired, handle logout
        logout();
        toast.error('Your session has expired. Please log in again.');
        return false;
      }
      
      return true;
    }
    
    // If no exp claim, assume token is valid
    return true;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
}

/**
 * Get current user data
 */
export function getCurrentUser(): UserData | null {
  try {
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) return null;
    
    return JSON.parse(userDataStr);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}