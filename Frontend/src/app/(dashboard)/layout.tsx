'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ReactNode } from 'react';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      router.replace('/login');
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex items-center gap-2">
  <ThemeSwitcher />
      <div className="flex justify-center items-center h-screen text-white text-sm">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mr-3" />
        Checking authentication...
      </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
