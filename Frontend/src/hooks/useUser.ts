'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return {
    user: null,
    loading,
    logout,
    isAuthenticated,
    role: null,
    hasRole: () => false,
    initialized: true,
    isProjectOwner: false,
    isTeamLeader: false,
    isMember: false,
    isStakeholder: false,
    userName: '',
  };
}
