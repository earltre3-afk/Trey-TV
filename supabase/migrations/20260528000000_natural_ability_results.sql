-- ─────────────────────────────────────────────────────────────────────────────
-- Natural Ability Signal Test results table, policies, and immutability guard
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.natural_ability_results (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade unique,
  primary_ability     text not null,
  secondary_ability   text not null,
  signal_blend        text not null,
  signal_strength     text not null,
  answer_snapshot     jsonb not null default '[]'::jsonb,
  badge_slug          text not null,
  badge_label         text not null,
  badge_symbol        text not null,
  badge_glow          text not null,
  feed_name_preview   text not null,
  privacy_mode        text not null default 'public' check (privacy_mode in ('public', 'profile', 'private')),
  show_on_profile     boolean not null default true,
  show_in_feed        boolean not null default true,
  badge_activated_at  timestamptz not null default now(),
  completed_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Index user_id for faster single lookups
create index if not exists idx_natural_ability_results_user on public.natural_ability_results(user_id);

-- Enable RLS
alter table public.natural_ability_results enable row level security;

-- SELECT: Owner can read their own row, admins can read all, others can read only if public/profile visibility allowed
drop policy if exists "natural_ability_results_select" on public.natural_ability_results;
create policy "natural_ability_results_select"
  on public.natural_ability_results for select
  using (
    auth.uid() = user_id 
    or privacy_mode in ('public', 'profile') 
    or public.is_admin(auth.uid())
  );

-- INSERT: User can insert their own row once (unique constraint prevents duplicates)
drop policy if exists "natural_ability_results_insert" on public.natural_ability_results;
create policy "natural_ability_results_insert"
  on public.natural_ability_results for insert
  with check (auth.uid() = user_id);

-- UPDATE: User can update their own row (trigger below prevents modifying core test results)
drop policy if exists "natural_ability_results_update" on public.natural_ability_results;
create policy "natural_ability_results_update"
  on public.natural_ability_results for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger to enforce Natural Ability immutability (except for visibility controls and updated_at)
create or replace function public.check_natural_ability_immutability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.primary_ability <> new.primary_ability or
     old.secondary_ability <> new.secondary_ability or
     old.signal_blend <> new.signal_blend or
     old.signal_strength <> new.signal_strength or
     old.answer_snapshot <> new.answer_snapshot or
     old.badge_slug <> new.badge_slug or
     old.badge_label <> new.badge_label or
     old.badge_symbol <> new.badge_symbol or
     old.badge_glow <> new.badge_glow or
     old.feed_name_preview <> new.feed_name_preview or
     old.completed_at <> new.completed_at or
     old.created_at <> new.created_at then
    raise exception 'Natural Ability result identity is immutable. Only visibility fields (privacy_mode, show_on_profile, show_in_feed) and updated_at can be updated.' using errcode = '42501';
  end if;
  return new;
end $$;

drop trigger if exists enforce_natural_ability_immutability on public.natural_ability_results;
create trigger enforce_natural_ability_immutability
  before update on public.natural_ability_results
  for each row execute function public.check_natural_ability_immutability();
