import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { referrerId, refereeId } = await request.json();

    if (!referrerId || !refereeId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const referrerIdNum = Number(referrerId);
    if (isNaN(referrerIdNum)) {
        return NextResponse.json({ error: 'Invalid Referrer ID' }, { status: 400 });
    }

    // 1. Check Idempotency (Admin Read)
    const { data: existing } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referee_id', refereeId)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already referred' }, { status: 200 });
    }

    // 2. Insert Referral (Admin Write - Bypasses RLS)
    const { error: insertError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrerIdNum,
        referee_id: refereeId,
      });

    if (insertError) {
      console.error("Referral Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 3. Reward Points (Admin Write - Bypasses RLS)
    // Fetch current points first
    const { data: referrer } = await supabaseAdmin
        .from('profiles')
        .select('total_points')
        .eq('telegram_id', referrerIdNum)
        .single();

    if (referrer) {
        await supabaseAdmin
            .from('profiles')
            .update({ total_points: (referrer.total_points || 0) + 500 })
            .eq('telegram_id', referrerIdNum);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Referral API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
