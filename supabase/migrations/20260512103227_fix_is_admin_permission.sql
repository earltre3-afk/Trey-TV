-- Fix permission denied for function is_admin in RLS policies
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to anon;
grant execute on function public.is_owner(uuid) to authenticated;
grant execute on function public.is_owner(uuid) to anon;
