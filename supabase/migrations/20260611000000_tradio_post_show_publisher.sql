-- Tradio Broadcast Studio Pass 11: Post-Show Publisher
-- Application records connect approved creator-reviewed post-show assets to clips,
-- episodes, draft copy lanes, and safe Prescribe Me metadata without auto-publishing.

CREATE TABLE IF NOT EXISTS public.tradio_post_show_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id uuid REFERENCES public.tradio_post_show_assets(id) ON DELETE CASCADE NOT NULL,
  clip_id uuid REFERENCES public.tradio_live_highlight_clips(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES public.tradio_live_recordings(id) ON DELETE SET NULL,
  episode_id uuid REFERENCES public.tradio_show_episodes(id) ON DELETE SET NULL,
  queue_id uuid REFERENCES public.tradio_broadcast_queue(id) ON DELETE SET NULL,
  channel_id uuid REFERENCES public.tradio_broadcast_channels(id) ON DELETE SET NULL,
  application_type text NOT NULL CHECK (
    application_type IN (
      'clip_title',
      'clip_caption',
      'replay_blurb',
      'episode_description',
      'social_draft',
      'newsletter_draft',
      'push_copy_draft',
      'seo_description',
      'thumbnail_prompt',
      'cover_prompt',
      'prescribe_me_metadata'
    )
  ),
  application_status text NOT NULL DEFAULT 'draft' CHECK (
    application_status IN (
      'draft',
      'applied',
      'pending_review',
      'approved',
      'rejected',
      'reverted',
      'archived'
    )
  ),
  target_field text,
  previous_value text,
  applied_value text NOT NULL,
  applied_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tradio_post_show_applications_owner
  ON public.tradio_post_show_applications(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_tradio_post_show_applications_asset
  ON public.tradio_post_show_applications(asset_id);
CREATE INDEX IF NOT EXISTS idx_tradio_post_show_applications_clip
  ON public.tradio_post_show_applications(clip_id);
CREATE INDEX IF NOT EXISTS idx_tradio_post_show_applications_episode
  ON public.tradio_post_show_applications(episode_id);
CREATE INDEX IF NOT EXISTS idx_tradio_post_show_applications_recording
  ON public.tradio_post_show_applications(recording_id);
CREATE INDEX IF NOT EXISTS idx_tradio_post_show_applications_review
  ON public.tradio_post_show_applications(application_status, application_type);

ALTER TABLE public.tradio_post_show_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own post-show applications"
  ON public.tradio_post_show_applications
  FOR INSERT
  WITH CHECK (
    owner_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.tradio_post_show_assets a
      WHERE a.id = asset_id
        AND a.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own post-show applications"
  ON public.tradio_post_show_applications
  FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can update own post-show applications"
  ON public.tradio_post_show_applications
  FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can delete own post-show applications"
  ON public.tradio_post_show_applications
  FOR DELETE
  USING (owner_user_id = auth.uid());

CREATE POLICY "Admins can read all post-show applications"
  ON public.tradio_post_show_applications
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all post-show applications"
  ON public.tradio_post_show_applications
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER tradio_set_updated_at_post_show_applications
BEFORE UPDATE ON public.tradio_post_show_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
