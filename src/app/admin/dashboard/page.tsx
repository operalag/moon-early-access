'use client';

import { useEffect, useState, useCallback } from 'react';
import { MetricCard } from '@/components/admin/MetricCard';

interface OverviewData {
  totalUsers: number;
  walletsConnected: number;
  walletConversionRate: string;
  totalPointsDistributed: number;
  totalReferrals: number;
}

/**
 * Admin Dashboard Page
 *
 * Displays key metrics in a responsive grid layout.
 * Auto-refreshes every 60 seconds.
 */
export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics/overview');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch overview');
      }
      const data = await response.json();
      setOverview(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Dashboard fetch error:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh every 60 seconds
  useEffect(() => {
    fetchOverview();

    const interval = setInterval(fetchOverview, 60000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Format last updated time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-3 bg-zinc-800 rounded w-20 mb-3"></div>
              <div className="h-7 bg-zinc-800 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
          <div className="text-red-400 font-medium">Error loading data</div>
          <div className="text-red-500/70 text-sm mt-1">{error}</div>
          <button
            onClick={fetchOverview}
            className="mt-3 px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Last updated: {lastUpdated ? formatTime(lastUpdated) : 'Never'}
          <span className="text-zinc-600 ml-2">(auto-refresh: 60s)</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={formatNumber(overview?.totalUsers || 0)}
        />
        <MetricCard
          title="Wallets Connected"
          value={formatNumber(overview?.walletsConnected || 0)}
          change={`${overview?.walletConversionRate || '0'}% conversion`}
          trend="neutral"
        />
        <MetricCard
          title="Points Distributed"
          value={formatNumber(overview?.totalPointsDistributed || 0)}
        />
        <MetricCard
          title="Total Referrals"
          value={formatNumber(overview?.totalReferrals || 0)}
        />
      </div>
    </div>
  );
}
