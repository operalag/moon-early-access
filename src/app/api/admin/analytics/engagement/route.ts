import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

interface EngagementData {
  date: string;
  count: number;
}

/**
 * Admin Analytics Engagement API
 *
 * Returns daily activity counts for the last 90 days.
 * Used to feed the GitHub-style heatmap component.
 *
 * Returns: Array of { date: string (YYYY-MM-DD), count: number }
 */
export async function GET() {
  try {
    // Calculate date range (last 90 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 89); // 90 days including today

    // Query transactions for activity timestamps in the range
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (txError) {
      throw new Error(`Transactions query failed: ${txError.message}`);
    }

    // Aggregate by date
    const dailyCounts: Map<string, number> = new Map();

    for (const tx of transactions || []) {
      const txDate = format(parseISO(tx.created_at), 'yyyy-MM-dd');
      dailyCounts.set(txDate, (dailyCounts.get(txDate) || 0) + 1);
    }

    // Generate all days in the interval with counts (fill missing days with 0)
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    const result: EngagementData[] = allDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: dateStr,
        count: dailyCounts.get(dateStr) || 0,
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Engagement Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
