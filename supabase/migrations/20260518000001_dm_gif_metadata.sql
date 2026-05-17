-- Extend direct_messages with per-GIF display metadata so GIF messages
-- render correctly (poster thumbnail, title) after page reload.
-- message_type='gif' is used to distinguish FWD GIFs from plain image attachments.

alter table public.direct_messages
  add column if not exists gif_poster_url text,
  add column if not exists gif_title      text;
