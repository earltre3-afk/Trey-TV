-- Tradio Broadcast Studio Pass 13: Campaign Intelligence
-- Private performance ledger for truthful Tradio events and creator-entered
-- external metrics. Raw campaign rows are never public-readable.

create table if not exists public.tradio_campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  channel_id uuid references public.tradio_broadcast_channels(id) on delete set null,
  clip_id uuid references public.tradio_live_highlight_clips(id) on delete cascade,
  recording_id uuid references public.tradio_live_recordings(id) on delete set null,
  asset_id uuid references public.tradio_post_show_assets(id) on delete set null,
  application_id uuid references public.tradio_post_show_applications(id) on delete set null,
  distribution_draft_id uuid references public.tradio_distribution_drafts(id) on delete set null,
  metric_source text not null default 'tradio' check (
    metric_source in (
      'tradio',
      'creator_manual',
      'internal_player',
      'public_replay',
      'distribution_desk',
      'prescribe_me'
    )
  ),
  platform text not null default 'tradio',
  metric_type text not null check (
    metric_type in (
      'draft_copied',
      'draft_marked_used',
      'clip_play',
      'replay_play',
      'completion_rate',
      'reaction_count',
      'chat_spike',
      'poll_engagement',
      'follower_gain',
      'manual_views',
      'manual_likes',
      'manual_comments',
      'manual_shares',
      'manual_saves',
      'manual_clicks',
      'prescribe_me_signal',
      'tag_performance_score'
    )
  ),
  metric_value numeric not null default 0 check (metric_value >= 0),
  metric_unit text,
  entered_manually boolean not null default false,
  source_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (entered_manually = true and metric_source = 'creator_manual')
    or (entered_manually = false and metric_source <> 'creator_manual')
  ),
  check (entered_manually = false or source_snapshot = '{}'::jsonb)
);

create index if not exists idx_tradio_campaign_metrics_owner
  on public.tradio_campaign_metrics(owner_user_id, measured_at desc);
create index if not exists idx_tradio_campaign_metrics_channel
  on public.tradio_campaign_metrics(channel_id, measured_at desc);
create index if not exists idx_tradio_campaign_metrics_clip
  on public.tradio_campaign_metrics(clip_id, measured_at desc)
  where clip_id is not null;
create index if not exists idx_tradio_campaign_metrics_draft
  on public.tradio_campaign_metrics(distribution_draft_id, measured_at desc)
  where distribution_draft_id is not null;
create index if not exists idx_tradio_campaign_metrics_reporting
  on public.tradio_campaign_metrics(owner_user_id, platform, metric_type, measured_at desc);

alter table public.tradio_campaign_metrics enable row level security;

grant select, insert, update, delete on public.tradio_campaign_metrics to authenticated;
grant all on public.tradio_campaign_metrics to service_role;

create policy "Creators can read own campaign metrics"
  on public.tradio_campaign_metrics
  for select
  to authenticated
  using ((select auth.uid()) = owner_user_id);

create policy "Creators can create own manual campaign metrics"
  on public.tradio_campaign_metrics
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_user_id
    and entered_manually = true
    and metric_source = 'creator_manual'
    and source_snapshot = '{}'::jsonb
    and (
      channel_id is null
      or exists (
        select 1
        from public.tradio_broadcast_channels channel_row
        where channel_row.id = channel_id
          and channel_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      clip_id is null
      or exists (
        select 1
        from public.tradio_live_highlight_clips clip_row
        where clip_row.id = clip_id
          and clip_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      recording_id is null
      or exists (
        select 1
        from public.tradio_live_recordings recording_row
        where recording_row.id = recording_id
          and recording_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      asset_id is null
      or exists (
        select 1
        from public.tradio_post_show_assets asset_row
        where asset_row.id = asset_id
          and asset_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      application_id is null
      or exists (
        select 1
        from public.tradio_post_show_applications application_row
        where application_row.id = application_id
          and application_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      distribution_draft_id is null
      or exists (
        select 1
        from public.tradio_distribution_drafts draft_row
        where draft_row.id = distribution_draft_id
          and draft_row.owner_user_id = (select auth.uid())
      )
    )
  );

create policy "Creators can update own manual campaign metrics"
  on public.tradio_campaign_metrics
  for update
  to authenticated
  using (
    (select auth.uid()) = owner_user_id
    and entered_manually = true
  )
  with check (
    (select auth.uid()) = owner_user_id
    and entered_manually = true
    and metric_source = 'creator_manual'
    and source_snapshot = '{}'::jsonb
    and (
      channel_id is null
      or exists (
        select 1
        from public.tradio_broadcast_channels channel_row
        where channel_row.id = channel_id
          and channel_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      clip_id is null
      or exists (
        select 1
        from public.tradio_live_highlight_clips clip_row
        where clip_row.id = clip_id
          and clip_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      recording_id is null
      or exists (
        select 1
        from public.tradio_live_recordings recording_row
        where recording_row.id = recording_id
          and recording_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      asset_id is null
      or exists (
        select 1
        from public.tradio_post_show_assets asset_row
        where asset_row.id = asset_id
          and asset_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      application_id is null
      or exists (
        select 1
        from public.tradio_post_show_applications application_row
        where application_row.id = application_id
          and application_row.owner_user_id = (select auth.uid())
      )
    )
    and (
      distribution_draft_id is null
      or exists (
        select 1
        from public.tradio_distribution_drafts draft_row
        where draft_row.id = distribution_draft_id
          and draft_row.owner_user_id = (select auth.uid())
      )
    )
  );

create policy "Creators can delete own manual campaign metrics"
  on public.tradio_campaign_metrics
  for delete
  to authenticated
  using (
    (select auth.uid()) = owner_user_id
    and entered_manually = true
  );

create policy "Admins can read all campaign metrics"
  on public.tradio_campaign_metrics
  for select
  to authenticated
  using (public.is_admin((select auth.uid())));

drop trigger if exists tradio_set_updated_at_campaign_metrics
  on public.tradio_campaign_metrics;
create trigger tradio_set_updated_at_campaign_metrics
  before update on public.tradio_campaign_metrics
  for each row execute function update_updated_at_column();
