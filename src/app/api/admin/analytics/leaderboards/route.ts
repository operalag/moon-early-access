import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getISOWeek, getISOWeekYear } from 'date-fns';

/**
 * Admin Analytics Leaderboards API
 *
 * Returns top 10 users for three timeframes:
 * - overall: All-time total points from profiles table
 * - weekly: Current ISO week from leaderboard_buckets
 * - daily: Today's date from leaderboard_buckets
 *
 * Each entry includes rank, name, username, wallet address, and points.
 * Wallet addresses are fetched from points_transactions metadata (wallet_connect reason).
 */

interface LeaderboardEntry {
  rank: number;
  first_name: string;
  username: string | null;
  wallet_address: string | null;
  points: number;
}

interface ProfileRow {
  telegram_id: number;
  first_name: string | null;
  username: string | null;
  total_points: number;
}

interface BucketRow {
  user_id: number;
  points: number;
}

interface WalletTransaction {
  user_id: number;
  metadata: { address?: string } | null;
}

// Helper to fetch wallet addresses from points_transactions
async function getWalletAddresses(userIds: number[]): Promise<Map<number, string>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabaseAdmin
    .from('points_transactions')
    .select('user_id, metadata')
    .in('user_id', userIds)
    .eq('reason', 'wallet_connect');

  if (error) {
    console.error('Error fetching wallet addresses:', error);
    return new Map();
  }

  const walletMap = new Map<number, string>();
  for (const tx of (data as WalletTransaction[]) || []) {
    if (tx.metadata?.address) {
      walletMap.set(tx.user_id, tx.metadata.address);
    }
  }
  return walletMap;
}

// Helper to fetch profile details for a list of user IDs
async function getProfileDetails(userIds: number[]): Promise<Map<number, { first_name: string; username: string | null }>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('telegram_id, first_name, username')
    .in('telegram_id', userIds);

  if (error) {
    console.error('Error fetching profile details:', error);
    return new Map();
  }

  const profileMap = new Map<number, { first_name: string; username: string | null }>();
  for (const profile of data || []) {
    profileMap.set(profile.telegram_id, {
      first_name: profile.first_name || 'Unknown',
      username: profile.username,
    });
  }
  return profileMap;
}

export async function GET() {
  try {
    const now = new Date();

    // 1. Overall (all-time) leaderboard from profiles
    const { data: overallData, error: overallError } = await supabaseAdmin
      .from('profiles')
      .select('telegram_id, first_name, username, total_points')
      .order('total_points', { ascending: false })
      .limit(10);

    if (overallError) {
      throw new Error(`Overall leaderboard failed: ${overallError.message}`);
    }

    const overallProfiles = (overallData as ProfileRow[]) || [];
    const overallUserIds = overallProfiles.map(p => p.telegram_id);
    const overallWallets = await getWalletAddresses(overallUserIds);

    const overall: LeaderboardEntry[] = overallProfiles.map((row, index) => ({
      rank: index + 1,
      first_name: row.first_name || 'Unknown',
      username: row.username,
      wallet_address: overallWallets.get(row.telegram_id) || null,
      points: row.total_points || 0,
    }));

    // 2. Daily leaderboard from leaderboard_buckets
    const todayKey = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const { data: dailyData, error: dailyError } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('user_id, points')
      .eq('period_type', 'daily')
      .eq('period_key', todayKey)
      .order('points', { ascending: false })
      .limit(10);

    if (dailyError) {
      throw new Error(`Daily leaderboard failed: ${dailyError.message}`);
    }

    const dailyBuckets = (dailyData as BucketRow[]) || [];
    const dailyUserIds = dailyBuckets.map(b => b.user_id);
    const dailyProfiles = await getProfileDetails(dailyUserIds);
    const dailyWallets = await getWalletAddresses(dailyUserIds);

    const daily: LeaderboardEntry[] = dailyBuckets.map((row, index) => {
      const profile = dailyProfiles.get(row.user_id);
      return {
        rank: index + 1,
        first_name: profile?.first_name || 'Unknown',
        username: profile?.username || null,
        wallet_address: dailyWallets.get(row.user_id) || null,
        points: row.points || 0,
      };
    });

    // 3. Weekly leaderboard from leaderboard_buckets
    // ISO week format: YYYY-WNN (e.g., 2026-W05)
    const weekNumber = getISOWeek(now);
    const weekYear = getISOWeekYear(now);
    const weeklyKey = `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;

    const { data: weeklyData, error: weeklyError } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('user_id, points')
      .eq('period_type', 'weekly')
      .eq('period_key', weeklyKey)
      .order('points', { ascending: false })
      .limit(10);

    if (weeklyError) {
      throw new Error(`Weekly leaderboard failed: ${weeklyError.message}`);
    }

    const weeklyBuckets = (weeklyData as BucketRow[]) || [];
    const weeklyUserIds = weeklyBuckets.map(b => b.user_id);
    const weeklyProfiles = await getProfileDetails(weeklyUserIds);
    const weeklyWallets = await getWalletAddresses(weeklyUserIds);

    const weekly: LeaderboardEntry[] = weeklyBuckets.map((row, index) => {
      const profile = weeklyProfiles.get(row.user_id);
      return {
        rank: index + 1,
        first_name: profile?.first_name || 'Unknown',
        username: profile?.username || null,
        wallet_address: weeklyWallets.get(row.user_id) || null,
        points: row.points || 0,
      };
    });

    return NextResponse.json({
      overall,
      weekly,
      daily,
      generated_at: now.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Leaderboards Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
