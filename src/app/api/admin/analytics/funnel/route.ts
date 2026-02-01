import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface FunnelStage {
  name: string;
  value: number;
  fill: string;
}

interface FunnelData {
  stages: FunnelStage[];
  conversionRates: {
    toChannel: string;
    toWallet: string;
  };
}

/**
 * Admin Analytics Funnel API
 *
 * Returns wallet conversion funnel data:
 * - stages: Array of funnel stages with counts and colors
 * - conversionRates: Conversion percentages between stages
 *
 * Funnel stages:
 * 1. Total Users - All registered users
 * 2. Channel Joined - Users who joined the Telegram channel
 * 3. Wallet Connected - Users who connected their TON wallet
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

    // 2. Count users who joined channel
    const { count: channelJoined, error: channelError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('has_joined_channel', true);

    if (channelError) {
      throw new Error(`Channel query failed: ${channelError.message}`);
    }

    // 3. Count users with wallet connected
    const { count: walletConnected, error: walletError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_wallet_connected', true);

    if (walletError) {
      throw new Error(`Wallet query failed: ${walletError.message}`);
    }

    const total = totalUsers || 0;
    const channel = channelJoined || 0;
    const wallet = walletConnected || 0;

    // Calculate conversion rates
    const toChannel = total > 0 ? ((channel / total) * 100).toFixed(1) : '0.0';
    const toWallet = channel > 0 ? ((wallet / channel) * 100).toFixed(1) : '0.0';

    const response: FunnelData = {
      stages: [
        { name: 'Total Users', value: total, fill: '#3b82f6' },
        { name: 'Channel Joined', value: channel, fill: '#8b5cf6' },
        { name: 'Wallet Connected', value: wallet, fill: '#22c55e' },
      ],
      conversionRates: {
        toChannel,
        toWallet,
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Funnel Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
