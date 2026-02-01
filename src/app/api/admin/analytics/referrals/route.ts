import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Admin Analytics Referrals API
 *
 * Returns referral network statistics:
 * - summary: Total referrals, unique referrers, avg per referrer
 * - top_referrers: Top 10 referrers with names and counts
 * - network_depth: Direct referral count (tier 1)
 * - leaderboard_trends: Top movers in leaderboard positions over last 7 days
 */

interface ReferralJoinRow {
  referrer_id: number;
  profiles: { first_name: string | null }[] | null;
}

interface LeaderboardBucket {
  user_id: number;
  period_key: string;
  points: number;
  profiles: { first_name: string | null }[] | null;
}

interface TopMover {
  telegram_id: number;
  name: string;
  current_rank: number;
  previous_rank: number;
  change: number;
}

export async function GET() {
  try {
    // 1. Get total referral count
    const { count: totalReferrals, error: countError } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Referrals count failed: ${countError.message}`);
    }

    // 2. Get referrals with referrer names for aggregation
    const { data: referralData, error: referralsError } = await supabaseAdmin
      .from('referrals')
      .select('referrer_id, profiles!referrals_referrer_id_fkey(first_name)');

    if (referralsError) {
      throw new Error(`Referrals query failed: ${referralsError.message}`);
    }

    // Aggregate by referrer
    const referrerMap = new Map<number, { name: string; count: number }>();

    for (const row of (referralData as ReferralJoinRow[]) || []) {
      const existing = referrerMap.get(row.referrer_id);
      if (existing) {
        existing.count += 1;
      } else {
        const name = row.profiles?.[0]?.first_name || 'Unknown';
        referrerMap.set(row.referrer_id, { name, count: 1 });
      }
    }

    // Convert to array and sort by count DESC, take top 10
    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer_id, data]) => ({
        referrer_id,
        referrer_name: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate summary
    const uniqueReferrers = referrerMap.size;
    const avgPerReferrer = uniqueReferrers > 0
      ? Math.round(((totalReferrals || 0) / uniqueReferrers) * 10) / 10
      : 0;

    const summary = {
      total_referrals: totalReferrals || 0,
      unique_referrers: uniqueReferrers,
      avg_per_referrer: avgPerReferrer,
    };

    // Network depth (for now, just tier 1 = total direct referrals)
    const networkDepth = {
      tier1: totalReferrals || 0,
    };

    // 3. Calculate leaderboard trends (top movers in last 7 days)
    // Get today's date and 7 days ago in YYYY-MM-DD format
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoKey = sevenDaysAgo.toISOString().split('T')[0];

    // Get daily buckets for today and 7 days ago
    const { data: currentBuckets, error: currentError } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('user_id, period_key, points, profiles!leaderboard_buckets_user_id_fkey(first_name)')
      .eq('period_type', 'daily')
      .eq('period_key', todayKey)
      .order('points', { ascending: false });

    const { data: previousBuckets, error: previousError } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('user_id, period_key, points, profiles!leaderboard_buckets_user_id_fkey(first_name)')
      .eq('period_type', 'daily')
      .eq('period_key', sevenDaysAgoKey)
      .order('points', { ascending: false });

    // Build rank maps
    const currentRanks = new Map<number, { rank: number; name: string }>();
    const previousRanks = new Map<number, number>();

    if (!currentError && currentBuckets) {
      (currentBuckets as LeaderboardBucket[]).forEach((bucket, index) => {
        currentRanks.set(bucket.user_id, {
          rank: index + 1,
          name: bucket.profiles?.[0]?.first_name || 'Unknown',
        });
      });
    }

    if (!previousError && previousBuckets) {
      (previousBuckets as LeaderboardBucket[]).forEach((bucket, index) => {
        previousRanks.set(bucket.user_id, index + 1);
      });
    }

    // Calculate position changes for users in current rankings
    const movers: TopMover[] = [];
    for (const [userId, current] of currentRanks.entries()) {
      const previousRank = previousRanks.get(userId);
      if (previousRank !== undefined) {
        // positive change = moved up (lower rank number is better)
        const change = previousRank - current.rank;
        if (change !== 0) {
          movers.push({
            telegram_id: userId,
            name: current.name,
            current_rank: current.rank,
            previous_rank: previousRank,
            change,
          });
        }
      }
    }

    // Sort by biggest positive change (moved up most), take top 5
    const leaderboardTrends = movers
      .sort((a, b) => b.change - a.change)
      .slice(0, 5);

    return NextResponse.json({
      summary,
      top_referrers: topReferrers,
      network_depth: networkDepth,
      leaderboard_trends: leaderboardTrends,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Referrals Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
