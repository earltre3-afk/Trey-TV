-- RPC used by tranceRoutineService.incrementPlayCount to bump a routine's play count.
create or replace function public.increment_routine_plays(routine_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.trance_routines
     set plays = coalesce(plays, 0) + 1
   where id = increment_routine_plays.routine_id;
$$;
