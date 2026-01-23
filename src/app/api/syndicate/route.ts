import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
    }

    // 1. Fetch Referrals (Admin Read - Bypasses RLS)
    const { data: referrals, error: refError } = await supabaseAdmin
      .from('referrals')
      .select(`
        created_at,
        profiles!referee_id (first_name, username)
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (refError) {
      console.error("Syndicate Read Error:", refError);
      return NextResponse.json({ error: refError.message }, { status: 500 });
    }

    // 2. Fetch Profile for Points verification (Optional consistency check)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('total_points')
      .eq('telegram_id', userId)
      .single();

    return NextResponse.json({ 
      count: referrals.length,
      referrals: referrals,
      total_points: profile?.total_points || 0
    }, { status: 200 });

  } catch (error: any) {
    console.error('Syndicate API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
