import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Admin Analytics Overview API
 *
 * Returns key metrics for the admin dashboard:
 * - totalUsers: Total number of profiles
 * - walletsConnected: Profiles with wallet connected
 * - walletConversionRate: Percentage of users with wallet
 * - totalPointsDistributed: Sum of all positive transactions
 * - totalReferrals: Count of successful referrals
 */
export async function GET() {
  try {
    // 1. Count total users
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      throw new Error(`Users query failed: ${usersError.message}`);
    }

    // 2. Count wallets connected
    const { count: walletsConnected, error: walletsError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_wallet_connected', true);

    if (walletsError) {
      throw new Error(`Wallets query failed: ${walletsError.message}`);
    }

    // 3. Calculate wallet conversion rate
    const walletConversionRate =
      totalUsers && totalUsers > 0
        ? ((walletsConnected || 0) / totalUsers * 100).toFixed(1)
        : '0.0';

    // 4. Sum total points distributed (positive transactions only)
    const { data: pointsData, error: pointsError } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .gt('amount', 0);

    if (pointsError) {
      throw new Error(`Points query failed: ${pointsError.message}`);
    }

    const totalPointsDistributed = pointsData?.reduce(
      (sum, tx) => sum + (tx.amount || 0),
      0
    ) || 0;

    // 5. Count total referrals
    const { count: totalReferrals, error: referralsError } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    if (referralsError) {
      throw new Error(`Referrals query failed: ${referralsError.message}`);
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      walletsConnected: walletsConnected || 0,
      walletConversionRate,
      totalPointsDistributed,
      totalReferrals: totalReferrals || 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Overview Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
