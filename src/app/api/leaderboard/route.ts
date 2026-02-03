import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getISOWeek, getISOWeekYear } from 'date-fns';

interface LeaderboardEntry {
  username: string | null;
  first_name: string | null;
  avatar_url: string | null;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all_time';
    const userId = searchParams.get('userId');
    const userIdNum = userId ? parseInt(userId, 10) : null;

    let allEntries: LeaderboardEntry[] = [];

    if (period === 'all_time') {
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('telegram_id, username, first_name, total_points, avatar_url')
        .order('total_points', { ascending: false });

      if (error) throw error;

      allEntries = (profiles || []).map((p, i) => ({
        username: p.username,
        first_name: p.first_name,
        avatar_url: p.avatar_url,
        points: p.total_points || 0,
        rank: i + 1,
        isCurrentUser: userIdNum ? p.telegram_id === userIdNum : false,
      }));
    } else {
      // Daily or Weekly from leaderboard_buckets
      const now = new Date();
      let periodKey = '';

      if (period === 'daily') {
        periodKey = now.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekNumber = getISOWeek(now);
        const weekYear = getISOWeekYear(now);
        periodKey = `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
      }

      const { data: buckets, error } = await supabaseAdmin
        .from('leaderboard_buckets')
        .select(`
          user_id,
          points,
          profiles (telegram_id, username, first_name, avatar_url)
        `)
        .eq('period_type', period)
        .eq('period_key', periodKey)
        .order('points', { ascending: false });

      if (error) throw error;

      allEntries = (buckets || []).map((b: any, i) => ({
        username: b.profiles?.username,
        first_name: b.profiles?.first_name,
        avatar_url: b.profiles?.avatar_url,
        points: b.points || 0,
        rank: i + 1,
        isCurrentUser: userIdNum ? b.user_id === userIdNum : false,
      }));
    }

    // If no userId provided, return top 50 (legacy behavior)
    if (!userIdNum) {
      return NextResponse.json({
        period,
        leaderboard: allEntries.slice(0, 50),
        userRank: null,
        totalUsers: allEntries.length,
      });
    }

    // Find current user's position
    const userIndex = allEntries.findIndex(e => e.isCurrentUser);
    const userRank = userIndex >= 0 ? userIndex + 1 : null;

    // Build dynamic view: top 3 + user neighborhood (2 ahead, user, 10 behind)
    const top3 = allEntries.slice(0, 3);

    if (userIndex === -1) {
      // User not on leaderboard - show top 3 only
      return NextResponse.json({
        period,
        leaderboard: top3,
        userRank: null,
        totalUsers: allEntries.length,
        hasGap: false,
      });
    }

    // Calculate neighborhood bounds
    const neighborhoodStart = Math.max(0, userIndex - 2); // 2 ahead
    const neighborhoodEnd = Math.min(allEntries.length, userIndex + 11); // user + 10 behind

    // Check if there's overlap with top 3
    const hasGap = neighborhoodStart > 3;

    // Build final list
    let leaderboard: LeaderboardEntry[] = [];

    if (userIndex < 3) {
      // User is in top 3 - show from top to user + 10 behind
      leaderboard = allEntries.slice(0, neighborhoodEnd);
    } else if (hasGap) {
      // Gap exists - show top 3, then neighborhood
      leaderboard = [
        ...top3,
        { username: null, first_name: null, avatar_url: null, points: -1, rank: -1 }, // Gap marker
        ...allEntries.slice(neighborhoodStart, neighborhoodEnd),
      ];
    } else {
      // No gap - continuous from top to neighborhood end
      leaderboard = allEntries.slice(0, neighborhoodEnd);
    }

    return NextResponse.json({
      period,
      leaderboard,
      userRank,
      totalUsers: allEntries.length,
      hasGap,
    });
  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
