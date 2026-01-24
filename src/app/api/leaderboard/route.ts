import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all_time'; // 'daily', 'weekly', 'all_time'
    const limit = 50;

    let data: any[] = [];
    
    if (period === 'all_time') {
      // Query Profiles (Legacy/Total)
      const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('username, first_name, total_points, avatar_url')
        .order('total_points', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      data = profiles.map(p => ({ ...p, points: p.total_points }));

    } else {
      // Query Buckets (Daily/Weekly)
      let key = '';
      const now = new Date();
      
      if (period === 'daily') {
        // YYYY-MM-DD
        key = now.toISOString().split('T')[0]; 
      } else if (period === 'weekly') {
        // IYYY-"W"IW (Postgres ISO Week format is tricky in JS, let's trust the DB key gen for now)
        // Actually, we can just filter by period_type and order by points for the "current" key.
        // A better approach for the API is to query the *latest* key dynamically or let the client pass it.
        // For MVP, we will query the bucket matching "TODAY" logic from Postgres side or just fetch 'daily' typed rows sorted by date.
      }

      // V2 Approach: Query buckets directly
      // We need to match the specific key (e.g. '2026-01-24')
      // Let's use a Postgres function or a smart query.
      
      const { data: buckets, error } = await supabaseAdmin
        .from('leaderboard_buckets')
        .select(`
           points,
           period_key,
           profiles (username, first_name, avatar_url)
        `)
        .eq('period_type', period)
        .order('period_key', { ascending: false }) // Latest bucket first
        .order('points', { ascending: false })     // Highest score
        .limit(limit);

        // Note: This gets the latest *globally*, effectively showing "Current Leaderboard"
        // We might need to filter by specific date key if we have history.
        // For now, let's assume we want the *latest active period*.
        
        if (error) throw error;
        
        // Filter to ensure we only show the *current* period (top of the list)
        // If we have data from yesterday, we don't want to mix it.
        // Since we ordered by period_key desc, the first rows are the latest period.
        // We should filter explicitly in JS if needed, but for MVP let's trust the sort.
        
        const latestKey = buckets[0]?.period_key;
        const currentBuckets = buckets.filter((b: any) => b.period_key === latestKey);

        data = currentBuckets.map((b: any) => ({
            username: b.profiles?.username,
            first_name: b.profiles?.first_name,
            avatar_url: b.profiles?.avatar_url,
            points: b.points
        }));
    }

    return NextResponse.json({ 
        period, 
        leaderboard: data 
    });

  } catch (error: any) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
