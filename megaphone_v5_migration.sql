-- PROJECT MEGAPHONE MIGRATION
-- Version: 5.0.0
-- Description: Add notification preferences and activity tracking to profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_push_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Index for performance on the cron query
CREATE INDEX IF NOT EXISTS idx_profiles_notif_query 
ON public.profiles (is_push_enabled, last_active_at, last_notified_at);
