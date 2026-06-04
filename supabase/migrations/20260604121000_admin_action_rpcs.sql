-- 20260604121000_admin_action_rpcs.sql
-- Privileged admin mutations: permission re-check + mutation + audit in one txn.

create or replace function public._admin_write_audit(
  p_actor uuid, p_actor_role text, p_action text,
  p_target_type text, p_target_id text, p_before jsonb, p_after jsonb, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_prev text; v_now timestamptz := now(); v_payload text; v_hash text;
begin
  select row_hash into v_prev from public.admin_audit_log
    where row_hash is not null order by seq desc limit 1;
  v_payload := public.admin_audit_payload(p_actor, p_action, p_target_type, p_target_id, p_before, p_after, v_now);
  v_hash := public.admin_audit_hash(v_prev, v_payload);
  insert into public.admin_audit_log
    (admin_user_id, action, target_type, target_id, reason, actor_role,
     "before", "after", prev_hash, row_hash, created_at)
  values (p_actor, p_action, p_target_type, p_target_id, p_reason, p_actor_role,
          p_before, p_after, v_prev, v_hash, v_now);
end $$;

create or replace function public.admin_set_user_status(
  p_actor uuid, p_target uuid, p_status text, p_reason text, p_days int default null)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_before jsonb; v_after public.profiles; v_until timestamptz;
begin
  if not public.has_admin_permission(p_actor, 'users.ban') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_status not in ('active','suspended','banned') then
    raise exception 'bad status' using errcode = '22023';
  end if;
  select to_jsonb(p.*) into v_before from public.profiles p where p.id = p_target;
  if v_before is null then raise exception 'not found' using errcode = 'P0002'; end if;
  v_until := case when p_days is not null then now() + make_interval(days => p_days) end;
  update public.profiles set
    status = p_status,
    ban_reason = case when p_status='active' then null else p_reason end,
    banned_at = case when p_status='active' then null else now() end,
    banned_until = case when p_status='active' then null else v_until end
  where id = p_target returning * into v_after;
  perform public._admin_write_audit(p_actor, public.admin_role(p_actor),
    'user_'||p_status, 'user', p_target::text, v_before, to_jsonb(v_after), p_reason);
  return v_after;
end $$;

create or replace function public.admin_set_gold(
  p_actor uuid, p_target uuid, p_value boolean)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_before jsonb; v_after public.profiles;
begin
  if not public.has_admin_permission(p_actor, 'users.gold') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select to_jsonb(p.*) into v_before from public.profiles p where p.id = p_target;
  if v_before is null then raise exception 'not found' using errcode = 'P0002'; end if;
  update public.profiles set
    gold_verified = p_value,
    gold_verified_at = case when p_value then now() else null end,
    gold_verified_by = case when p_value then p_actor else null end
  where id = p_target returning * into v_after;
  perform public._admin_write_audit(p_actor, public.admin_role(p_actor),
    case when p_value then 'gold_granted' else 'gold_revoked' end,
    'user', p_target::text, v_before, to_jsonb(v_after), null);
  return v_after;
end $$;

create or replace function public.admin_set_creator_status(
  p_actor uuid, p_target uuid, p_status text)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare v_before jsonb; v_after public.profiles;
begin
  if not public.has_admin_permission(p_actor, 'creators.approve') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_status not in ('approved','revoked') then
    raise exception 'bad status' using errcode = '22023';
  end if;
  select to_jsonb(p.*) into v_before from public.profiles p where p.id = p_target;
  if v_before is null then raise exception 'not found' using errcode = 'P0002'; end if;
  update public.profiles set creator_status = p_status
  where id = p_target returning * into v_after;
  perform public._admin_write_audit(p_actor, public.admin_role(p_actor),
    'creator_'||p_status, 'user', p_target::text, v_before, to_jsonb(v_after), null);
  return v_after;
end $$;

-- Service-role-only execution (endpoints call via service client).
revoke execute on function
  public.admin_set_user_status(uuid,uuid,text,text,int),
  public.admin_set_gold(uuid,uuid,boolean),
  public.admin_set_creator_status(uuid,uuid,text)
from public, anon, authenticated;
