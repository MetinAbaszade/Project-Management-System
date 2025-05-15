
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout as apiLogout } from '@/api/UserAPI';

interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  ProfileUrl?: string;
  Role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const userData = getCurrentUser();
        
        if (userData) {
          console.log('User data loaded from localStorage:', userData);
          setUser(userData);
        } else {
          console.warn('Token exists but no user data found, clearing auth state');
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth context:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const logout = () => {
    apiLogout();
    setUser(null);
    router.push('/login');
  };
  
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}