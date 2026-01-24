import { NextResponse } from 'next/server';
import { awardPoints } from '@/lib/pointsEngine';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json();

    if (!userId || !amount) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    // 1. Call the Engine
    const newTotal = await awardPoints(userId, amount, 'admin_adjustment', { manual: true });

    // 2. Verify Data (For debugging feedback)
    const { data: tx } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: bucket } = await supabaseAdmin
      .from('leaderboard_buckets')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', 'daily')
      .limit(1)
      .single();

    return NextResponse.json({ 
      success: true, 
      newTotal,
      details: {
        last_transaction: tx,
        daily_bucket: bucket
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
