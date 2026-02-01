'use client';

import { useEffect, useState, useCallback } from 'react';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { MetricCard } from '@/components/admin/MetricCard';
import { EngagementHeatmap } from '@/components/admin/charts/EngagementHeatmap';
import { RetentionChart } from '@/components/admin/charts/RetentionChart';
import { FeatureUsageChart } from '@/components/admin/charts/FeatureUsageChart';
import { UserGrowthChart } from '@/components/admin/charts/UserGrowthChart';
import { WalletFunnel } from '@/components/admin/charts/WalletFunnel';
import { PointsEconomyChart } from '@/components/admin/charts/PointsEconomyChart';
import { CampaignTable } from '@/components/admin/CampaignTable';
import { ReferralStats } from '@/components/admin/ReferralStats';
import { LeaderboardTrends } from '@/components/admin/LeaderboardTrends';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { ExportButton } from '@/components/admin/ExportButton';
import { DateRange } from '@/components/admin/DateRangePicker';

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

interface CampaignData {
  campaign_id: string;
  users: number;
  first_attribution: string;
  last_attribution: string;
}

interface CampaignsResponse {
  campaigns: CampaignData[];
  summary: {
    total_campaigns: number;
    total_attributed_users: number;
  };
}

interface ReferralSummary {
  total_referrals: number;
  unique_referrers: number;
  avg_per_referrer: number;
}

interface TopReferrer {
  referrer_id: number;
  referrer_name: string;
  count: number;
}

interface LeaderboardTrend {
  telegram_id: number;
  name: string;
  current_rank: number;
  previous_rank: number;
  change: number;
}

interface ReferralsResponse {
  summary: ReferralSummary;
  top_referrers: TopReferrer[];
  network_depth: { tier1: number };
  leaderboard_trends: LeaderboardTrend[];
}

// CSV Header definitions
const overviewHeaders = [
  { label: 'Metric', key: 'metric' },
  { label: 'Value', key: 'value' },
];

const userGrowthHeaders = [
  { label: 'Date', key: 'date' },
  { label: 'Daily New', key: 'total' },
  { label: 'Cumulative', key: 'cumulative' },
];

const pointsHeaders = [
  { label: 'Reason', key: 'reason' },
  { label: 'Total Distributed', key: 'distributed' },
  { label: 'Transactions', key: 'transactions' },
];

const campaignHeaders = [
  { label: 'Campaign ID', key: 'campaign_id' },
  { label: 'Users', key: 'users' },
  { label: 'First Seen', key: 'first_attribution' },
  { label: 'Last Seen', key: 'last_attribution' },
];

const referralHeaders = [
  { label: 'Rank', key: 'rank' },
  { label: 'Name', key: 'referrer_name' },
  { label: 'Referral Count', key: 'count' },
];

/**
 * Admin Dashboard Page
 *
 * Displays key metrics and charts in a responsive grid layout.
 * Features:
 * - Date range filtering for time-based charts
 * - CSV export for all data sections
 * - Auto-refresh every 60 seconds
 */
