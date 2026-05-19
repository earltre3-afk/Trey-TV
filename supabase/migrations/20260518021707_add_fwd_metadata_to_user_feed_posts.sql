alter table public.user_feed_posts
  add column if not exists source_type text not null default 'trey',
  add column if not exists gif_fwd_id text,
  add column if not exists gif_poster_url text,
  add column if not exists gif_title text;

create index if not exists idx_user_feed_posts_source_created
  on public.user_feed_posts(source_type, created_at desc);
