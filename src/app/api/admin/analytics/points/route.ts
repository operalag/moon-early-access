import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
 * Admin Analytics Points API
 *
 * Returns points economy breakdown:
 * - breakdown: Array of { reason, distributed, transactions }
 * - totals: Total distributed points and transaction count
 *
 * Only counts positive transactions (points awarded, not deducted).
 */
export async function GET() {
  try {
    // Get all positive transactions grouped by reason
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('reason, amount')
      .gt('amount', 0);

    if (txError) {
      throw new Error(`Transactions query failed: ${txError.message}`);
    }

    // Aggregate by reason
    const reasonMap: Map<string, { distributed: number; transactions: number }> = new Map();

    for (const tx of transactions || []) {
      const existing = reasonMap.get(tx.reason) || { distributed: 0, transactions: 0 };
      reasonMap.set(tx.reason, {
        distributed: existing.distributed + (tx.amount || 0),
        transactions: existing.transactions + 1,
      });
    }

    // Convert to array and sort by distributed DESC
    const breakdown: PointsBreakdown[] = Array.from(reasonMap.entries())
      .map(([reason, data]) => ({
        reason,
        distributed: data.distributed,
        transactions: data.transactions,
      }))
      .sort((a, b) => b.distributed - a.distributed);

    // Calculate totals
    const totals = breakdown.reduce(
      (acc, item) => ({
        distributed: acc.distributed + item.distributed,
        transactions: acc.transactions + item.transactions,
      }),
      { distributed: 0, transactions: 0 }
    );

    const response: PointsData = {
      breakdown,
      totals,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Points Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
