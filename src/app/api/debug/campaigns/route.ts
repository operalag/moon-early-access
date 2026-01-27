import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const userId = searchParams.get('userId');

    // Mode 1: Get attribution for specific user
    if (userId) {
      const userIdNum = Number(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from('campaign_attributions')
        .select('user_id, campaign_id, created_at')
        .eq('user_id', userIdNum)
        .single();

      if (error && error.code === 'PGRST116') {
        // No attribution found
        return NextResponse.json({
          user_id: userIdNum,
          campaign_id: null,
          created_at: null
        });
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        user_id: data.user_id,
        campaign_id: data.campaign_id,
        created_at: data.created_at
      });
    }

    // Mode 2: Get all users for specific campaign
    if (campaignId) {
      const { data, error } = await supabaseAdmin
        .from('campaign_attributions')
        .select('user_id, created_at')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        campaign_id: campaignId,
        users: data || []
      });
    }

    // Mode 3: Get aggregated stats (no params)
    const { data, error } = await supabaseAdmin
      .from('campaign_attributions')
      .select('campaign_id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate by campaign
    const byCampaign: { [key: string]: number } = {};
    for (const row of data || []) {
      byCampaign[row.campaign_id] = (byCampaign[row.campaign_id] || 0) + 1;
    }

    return NextResponse.json({
      total_attributions: data?.length || 0,
      by_campaign: byCampaign
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
