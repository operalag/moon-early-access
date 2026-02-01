import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { parseISO } from 'date-fns';

/**
 * Admin Analytics Campaigns API
 *
 * Returns campaign attribution performance data:
 * - campaigns: Array of campaigns with user counts and date ranges
 * - summary: Total campaigns and total attributed users
 *
 * Query params:
 * - from: Start date (YYYY-MM-DD)
 * - to: End date (YYYY-MM-DD)
 */

interface CampaignRow {
  campaign_id: string;
  created_at: string;
}

interface CampaignStats {
  campaign_id: string;
  users: number;
  first_attribution: string;
  last_attribution: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Build query for campaign attributions
    let query = supabaseAdmin
      .from('campaign_attributions')
      .select('campaign_id, created_at')
      .order('created_at', { ascending: true });

    // Apply date filters if provided
    if (fromParam && toParam) {
      const startDate = parseISO(fromParam);
      const endDate = parseISO(toParam);
      query = query
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Campaign attributions query failed: ${error.message}`);
    }

    // Aggregate by campaign_id
    const campaignMap = new Map<string, { users: number; first: string; last: string }>();

    for (const row of (data as CampaignRow[]) || []) {
      const existing = campaignMap.get(row.campaign_id);
      if (existing) {
        existing.users += 1;
        if (row.created_at > existing.last) {
          existing.last = row.created_at;
        }
      } else {
        campaignMap.set(row.campaign_id, {
          users: 1,
          first: row.created_at,
          last: row.created_at,
        });
      }
    }

    // Convert to array and sort by users DESC
    const campaigns: CampaignStats[] = [];
    for (const [campaign_id, stats] of campaignMap.entries()) {
      campaigns.push({
        campaign_id,
        users: stats.users,
        first_attribution: stats.first,
        last_attribution: stats.last,
      });
    }

    campaigns.sort((a, b) => b.users - a.users);

    // Calculate summary
    const summary = {
      total_campaigns: campaigns.length,
      total_attributed_users: data?.length || 0,
    };

    return NextResponse.json({
      campaigns,
      summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Campaigns Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
