-- PROJECT SCOREBOARD MIGRATION
-- Version: 4.0.0
-- Description: Ledger-based points system with daily/weekly buckets

-- 1. Transactions Table (The Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id bigint REFERENCES public.profiles(telegram_id) NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Leaderboard Buckets (Aggregated Stats)
CREATE TABLE IF NOT EXISTS public.leaderboard_buckets (
  user_id bigint REFERENCES public.profiles(telegram_id) NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'season')),
  period_key text NOT NULL, -- e.g., '2026-01-23' or '2026-W04'
  points integer DEFAULT 0 NOT NULL,
  last_updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, period_type, period_key)
);

-- 3. The Atomic Award Function
-- This function ensures data consistency across all tables
CREATE OR REPLACE FUNCTION public.award_points_v2(
  p_user_id bigint,
  p_amount integer,
  p_reason text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with Admin privileges
AS $$
DECLARE
  v_new_total integer;
  v_daily_key text;
  v_weekly_key text;
BEGIN
  -- Generate Keys
  v_daily_key := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  v_weekly_key := to_char(now() AT TIME ZONE 'UTC', 'IYYY-"W"IW'); -- e.g., 2026-W04

  -- 1. Insert Transaction Log
  INSERT INTO public.transactions (user_id, amount, reason, metadata)
  VALUES (p_user_id, p_amount, p_reason, p_metadata);

  -- 2. Update Master Profile
  UPDATE public.profiles
  SET total_points = COALESCE(total_points, 0) + p_amount
  WHERE telegram_id = p_user_id
  RETURNING total_points INTO v_new_total;

  -- 3. Update Daily Bucket
  INSERT INTO public.leaderboard_buckets (user_id, period_type, period_key, points)
  VALUES (p_user_id, 'daily', v_daily_key, p_amount)
  ON CONFLICT (user_id, period_type, period_key)
  DO UPDATE SET 
    points = leaderboard_buckets.points + p_amount,
    last_updated_at = now();

  -- 4. Update Weekly Bucket
  INSERT INTO public.leaderboard_buckets (user_id, period_type, period_key, points)
  VALUES (p_user_id, 'weekly', v_weekly_key, p_amount)
  ON CONFLICT (user_id, period_type, period_key)
  DO UPDATE SET 
    points = leaderboard_buckets.points + p_amount,
    last_updated_at = now();

  RETURN v_new_total;
END;
$$;

-- 4. RLS Policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_buckets ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE telegram_id = user_id));

-- Allow users to see the daily/weekly rankings
CREATE POLICY "Public can view buckets" ON public.leaderboard_buckets
  FOR SELECT USING (true);
