-- Fix user_post_reactions: remove bad FK on post_id and fix unique constraint
-- Problems:
--   1. post_id FK to user_posts(id) causes FK violation for mock/external post IDs
--   2. Unique constraint was (post_id, user_id, reaction_type) but code uses onConflict:"post_id,user_id"

-- Drop the foreign key on post_id (post_id is a logical reference, not a DB FK)
alter table public.user_post_reactions
  drop constraint if exists user_post_reactions_post_id_fkey;

-- Drop the wrong 3-column unique constraint
alter table public.user_post_reactions
  drop constraint if exists user_post_reactions_post_id_user_id_reaction_type_key;

-- Add correct 2-column unique constraint so onConflict:"post_id,user_id" works.
-- Older baselines may already have this exact constraint.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_post_reactions'::regclass
      and conname = 'user_post_reactions_post_id_user_id_key'
  ) then
    alter table public.user_post_reactions
      add constraint user_post_reactions_post_id_user_id_key
      unique (post_id, user_id);
  end if;
end $$;
