-- Campaign Attributions Table
-- Tracks which marketing campaign brought each user to the app (first touch attribution)

CREATE TABLE public.campaign_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL,
  campaign_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One attribution per user (first touch wins)
  CONSTRAINT campaign_attributions_user_id_key UNIQUE (user_id)
);

-- Index for campaign analytics queries
CREATE INDEX idx_campaign_attributions_campaign_id ON public.campaign_attributions(campaign_id);

-- Enable RLS (admin-only access via service role)
ALTER TABLE public.campaign_attributions ENABLE ROW LEVEL SECURITY;

-- No public policies - all access via supabaseAdmin (service role)
-- This ensures only server-side API can read/write attribution data
