import axios from "axios";

// Create axios instance with base URL
export const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to inject auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("authToken")
    : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.warn('Authentication error: Unauthorized. Clearing auth data and redirecting to login.');
        
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(err);
  }
);

export default api;