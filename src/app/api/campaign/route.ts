import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { campaignId, userId } = await request.json();

    // Validate required parameters
    if (!campaignId || userId === undefined || userId === null) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Validate campaignId is non-empty string
    if (typeof campaignId !== 'string' || campaignId.trim() === '') {
      return NextResponse.json({ error: 'Invalid campaignId' }, { status: 400 });
    }

    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // 1. Check Idempotency (Admin Read)
    const { data: existing } = await supabaseAdmin
      .from('campaign_attributions')
      .select('id')
      .eq('user_id', userIdNum)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already attributed' }, { status: 200 });
    }

    // 2. Insert Attribution (Admin Write - Bypasses RLS)
    const { error: insertError } = await supabaseAdmin
      .from('campaign_attributions')
      .insert({
        user_id: userIdNum,
        campaign_id: campaignId.trim(),
      });

    if (insertError) {
      // Handle duplicate key violation as success (idempotent)
      if (insertError.code === '23505') {
        return NextResponse.json({ message: 'Already attributed' }, { status: 200 });
      }
      console.error("Campaign Attribution Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Campaign API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
