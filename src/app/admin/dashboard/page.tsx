'use client';

import { useEffect, useState, useCallback } from 'react';
import { MetricCard } from '@/components/admin/MetricCard';
import { EngagementHeatmap } from '@/components/admin/charts/EngagementHeatmap';
import { RetentionChart } from '@/components/admin/charts/RetentionChart';
import { FeatureUsageChart } from '@/components/admin/charts/FeatureUsageChart';
import { UserGrowthChart } from '@/components/admin/charts/UserGrowthChart';
import { WalletFunnel } from '@/components/admin/charts/WalletFunnel';
import { PointsEconomyChart } from '@/components/admin/charts/PointsEconomyChart';

interface OverviewData {
  totalUsers: number;
  walletsConnected: number;
  walletConversionRate: string;
  totalPointsDistributed: number;
  totalReferrals: number;
}

interface EngagementData {
  date: string;
  count: number;
}

interface CohortData {
  cohort: string;
  d1: number;
  d7: number;
  d30: number;
  d1Pct: string;
  d7Pct: string;
  d30Pct: string;
}

interface FeatureData {
  feature: string;
  users: number;
  transactions: number;
}

interface UserGrowthData {
  date: string;
  total: number;
  cumulative: number;
}

interface FunnelStage {
  name: string;
  value: number;
  fill: string;
}

interface FunnelData {
  stages: FunnelStage[];
  conversionRates: {
    toChannel: string;
    toWallet: string;
  };
}

interface PointsBreakdown {
  reason: string;
  distributed: number;
  transactions: number;
}

interface PointsData {
  breakdown: PointsBreakdown[];
  totals: {
    distributed: number;
    transactions: number;
  };
}

/**
 * Admin Dashboard Page
 *
 * Displays key metrics and charts in a responsive grid layout.
 * Auto-refreshes every 60 seconds.
 */
export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData[]>([]);
  const [retention, setRetention] = useState<CohortData[]>([]);
  const [features, setFeatures] = useState<FeatureData[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [points, setPoints] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [
        overviewRes,
        engagementRes,
        retentionRes,
        featuresRes,
        usersRes,
        funnelRes,
        pointsRes,
      ] = await Promise.all([
        fetch('/api/admin/analytics/overview'),
        fetch('/api/admin/analytics/engagement'),
        fetch('/api/admin/analytics/retention'),
        fetch('/api/admin/analytics/features'),
        fetch('/api/admin/analytics/users'),
        fetch('/api/admin/analytics/funnel'),
        fetch('/api/admin/analytics/points'),
      ]);

      if (!overviewRes.ok) {
        const errorData = await overviewRes.json();
        throw new Error(errorData.error || 'Failed to fetch overview');
      }

      const [
        overviewData,
        engagementData,
        retentionData,
        featuresData,
        usersData,
        funnelData,
        pointsData,
      ] = await Promise.all([
        overviewRes.json(),
        engagementRes.ok ? engagementRes.json() : [],
        retentionRes.ok ? retentionRes.json() : [],
        featuresRes.ok ? featuresRes.json() : [],
        usersRes.ok ? usersRes.json() : [],
        funnelRes.ok ? funnelRes.json() : null,
        pointsRes.ok ? pointsRes.json() : null,
      ]);

      setOverview(overviewData);
      setEngagement(engagementData);
      setRetention(retentionData);
      setFeatures(featuresData);
      setUserGrowth(usersData);
      setFunnel(funnelData);
      setPoints(pointsData);
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
    fetchData();

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        {/* User Growth skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-28 mb-2"></div>
          <div className="h-3 bg-zinc-800 rounded w-20 mb-4"></div>
          <div className="h-72 bg-zinc-800 rounded"></div>
        </div>
        {/* Funnel + Points skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-36 mb-4"></div>
            <div className="h-72 bg-zinc-800 rounded"></div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-36 mb-4"></div>
            <div className="h-72 bg-zinc-800 rounded"></div>
          </div>
        </div>
        {/* Engagement Heatmap skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-32 mb-4"></div>
          <div className="h-32 bg-zinc-800 rounded"></div>
        </div>
        {/* Retention + Features skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-36 mb-4"></div>
            <div className="h-72 bg-zinc-800 rounded"></div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-36 mb-4"></div>
            <div className="h-72 bg-zinc-800 rounded"></div>
          </div>
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
            onClick={fetchData}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* User Growth Chart - Full Width */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-1">User Growth</h2>
        <p className="text-zinc-500 text-sm mb-4">Last 30 days</p>
        {userGrowth.length > 0 ? (
          <UserGrowthChart data={userGrowth} />
        ) : (
          <div className="h-72 flex items-center justify-center text-zinc-500">
            No user growth data available yet
          </div>
        )}
      </div>

      {/* Conversion Funnel + Points Economy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Wallet Conversion Funnel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h2>
          {funnel?.stages && funnel.stages.length > 0 ? (
            <>
              <WalletFunnel data={funnel.stages} />
              <div className="mt-4 flex justify-center gap-6 text-sm">
                <div className="text-zinc-400">
                  To Channel: <span className="text-purple-400 font-medium">{funnel.conversionRates.toChannel}%</span>
                </div>
                <div className="text-zinc-400">
                  To Wallet: <span className="text-green-400 font-medium">{funnel.conversionRates.toWallet}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-72 flex items-center justify-center text-zinc-500">
              No funnel data available yet
            </div>
          )}
        </div>

        {/* Points Economy Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-1">Points Economy</h2>
          {points?.totals && (
            <p className="text-zinc-500 text-sm mb-4">
              Total: {formatNumber(points.totals.distributed)} points
            </p>
          )}
          {points?.breakdown && points.breakdown.length > 0 ? (
            <PointsEconomyChart data={points.breakdown} />
          ) : (
            <div className="h-72 flex items-center justify-center text-zinc-500">
              No points data available yet
            </div>
          )}
        </div>
      </div>

      {/* User Engagement Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">User Engagement</h2>
        <div className="overflow-x-auto">
          <EngagementHeatmap data={engagement} />
        </div>
      </div>

      {/* Retention Analysis + Feature Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Retention Analysis</h2>
          {retention.length > 0 ? (
            <RetentionChart data={retention} />
          ) : (
            <div className="h-72 flex items-center justify-center text-zinc-500">
              No cohort data available yet
            </div>
          )}
        </div>

        {/* Feature Adoption Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Feature Adoption</h2>
          {features.length > 0 ? (
            <FeatureUsageChart data={features} />
          ) : (
            <div className="h-72 flex items-center justify-center text-zinc-500">
              No feature usage data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
