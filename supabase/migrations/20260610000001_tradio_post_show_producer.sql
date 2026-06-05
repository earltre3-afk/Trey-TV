-- Tradio Post-Show Producer: Pass 10
-- Tables for post-show asset generation, storage, and management

-- 1. tradio_post_show_assets
-- Stores generated and manually edited post-show outputs
CREATE TABLE IF NOT EXISTS tradio_post_show_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id uuid REFERENCES tradio_broadcast_channels(id) ON DELETE SET NULL,
  show_id uuid REFERENCES tradio_shows(id) ON DELETE SET NULL,
  episode_id uuid REFERENCES tradio_show_episodes(id) ON DELETE SET NULL,
  queue_id uuid REFERENCES tradio_broadcast_queue(id) ON DELETE SET NULL,
  recording_id uuid REFERENCES tradio_live_recordings(id) ON DELETE CASCADE,
  clip_id uuid REFERENCES tradio_live_highlight_clips(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  asset_status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'private',
  title text,
  body text NOT NULL,
  platform text,
  tone text,
  language text DEFAULT 'en',
  ai_provider text,
  ai_model text,
  prompt_input jsonb NOT NULL DEFAULT '{}',
  source_snapshot jsonb NOT NULL DEFAULT '{}',
  moderation_snapshot jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tradio_post_show_assets_owner ON tradio_post_show_assets(owner_user_id);
CREATE INDEX idx_tradio_post_show_assets_recording ON tradio_post_show_assets(recording_id);
CREATE INDEX idx_tradio_post_show_assets_clip ON tradio_post_show_assets(clip_id);
CREATE INDEX idx_tradio_post_show_assets_status ON tradio_post_show_assets(asset_status);
CREATE INDEX idx_tradio_post_show_assets_visibility ON tradio_post_show_assets(visibility);

-- 2. tradio_post_show_runs
-- Stores generation run metadata and orchestration
CREATE TABLE IF NOT EXISTS tradio_post_show_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id uuid REFERENCES tradio_broadcast_channels(id) ON DELETE SET NULL,
  show_id uuid REFERENCES tradio_shows(id) ON DELETE SET NULL,
  episode_id uuid REFERENCES tradio_show_episodes(id) ON DELETE SET NULL,
  queue_id uuid REFERENCES tradio_broadcast_queue(id) ON DELETE SET NULL,
  recording_id uuid REFERENCES tradio_live_recordings(id) ON DELETE CASCADE,
  clip_id uuid REFERENCES tradio_live_highlight_clips(id) ON DELETE CASCADE,
  run_status text NOT NULL DEFAULT 'queued',
  run_type text NOT NULL DEFAULT 'post_show_package',
  ai_provider text,
  ai_model text,
  requested_asset_types text[] DEFAULT '{}',
  source_snapshot jsonb NOT NULL DEFAULT '{}',
  output_summary jsonb NOT NULL DEFAULT '{}',
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tradio_post_show_runs_owner ON tradio_post_show_runs(owner_user_id);
CREATE INDEX idx_tradio_post_show_runs_recording ON tradio_post_show_runs(recording_id);
CREATE INDEX idx_tradio_post_show_runs_status ON tradio_post_show_runs(run_status);

-- 3. tradio_post_show_asset_revisions
-- Stores revisions for generated/editable assets
CREATE TABLE IF NOT EXISTS tradio_post_show_asset_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES tradio_post_show_assets(id) ON DELETE CASCADE NOT NULL,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  revision_number integer NOT NULL DEFAULT 1,
  title text,
  body text NOT NULL,
  edit_reason text,
  editor_type text NOT NULL DEFAULT 'human',
  ai_provider text,
  ai_model text,
  prompt_input jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tradio_post_show_asset_revisions_asset ON tradio_post_show_asset_revisions(asset_id);
CREATE INDEX idx_tradio_post_show_asset_revisions_owner ON tradio_post_show_asset_revisions(owner_user_id);

-- Enable RLS on all tables
ALTER TABLE tradio_post_show_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradio_post_show_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradio_post_show_asset_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tradio_post_show_assets
-- Creators can create/read/update their own assets
CREATE POLICY "Users can create post-show assets for own content"
  ON tradio_post_show_assets
  FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can read own post-show assets"
  ON tradio_post_show_assets
  FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR (visibility = 'public' AND asset_status = 'published')
  );

CREATE POLICY "Users can update own post-show assets"
  ON tradio_post_show_assets
  FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can delete own post-show assets"
  ON tradio_post_show_assets
  FOR DELETE
  USING (owner_user_id = auth.uid());

-- Admin can read/review all assets
CREATE POLICY "Admins can read all post-show assets"
  ON tradio_post_show_assets
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for tradio_post_show_runs
-- Creators can manage own runs
CREATE POLICY "Users can create post-show runs"
  ON tradio_post_show_runs
  FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can read own post-show runs"
  ON tradio_post_show_runs
  FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can update own post-show runs"
  ON tradio_post_show_runs
  FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Admin can view all runs
CREATE POLICY "Admins can read all post-show runs"
  ON tradio_post_show_runs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for tradio_post_show_asset_revisions
-- Creators can read/create revisions for own assets
CREATE POLICY "Users can create revisions for own assets"
  ON tradio_post_show_asset_revisions
  FOR INSERT
  WITH CHECK (
    owner_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tradio_post_show_assets
      WHERE tradio_post_show_assets.id = asset_id
      AND tradio_post_show_assets.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read revisions for own assets"
  ON tradio_post_show_asset_revisions
  FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tradio_post_show_assets
      WHERE tradio_post_show_assets.id = asset_id
      AND tradio_post_show_assets.owner_user_id = auth.uid()
    )
  );

-- Admin can read all revisions
CREATE POLICY "Admins can read all revisions"
  ON tradio_post_show_asset_revisions
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Create triggers for updated_at columns
CREATE TRIGGER tradio_set_updated_at_post_show_assets
BEFORE UPDATE ON tradio_post_show_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tradio_set_updated_at_post_show_runs
BEFORE UPDATE ON tradio_post_show_runs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
