-- User Education Progress Table
-- Tracks user progress through education modules (slide position, completion, badges)

CREATE TABLE public.user_education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL,
  module_id TEXT NOT NULL,
  slide_index INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  badge_earned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One progress record per user per module
  CONSTRAINT user_education_progress_user_module_key UNIQUE (user_id, module_id)
);

-- Index for user progress queries (most common pattern)
CREATE INDEX idx_user_education_progress_user_id ON public.user_education_progress(user_id);

-- Index for completion analytics queries
CREATE INDEX idx_user_education_progress_completed ON public.user_education_progress(completed_at) WHERE completed_at IS NOT NULL;

-- Enable RLS (admin-only access via service role)
ALTER TABLE public.user_education_progress ENABLE ROW LEVEL SECURITY;

-- No public policies - all access via supabaseAdmin (service role)
-- This ensures only server-side API can read/write education progress data
