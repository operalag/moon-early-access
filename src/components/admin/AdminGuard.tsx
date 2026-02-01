'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { isAdmin } from '@/lib/adminConfig';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard - Protects admin routes from non-admin users
 *
 * Shows "Access Denied" message and redirects non-admins to home page.
 * Only renders children if the current user is in the admin allowlist.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useTelegram();
  const router = useRouter();

  const userIsAdmin = user && isAdmin(user.id);

  useEffect(() => {
    // Redirect non-admins to home page after showing denied message
    if (user && !isAdmin(user.id)) {
      const timeout = setTimeout(() => {
        router.replace('/');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [user, router]);

  // Still loading user
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  // User is not admin
  if (!userIsAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-bold">Access Denied</div>
          <div className="text-zinc-500 text-sm mt-2">
            You do not have permission to access this page.
          </div>
          <div className="text-zinc-600 text-xs mt-4">
            Redirecting to home...
          </div>
        </div>
      </div>
    );
  }

  // User is admin - render children
  return <>{children}</>;
}
