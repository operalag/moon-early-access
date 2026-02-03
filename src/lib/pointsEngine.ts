import { supabaseAdmin } from './supabaseAdmin';

export type PointReason =
  | 'referral'
  | 'daily_spin'
  | 'daily_login'
  | 'wallet_connect'
  | 'channel_join'
  | 'prediction_win'
  | 'admin_adjustment'
  | 'welcome_bonus'
  | 'education_complete';

/**
 * The Centralized Points Engine
 * This should ONLY be called from Server-Side logic (API routes).
 */
export async function awardPoints(
  userId: number | string,
  amount: number,
  reason: PointReason,
  metadata: Record<string, any> = {}
) {
  const userIdNum = Number(userId);
  if (isNaN(userIdNum)) throw new Error("Invalid User ID");

  // Call the Postgres function we created in the migration
  const { data, error } = await supabaseAdmin.rpc('award_points_v2', {
    p_user_id: userIdNum,
    p_amount: amount,
    p_reason: reason,
    p_metadata: metadata
  });

  if (error) {
    console.error(`Points Engine Error [${reason}]:`, error);
    throw error;
  }

  return data as number; // Returns the new total points
}
