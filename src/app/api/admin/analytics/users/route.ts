import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

interface DailyUserCount {
  date: string;
  total: number;
  cumulative: number;
}

/**
 * Admin Analytics Users API
 *
 * Returns user growth data over time:
 * - date: The day (YYYY-MM-DD)
 * - total: New users that day
 * - cumulative: Running total of all users up to that day
 *
 * Query params:
 * - days: Number of days to look back (default 30, ignored if from/to provided)
 * - from: Start date (YYYY-MM-DD)
 * - to: End date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Calculate date range from params or default
    let endDate: Date;
    let startDate: Date;

    if (fromParam && toParam) {
      startDate = parseISO(fromParam);
      endDate = parseISO(toParam);
    } else {
      endDate = new Date();
      startDate = subDays(endDate, days - 1);
    }

    // Get all users created before or during the period
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (usersError) {
      throw new Error(`Users query failed: ${usersError.message}`);
    }

    // Count users by date
    const dailyCounts: Map<string, number> = new Map();
    let cumulativeBeforeRange = 0;

    for (const user of allUsers || []) {
      const userDate = format(parseISO(user.created_at), 'yyyy-MM-dd');
      const userDateObj = parseISO(user.created_at);

      if (userDateObj < startDate) {
        // User created before our range - add to pre-range cumulative
        cumulativeBeforeRange++;
      } else {
        // User created within our range
        dailyCounts.set(userDate, (dailyCounts.get(userDate) || 0) + 1);
      }
    }

    // Generate all days in the interval
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Build result with cumulative counts
    let cumulative = cumulativeBeforeRange;
    const result: DailyUserCount[] = allDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dailyTotal = dailyCounts.get(dateStr) || 0;
      cumulative += dailyTotal;

      return {
        date: dateStr,
        total: dailyTotal,
        cumulative,
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Users Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
