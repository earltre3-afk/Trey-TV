-- Tradio Broadcast Studio Pass 12: Distribution Desk
-- Private creator draft queue for platform-specific social/newsletter/push/website copy.
-- This table never represents a send/post/publish event; it stores drafts, review state,
-- copy usage, and reminder metadata only.

CREATE TABLE IF NOT EXISTS public.tradio_distribution_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid REFERENCES public.tradio_post_show_assets(id) ON DELETE SET NULL,
  application_id uuid REFERENCES public.tradio_post_show_applications(id) ON DELETE SET NULL,
  clip_id uuid REFERENCES public.tradio_live_highlight_clips(id) ON DELETE SET NULL,
  recording_id uuid REFERENCES public.tradio_live_recordings(id) ON DELETE SET NULL,
  episode_id uuid REFERENCES public.tradio_show_episodes(id) ON DELETE SET NULL,
  queue_id uuid REFERENCES public.tradio_broadcast_queue(id) ON DELETE SET NULL,
  channel_id uuid REFERENCES public.tradio_broadcast_channels(id) ON DELETE SET NULL,
  draft_type text NOT NULL CHECK (
    draft_type IN (
      'tiktok_caption',
      'instagram_caption',
      'instagram_story',
      'youtube_description',
      'youtube_shorts_caption',
      'facebook_post',
      'x_post',
      'newsletter_blurb',
      'push_notification',
      'website_promo',
      'generic_social',
      'creator_note'
    )
  ),
  draft_status text NOT NULL DEFAULT 'draft' CHECK (
    draft_status IN (
      'draft',
      'edited',
      'ready',
      'pending_review',
      'approved',
      'rejected',
      'archived',
      'used'
    )
  ),
  platform text NOT NULL DEFAULT 'generic' CHECK (
    platform IN (
      'tiktok',
      'instagram',
      'youtube',
      'facebook',
      'x',
      'newsletter',
      'push',
      'website',
      'generic'
    )
  ),
  title text,
  body text NOT NULL,
  call_to_action text,
  scheduled_for timestamptz,
  reminder_status text NOT NULL DEFAULT 'not_scheduled' CHECK (
    reminder_status IN (
      'not_scheduled',
      'scheduled',
      'reminded',
      'canceled',
      'expired'
    )
  ),
  copied_count integer NOT NULL DEFAULT 0 CHECK (copied_count >= 0),
  last_copied_at timestamptz,
  review_notes text,
  moderation_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_owner
  ON public.tradio_distribution_drafts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_asset
  ON public.tradio_distribution_drafts(asset_id);
CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_application
  ON public.tradio_distribution_drafts(application_id);
CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_clip
  ON public.tradio_distribution_drafts(clip_id);
CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_episode
  ON public.tradio_distribution_drafts(episode_id);
CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_recording
  ON public.tradio_distribution_drafts(recording_id);
CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_review
  ON public.tradio_distribution_drafts(draft_status, platform, draft_type);
CREATE INDEX IF NOT EXISTS idx_tradio_distribution_drafts_reminders
  ON public.tradio_distribution_drafts(reminder_status, scheduled_for)
  WHERE reminder_status = 'scheduled';

ALTER TABLE public.tradio_distribution_drafts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tradio_distribution_drafts TO authenticated;
GRANT ALL ON public.tradio_distribution_drafts TO service_role;

CREATE POLICY "Creators can create own distribution drafts"
  ON public.tradio_distribution_drafts
  FOR INSERT
  WITH CHECK (
    owner_user_id = auth.uid()
    AND (
      asset_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.tradio_post_show_assets a
        WHERE a.id = asset_id
          AND a.owner_user_id = auth.uid()
      )
    )
    AND (
      application_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.tradio_post_show_applications app
        WHERE app.id = application_id
          AND app.owner_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators can read own distribution drafts"
  ON public.tradio_distribution_drafts
  FOR SELECT
  USING (
    owner_user_id = auth.uid()
    OR (
      asset_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.tradio_post_show_assets a
        WHERE a.id = asset_id
          AND a.owner_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators can update own distribution drafts"
  ON public.tradio_distribution_drafts
  FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Creators can delete own distribution drafts"
  ON public.tradio_distribution_drafts
  FOR DELETE
  USING (owner_user_id = auth.uid());

CREATE POLICY "Admins can read all distribution drafts"
  ON public.tradio_distribution_drafts
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all distribution drafts"
  ON public.tradio_distribution_drafts
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER tradio_set_updated_at_distribution_drafts
BEFORE UPDATE ON public.tradio_distribution_drafts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