export default function AdminDashboardPage() {
  // Date range state (default: last 30 days)
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: startOfDay(subDays(new Date(), 29)),
    to: endOfDay(new Date()),
  }));

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData[]>([]);
  const [retention, setRetention] = useState<CohortData[]>([]);
  const [features, setFeatures] = useState<FeatureData[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [points, setPoints] = useState<PointsData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignsResponse | null>(null);
  const [referrals, setReferrals] = useState<ReferralsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Format date for API query params
  const formatDateParam = (date: Date): string => format(date, 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Build date query params
      const fromParam = formatDateParam(dateRange.from);
      const toParam = formatDateParam(dateRange.to);
      const dateQuery = `?from=${fromParam}&to=${toParam}`;

      const [
        overviewRes,
        engagementRes,
        retentionRes,
        featuresRes,
        usersRes,
        funnelRes,
        pointsRes,
        campaignsRes,
        referralsRes,
      ] = await Promise.all([
        fetch('/api/admin/analytics/overview'),
        fetch(`/api/admin/analytics/engagement${dateQuery}`),
        fetch('/api/admin/analytics/retention'),
        fetch('/api/admin/analytics/features'),
        fetch(`/api/admin/analytics/users${dateQuery}`),
        fetch('/api/admin/analytics/funnel'),
        fetch(`/api/admin/analytics/points${dateQuery}`),
        fetch(`/api/admin/analytics/campaigns${dateQuery}`),
        fetch('/api/admin/analytics/referrals'),
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
        campaignsData,
        referralsData,
      ] = await Promise.all([
        overviewRes.json(),
        engagementRes.ok ? engagementRes.json() : [],
        retentionRes.ok ? retentionRes.json() : [],
        featuresRes.ok ? featuresRes.json() : [],
        usersRes.ok ? usersRes.json() : [],
        funnelRes.ok ? funnelRes.json() : null,
        pointsRes.ok ? pointsRes.json() : null,
        campaignsRes.ok ? campaignsRes.json() : null,
        referralsRes.ok ? referralsRes.json() : null,
      ]);

      setOverview(overviewData);
      setEngagement(engagementData);
      setRetention(retentionData);
      setFeatures(featuresData);
      setUserGrowth(usersData);
      setFunnel(funnelData);
      setPoints(pointsData);
      setCampaigns(campaignsData);
      setReferrals(referralsData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Dashboard fetch error:', message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  // Refetch when date range changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Prepare overview data for export
  const getOverviewExportData = () => {
    if (!overview) return [];
    return [
      { metric: 'Total Users', value: overview.totalUsers },
      { metric: 'Wallets Connected', value: overview.walletsConnected },
      { metric: 'Wallet Conversion Rate', value: `${overview.walletConversionRate}%` },
      { metric: 'Points Distributed', value: overview.totalPointsDistributed },
      { metric: 'Total Referrals', value: overview.totalReferrals },
    ];
  };

  // Prepare referrals data for export with rank
  const getReferralsExportData = () => {
    if (!referrals?.top_referrers) return [];
    return referrals.top_referrers.map((r, i) => ({
      rank: i + 1,
      referrer_name: r.referrer_name,
      count: r.count,
    }));
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
        {/* Marketing Performance skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-40 mb-4"></div>
            <div className="h-64 bg-zinc-800 rounded"></div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-36 mb-4"></div>
            <div className="h-64 bg-zinc-800 rounded"></div>
          </div>
        </div>
        {/* Leaderboard Dynamics skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-44 mb-4"></div>
          <div className="h-48 bg-zinc-800 rounded"></div>
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
      {/* Dashboard Header */}
      <DashboardHeader
        title="Analytics Dashboard"
        lastUpdated={lastUpdated}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Metric Cards with Export */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Overview</h2>
          <ExportButton
            data={getOverviewExportData()}
            filename="overview"
            headers={overviewHeaders}
          />
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

      {/* User Growth Chart - Full Width */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-white">User Growth</h2>
          <ExportButton
            data={userGrowth}
            filename="user-growth"
            headers={userGrowthHeaders}
          />
        </div>
        <p className="text-zinc-500 text-sm mb-4">Selected date range</p>
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
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Points Economy</h2>
            <ExportButton
              data={points?.breakdown || []}
              filename="points-economy"
              headers={pointsHeaders}
            />
          </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

      {/* Marketing Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Campaign Performance Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Campaign Performance</h2>
            <ExportButton
              data={campaigns?.campaigns || []}
              filename="campaigns"
              headers={campaignHeaders}
            />
          </div>
          {campaigns?.summary && (
            <p className="text-zinc-500 text-sm mb-4">
              {campaigns.summary.total_campaigns} campaigns, {campaigns.summary.total_attributed_users.toLocaleString()} attributed users
            </p>
          )}
          <CampaignTable data={campaigns?.campaigns || []} />
        </div>

        {/* Referral Network */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">Referral Network</h2>
            <ExportButton
              data={getReferralsExportData()}
              filename="referrals"
              headers={referralHeaders}
            />
          </div>
          <ReferralStats
            summary={referrals?.summary || { total_referrals: 0, unique_referrers: 0, avg_per_referrer: 0 }}
            topReferrers={referrals?.top_referrers || []}
          />
        </div>
      </div>

      {/* Leaderboard Dynamics */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-base font-semibold text-white mb-3">Leaderboard Dynamics</h2>
        <p className="text-zinc-500 text-sm mb-4">Top movers in the last 7 days</p>
        <LeaderboardTrends trends={referrals?.leaderboard_trends || []} />
      </div>
    </div>
  );
}
