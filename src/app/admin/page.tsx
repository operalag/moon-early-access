'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin Index Page
 *
 * Redirects to the main dashboard automatically.
 */
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-zinc-500 text-sm">Redirecting to dashboard...</div>
    </div>
  );
}
