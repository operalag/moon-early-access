import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { awardPoints } from '@/lib/pointsEngine';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });

    // 1. Check Idempotency (Has user already received welcome bonus?)
    const { data: existing } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('reason', 'welcome_bonus')
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Welcome bonus already claimed' }, { status: 200 });
    }

    // 2. Award Points (Engine)
    // This updates Profile, Transactions, and Leaderboard Buckets (Daily/Weekly)
    await awardPoints(userId, 1000, 'welcome_bonus');

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Welcome API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
