// Frontend/src/lib/axios.ts
import axios from 'axios';

// Create an axios instance with the correct base URL
export const api = axios.create({
  // Use the correct API base URL based on your environment
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  // Add any other configurations
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status
      console.error('API Error Response:', error.response.status, error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear token and redirect to login if needed
        localStorage.removeItem('authToken');
        // Handle redirect logic if needed
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Request Error (No Response):', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('API Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);