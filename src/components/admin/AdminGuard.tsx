'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';

interface AdminGuardProps {
  children: React.ReactNode;
}

// Telegram username allowed to access admin (without @)
const ADMIN_USERNAME = 'tony_ca';

/**
 * AdminGuard - Protects admin routes with dual authentication
 *
 * Access granted if:
 * 1. Telegram user with username @tony_ca (automatic), OR
 * 2. Valid session cookie from password login (browser access)
 *
 * Otherwise redirects to /admin/login
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useTelegram();
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [authMethod, setAuthMethod] = useState<'telegram' | 'password' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check on login page
      if (pathname === '/admin/login') {
        setAuthState('authorized');
        return;
      }

      // Check 1: Telegram user with correct username
      if (user?.username === ADMIN_USERNAME) {
        setAuthState('authorized');
        setAuthMethod('telegram');
        return;
      }

      // Check 2: Valid session cookie (for browser access)
      try {
        const response = await fetch('/api/admin/auth', {
          credentials: 'include',
        });
        const data = await response.json();

        if (data.authenticated) {
          setAuthState('authorized');
          setAuthMethod('password');
          return;
        }
      } catch {
        // Session check failed, continue to unauthorized
      }

      // Not authorized via either method
      // Wait a moment for Telegram context to potentially load
      if (user === null) {
        // Still loading Telegram context, wait
        return;
      }

      setAuthState('unauthorized');
    };

    checkAuth();
  }, [user, pathname]);

  // Redirect unauthorized users to login
  useEffect(() => {
    if (authState === 'unauthorized' && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [authState, pathname, router]);

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' });
    window.location.href = '/admin/login';
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Checking access...</div>
      </div>
    );
  }

  // Unauthorized (will redirect)
  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="text-zinc-500 text-sm">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  // Authorized - render children with optional logout button
  return (
    <>
      {/* Logout button for password-authenticated users */}
      {authMethod === 'password' && pathname !== '/admin/login' && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      )}
      {children}
    </>
  );
}
