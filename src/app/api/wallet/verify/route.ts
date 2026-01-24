import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { awardPoints } from '@/lib/pointsEngine';

export async function POST(request: Request) {
  try {
    const { userId, walletAddress } = await request.json();

    if (!userId || !walletAddress) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // 1. Fetch Profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_wallet_connected, total_points')
      .eq('telegram_id', userId)
      .single();

    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Check if already connected
    if (profile.is_wallet_connected) {
      return NextResponse.json({ success: true, message: 'Already verified' });
    }

    // 3. Mark as Connected (and save address if we had the column)
    // For now, we just flip the boolean as per original spec
    await supabaseAdmin
      .from('profiles')
      .update({ 
        is_wallet_connected: true,
        // ton_wallet_address: walletAddress // Future use
      })
      .eq('telegram_id', userId);

    // 4. Award Points (Engine)
    await awardPoints(userId, 1000, 'wallet_connect', { address: walletAddress });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Wallet Verify Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
