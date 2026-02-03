import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { awardPoints } from '@/lib/pointsEngine';

/**
 * POST /api/education/complete
 *
 * Body:
 * - userId (required): Telegram user ID
 * - moduleId (required): Module identifier
 * - pointsAmount (required): Points to award
 * - badgeId (required): Badge identifier to record
 *
 * Marks a module as complete and awards points.
 * Idempotent: calling twice won't double-award points.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, moduleId, pointsAmount, badgeId } = body;

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

    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'userId must be numeric' },
        { status: 400 }
      );
    }

    // Check if already completed (idempotency check)
    const { data: existingProgress, error: fetchError } = await supabaseAdmin
      .from('user_education_progress')
      .select('completed_at')
      .eq('user_id', userIdNum)
      .eq('module_id', moduleId)
      .single();

    // PGRST116 is "not found" - that's fine, means no existing record
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Progress fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check existing progress' },
        { status: 500 }
      );
    }

    // If already completed, return success without awarding points again
    if (existingProgress?.completed_at) {
      return NextResponse.json({
        success: true,
        message: 'Already completed',
        alreadyCompleted: true,
      });
    }

    // Mark module as complete
    const now = new Date().toISOString();
    const { data: progressData, error: upsertError } = await supabaseAdmin
      .from('user_education_progress')
      .upsert(
        {
          user_id: userIdNum,
          module_id: moduleId,
          completed_at: now,
          badge_earned: true,
          updated_at: now,
        },
        {
          onConflict: 'user_id,module_id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Progress upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to mark module complete' },
        { status: 500 }
      );
    }

    // Award points (wrapped in try/catch - points are secondary to completion tracking)
    let newPoints: number | null = null;
    try {
      if (pointsAmount && pointsAmount > 0) {
        newPoints = await awardPoints(userIdNum, pointsAmount, 'education_complete', {
          module_id: moduleId,
          badge_id: badgeId,
        });
      }
    } catch (pointsError) {
      // Log but don't fail the request - completion tracking is primary
      console.error('Points award error (non-fatal):', pointsError);
    }

    return NextResponse.json({
      success: true,
      progress: progressData,
      newPoints,
    });
  } catch (err) {
    console.error('Unexpected error in POST /api/education/complete:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
