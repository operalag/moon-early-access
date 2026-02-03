import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/education/progress
 *
 * Query params:
 * - userId (required): Telegram user ID
 * - moduleId (optional): Specific module ID to fetch
 *
 * Returns:
 * - If moduleId provided: Single progress record or null
 * - If moduleId omitted: Array of all progress records for user
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const moduleId = searchParams.get('moduleId');

  // Validate userId
  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const userIdNum = Number(userId);
  if (isNaN(userIdNum)) {
    return NextResponse.json(
      { error: 'userId must be numeric' },
      { status: 400 }
    );
  }

  try {
    if (moduleId) {
      // Fetch single module progress
      const { data, error } = await supabaseAdmin
        .from('user_education_progress')
        .select('*')
        .eq('user_id', userIdNum)
        .eq('module_id', moduleId)
        .single();

      // PGRST116 is "not found" - not an error, just no data
      if (error && error.code !== 'PGRST116') {
        console.error('Progress fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({ progress: data || null });
    } else {
      // Fetch all progress records for user
      const { data, error } = await supabaseAdmin
        .from('user_education_progress')
        .select('*')
        .eq('user_id', userIdNum)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Progress fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({ progress: data || [] });
    }
  } catch (err) {
    console.error('Unexpected error in GET /api/education/progress:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/education/progress
 *
 * Body:
 * - userId (required): Telegram user ID
 * - moduleId (required): Module identifier
 * - slideIndex (required): Current slide index (0-based)
 *
 * Upserts slide_index for the given user/module combination.
 * Does NOT update completed_at or badge_earned (use /api/education/complete for that).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, moduleId, slideIndex } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!moduleId) {
      return NextResponse.json(
        { error: 'moduleId is required' },
        { status: 400 }
      );
    }

    if (typeof slideIndex !== 'number') {
      return NextResponse.json(
        { error: 'slideIndex must be a number' },
        { status: 400 }
      );
    }

    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'userId must be numeric' },
        { status: 400 }
      );
    }

    // Upsert progress (insert or update on conflict)
    const { data, error } = await supabaseAdmin
      .from('user_education_progress')
      .upsert(
        {
          user_id: userIdNum,
          module_id: moduleId,
          slide_index: slideIndex,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,module_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Progress upsert error:', error);
      return NextResponse.json(
        { error: 'Failed to save progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress: data });
  } catch (err) {
    console.error('Unexpected error in POST /api/education/progress:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
