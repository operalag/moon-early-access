import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getISOWeek, getISOWeekYear, differenceInDays, parseISO } from 'date-fns';

interface CohortData {
  cohort: string;
  signups: number;
  d1: number;
  d7: number;
  d30: number;
  d1Pct: string;
  d7Pct: string;
  d30Pct: string;
}

/**
 * Admin Analytics Retention API
 *
 * Returns retention data by weekly cohorts.
 * - Groups users by signup week (e.g., "2026-W04")
 * - Calculates D1/D7/D30 retention based on last_active_at
 *
 * Returns: Array of cohort objects with signups and retention percentages
 */
export async function GET() {
  try {
    // Query profiles with created_at and last_active_at
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('created_at, last_active_at')
      .order('created_at', { ascending: true });

    if (profilesError) {
      throw new Error(`Profiles query failed: ${profilesError.message}`);
    }

    // Group users into weekly cohorts
    const cohorts: Map<string, {
      signups: number;
      d1: number;
      d7: number;
      d30: number;
      cohortStartDate: Date;
    }> = new Map();

    const now = new Date();

    for (const profile of profiles || []) {
      const createdAt = parseISO(profile.created_at);
      const lastActiveAt = profile.last_active_at ? parseISO(profile.last_active_at) : null;

      // Generate cohort key (e.g., "2026-W04")
      const week = getISOWeek(createdAt);
      const year = getISOWeekYear(createdAt);
      const cohortKey = `${year}-W${week.toString().padStart(2, '0')}`;

      // Initialize cohort if new
      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, {
          signups: 0,
          d1: 0,
          d7: 0,
          d30: 0,
          cohortStartDate: createdAt,
        });
      }

      const cohort = cohorts.get(cohortKey)!;
      cohort.signups++;

      // Calculate retention if user was active after signup
      if (lastActiveAt) {
        const daysSinceSignup = differenceInDays(lastActiveAt, createdAt);

        // D1: Active 1+ days after signup
        if (daysSinceSignup >= 1) {
          cohort.d1++;
        }

        // D7: Active 7+ days after signup
        if (daysSinceSignup >= 7) {
          cohort.d7++;
        }

        // D30: Active 30+ days after signup
        if (daysSinceSignup >= 30) {
          cohort.d30++;
        }
      }
    }

    // Build result array
    const result: CohortData[] = [];

    for (const [cohortKey, data] of cohorts.entries()) {
      const cohortAge = differenceInDays(now, data.cohortStartDate);

      // Calculate percentages (only for cohorts old enough for each metric)
      const d1Pct = data.signups > 0
        ? (data.d1 / data.signups * 100).toFixed(1)
        : '0.0';
      const d7Pct = data.signups > 0 && cohortAge >= 7
        ? (data.d7 / data.signups * 100).toFixed(1)
        : null;
      const d30Pct = data.signups > 0 && cohortAge >= 30
        ? (data.d30 / data.signups * 100).toFixed(1)
        : null;

      result.push({
        cohort: cohortKey,
        signups: data.signups,
        d1: data.d1,
        d7: data.d7,
        d30: data.d30,
        d1Pct,
        d7Pct: d7Pct || 'N/A',
        d30Pct: d30Pct || 'N/A',
      });
    }

    // Sort by cohort (chronological order)
    result.sort((a, b) => a.cohort.localeCompare(b.cohort));

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Retention Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
