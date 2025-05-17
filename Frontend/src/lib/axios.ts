import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from './toast';

// Create base API instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 second timeout
});

// Request interceptor - automatically add authorization header when token exists
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to the authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common response situations
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error scenarios
    if (!error.response) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (typeof window !== 'undefined') {
            // Only clear on client side
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // Don't redirect from login/register/auth pages
            const isAuthPage = window.location.pathname.includes('/login') || 
                              window.location.pathname.includes('/register') ||
                              window.location.pathname.includes('/verify') ||
                              window.location.pathname.includes('/reset') ||
                              window.location.pathname.includes('/forgot');
            
            if (!isAuthPage) {
              toast.error('Your session has expired. Please log in again.');
              // Use setTimeout to avoid immediate redirect interfering with current request
              setTimeout(() => {
                window.location.href = '/login';
              }, 1000);
            }
          }
          break;
          
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
          
        case 404:
          // Don't show toast for all 404s as they might be expected in some cases
          // Only log to console
          console.error('Resource not found:', error.config?.url);
          break;
          
        case 422:
          // Validation errors - handled by individual components
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          // For other error codes, the components will handle them
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

// Default export for convenience
export default api;