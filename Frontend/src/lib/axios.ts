// src/lib/axios.ts
import axios from 'axios';
import { toast } from '@/lib/toast';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: 'http://localhost:8000', // Configure this according to your environment
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Skip adding auth headers for login/register endpoints
    const isAuthEndpoint = 
      config.url?.includes('/auth/login') || 
      config.url?.includes('/auth/register') ||
      config.url?.includes('/email/send-verification-code');
    
    if (!isAuthEndpoint && typeof window !== 'undefined') {
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Add authentication header
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error setting auth header:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Get the request URL
    const requestUrl = error.config?.url || '';
    
    // Check if error is due to authentication issues
    if (error.response && error.response.status === 401) {
      // ⚠️ FIX: Skip session expired handling for login/register endpoints
      const isAuthEndpoint = 
        requestUrl.includes('/auth/login') || 
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/email/send-verification-code');
      
      // Only redirect for non-auth endpoints to prevent login loops
      if (!isAuthEndpoint && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        console.warn('Authentication error - redirecting to login');
        
        // Get current path for redirect after login
        const currentPath = window.location.pathname;
        
        // Clear token and user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        toast.error('Your session has expired. Please login again.');
        
        // Redirect to login with return URL
        setTimeout(() => {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;