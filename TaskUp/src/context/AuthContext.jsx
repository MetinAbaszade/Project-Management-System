import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth';

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        // Try to get current user info (will throw if not authenticated)
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        // Not authenticated or token expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.login(email, password);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.register(userData);
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Password reset functions
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      return await authService.requestPasswordReset(email);
    } catch (err) {
      setError(err.message || 'Password reset request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      return await authService.resetPassword(token, newPassword);
    } catch (err) {
      setError(err.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      return await authService.changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err.message || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export default for convenience
export default { AuthProvider, useAuth };