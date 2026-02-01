'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin Login Page
 *
 * Simple password-based authentication for browser access.
 * Telegram users with username @tony_ca bypass this entirely.
 */
export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">MOON Admin</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Enter password to access analytics
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-colors"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-8">
          Telegram user @tony_ca has automatic access
        </p>
      </div>
    </div>
  );
}
