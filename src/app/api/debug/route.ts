import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'Missing userId' });

    // 1. Check Profiles (Does Tony exist?)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('telegram_id', userId)
      .single();

    // 2. Check Referrals (Is he a referrer?)
    const { data: referralsAsReferrer } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    // 3. Check Referrals (Is he a referee?)
    const { data: referralAsReferee } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referee_id', userId);

    return NextResponse.json({
      profile,
      referrals_made: referralsAsReferrer,
      referral_received: referralAsReferee
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
