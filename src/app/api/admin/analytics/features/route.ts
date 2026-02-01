import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface FeatureUsage {
  feature: string;
  users: number;
  transactions: number;
}

// Map reason codes to friendly names
const REASON_LABELS: Record<string, string> = {
  daily_spin: 'Daily Spin',
  daily_login: 'Daily Login',
  referral: 'Referrals',
  wallet_connect: 'Wallet Connect',
  channel_join: 'Channel Join',
  welcome_bonus: 'Welcome Bonus',
  streak_bonus: 'Streak Bonus',
  referrer_bonus: 'Referrer Bonus',
};

/**
 * Admin Analytics Features API
 *
 * Returns feature usage breakdown by transaction reason.
 * - Counts distinct users per feature
 * - Counts total transactions per feature
 * - Maps internal reason codes to friendly names
 *
 * Returns: Array of { feature: string, users: number, transactions: number }
 */
export async function GET() {
  try {
    // Query all transactions to get reasons
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('user_id, reason');

    if (txError) {
      throw new Error(`Transactions query failed: ${txError.message}`);
    }

    // Aggregate by reason
    const featureStats: Map<string, { users: Set<string>; transactions: number }> = new Map();

    for (const tx of transactions || []) {
      const reason = tx.reason || 'unknown';

      if (!featureStats.has(reason)) {
        featureStats.set(reason, { users: new Set(), transactions: 0 });
      }

      const stats = featureStats.get(reason)!;
      stats.users.add(String(tx.user_id));
      stats.transactions++;
    }

    // Build result array with friendly names
    const result: FeatureUsage[] = [];

    for (const [reason, stats] of featureStats.entries()) {
      result.push({
        feature: REASON_LABELS[reason] || reason,
        users: stats.users.size,
        transactions: stats.transactions,
      });
    }

    // Sort by users DESC
    result.sort((a, b) => b.users - a.users);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Features Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
