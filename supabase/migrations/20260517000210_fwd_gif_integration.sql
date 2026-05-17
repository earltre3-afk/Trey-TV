-- FWD x Trey TV GIF integration fields
-- 1. profiles: GIF of the Day
-- 2. user_post_comments: optional GIF attachment (body becomes nullable)
-- 3. direct_messages: gif_fwd_id for cross-app tracking

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles: GIF of the Day
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists gif_of_day_id       text,
  add column if not exists gif_of_day_url      text,
  add column if not exists gif_of_day_poster_url text,
  add column if not exists gif_of_day_provider text,
  add column if not exists gif_of_day_caption  text,
  add column if not exists gif_of_day_set_at   timestamptz;

-- ─────────────────────────────────────────────────────────────────────────────
-- user_post_comments: optional GIF attachment
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.user_post_comments
  add column if not exists gif_id         text,
  add column if not exists gif_url        text,
  add column if not exists gif_poster_url text,
  add column if not exists gif_provider   text,
  add column if not exists gif_fwd_id     text;

-- Make body nullable so GIF-only comments are valid
alter table public.user_post_comments
  alter column body drop not null;

-- Ensure comment has at least a body or a gif_url
alter table public.user_post_comments
  drop constraint if exists comment_body_or_gif_required;

alter table public.user_post_comments
  add constraint comment_body_or_gif_required
  check (
    (body is not null and trim(body) <> '')
    or gif_url is not null
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- direct_messages: FWD GIF cross-reference
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.direct_messages
  add column if not exists gif_fwd_id text;
