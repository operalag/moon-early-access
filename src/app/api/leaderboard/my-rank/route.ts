import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getISOWeek, getISOWeekYear } from 'date-fns';

/**
 * GET /api/leaderboard/my-rank?userId=<telegram_id>
 *
 * Returns the current user's weekly leaderboard rank and points.
 * Used by the WeeklyRewardBanner component on the settings page.
 */

interface BucketRow {
  user_id: number;
  points: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid userId parameter' }, { status: 400 });
    }

    // Calculate current week key using ISO week format (same as admin leaderboards)
    const now = new Date();
    const weekNumber = getISOWeek(now);
    const weekYear = getISOWeekYear(now);
    const weekKey = `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;

    // Fetch all weekly leaderboard entries for current week, ordered by points descending
    const { data: weeklyData, error: weeklyError } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('user_id, points')
      .eq('period_type', 'weekly')
      .eq('period_key', weekKey)
      .order('points', { ascending: false });

    if (weeklyError) {
      throw new Error(`Weekly leaderboard query failed: ${weeklyError.message}`);
    }

    const weeklyBuckets = (weeklyData as BucketRow[]) || [];

    // Find user's position in the leaderboard
    const userIndex = weeklyBuckets.findIndex(b => b.user_id === userIdNum);

    if (userIndex === -1) {
      // User not on leaderboard this week (no points earned)
      return NextResponse.json({
        weeklyRank: null,
        weeklyPoints: 0,
        isInTop10: false,
        weekKey,
      });
    }

    const weeklyRank = userIndex + 1;
    const weeklyPoints = weeklyBuckets[userIndex].points;
    const isInTop10 = weeklyRank <= 10;

    return NextResponse.json({
      weeklyRank,
      weeklyPoints,
      isInTop10,
      weekKey,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('My Rank API Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
