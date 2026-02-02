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
  ton_wallet_address: string | null;
}

interface BucketJoinRow {
  user_id: number;
  points: number;
  profiles: { first_name: string | null; username: string | null; ton_wallet_address: string | null }[] | null;
}

export async function GET() {
  try {
    const now = new Date();

    // 1. Overall (all-time) leaderboard from profiles
    const { data: overallData, error: overallError } = await supabaseAdmin
      .from('profiles')
      .select('telegram_id, first_name, username, total_points, ton_wallet_address')
      .order('total_points', { ascending: false })
      .limit(10);

    if (overallError) {
      throw new Error(`Overall leaderboard failed: ${overallError.message}`);
    }

    const overall: LeaderboardEntry[] = ((overallData as ProfileRow[]) || []).map((row, index) => ({
      rank: index + 1,
      first_name: row.first_name || 'Unknown',
      username: row.username,
      wallet_address: row.ton_wallet_address,
      points: row.total_points || 0,
    }));

    // 2. Daily leaderboard from leaderboard_buckets
    const todayKey = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const { data: dailyData, error: dailyError } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('user_id, points, profiles!leaderboard_buckets_user_id_fkey(first_name, username, ton_wallet_address)')
      .eq('period_type', 'daily')
      .eq('period_key', todayKey)
      .order('points', { ascending: false })
      .limit(10);

    if (dailyError) {
      throw new Error(`Daily leaderboard failed: ${dailyError.message}`);
    }

    const daily: LeaderboardEntry[] = ((dailyData as BucketJoinRow[]) || []).map((row, index) => ({
      rank: index + 1,
      first_name: row.profiles?.[0]?.first_name || 'Unknown',
      username: row.profiles?.[0]?.username || null,
      wallet_address: row.profiles?.[0]?.ton_wallet_address || null,
      points: row.points || 0,
    }));

    // 3. Weekly leaderboard from leaderboard_buckets
    // ISO week format: YYYY-WNN (e.g., 2026-W05)
    const weekNumber = getISOWeek(now);
    const weekYear = getISOWeekYear(now);
    const weeklyKey = `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;

    const { data: weeklyData, error: weeklyError } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('user_id, points, profiles!leaderboard_buckets_user_id_fkey(first_name, username, ton_wallet_address)')
      .eq('period_type', 'weekly')
      .eq('period_key', weeklyKey)
      .order('points', { ascending: false })
      .limit(10);

    if (weeklyError) {
      throw new Error(`Weekly leaderboard failed: ${weeklyError.message}`);
    }

    const weekly: LeaderboardEntry[] = ((weeklyData as BucketJoinRow[]) || []).map((row, index) => ({
      rank: index + 1,
      first_name: row.profiles?.[0]?.first_name || 'Unknown',
      username: row.profiles?.[0]?.username || null,
      wallet_address: row.profiles?.[0]?.ton_wallet_address || null,
      points: row.points || 0,
    }));

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
