import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

type UserRole = 'project_owner' | 'team_leader' | 'member' | 'stakeholder';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole | UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, loading, hasRole } = useAuthContext();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Authentication check
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login page
        router.push('/login');
        return;
      }

      // Check if role is allowed
      if (allowedRoles) {
        if (!hasRole(allowedRoles)) {
          // Not authorized
          router.push('/dashboard');
          return;
        }
      }

      // If we get here, user is authorized
      setAuthorized(true);
    }
  }, [user, loading, router, allowedRoles, hasRole]);

  // Show loading spinner while checking authentication
  if (loading || !authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}