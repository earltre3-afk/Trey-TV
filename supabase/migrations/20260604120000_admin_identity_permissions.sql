-- 20260604120000_admin_identity_permissions.sql
-- Canonical admin identity + permission helpers. Idempotent.

alter table public.admin_users add column if not exists permissions text[] not null default '{}';
alter table public.admin_users add column if not exists granted_by uuid references auth.users(id);
alter table public.admin_users add column if not exists granted_at timestamptz not null default now();
alter table public.admin_users add column if not exists revoked_at timestamptz;

-- Role check tolerant of legacy values; allow the four canonical roles.
do $$ begin
  alter table public.admin_users drop constraint if exists admin_users_role_check;
  alter table public.admin_users
    add constraint admin_users_role_check
    check (role in ('owner','admin','moderator','legal'));
exception when others then null; end $$;

create or replace function public.admin_role(p_uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select role from public.admin_users
  where user_id = p_uid and revoked_at is null
  order by case role when 'owner' then 0 when 'admin' then 1 when 'legal' then 2 else 3 end
  limit 1
$$;

-- Role default permissions mirror src/lib/admin/permissions.ts (ROLE_PERMISSIONS).
create or replace function public.admin_role_default_permissions(p_role text)
returns text[] language sql immutable as $$
  select case p_role
    when 'owner' then array['users.ban','users.gold','creators.approve','content.moderate','reports.resolve','rewards.manage','legal.act','platform.settings','admin.manage','audit.read']
    when 'admin' then array['users.ban','users.gold','creators.approve','content.moderate','reports.resolve','rewards.manage','audit.read']
    when 'moderator' then array['users.ban','content.moderate','reports.resolve']
    when 'legal' then array['legal.act','audit.read']
    else array[]::text[]
  end
$$;

create or replace function public.has_admin_permission(p_uid uuid, p_perm text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where user_id = p_uid and revoked_at is null
      and ( p_perm = any(public.admin_role_default_permissions(role))
            or p_perm = any(coalesce(permissions, '{}')) )
  )
$$;

-- Reconcile is_admin / is_owner to the active-row model.
create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = _user_id and revoked_at is null)
$$;

create or replace function public.is_owner(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users
                 where user_id = _user_id and role = 'owner' and revoked_at is null)
$$;

grant execute on function public.is_admin(uuid), public.is_owner(uuid),
  public.admin_role(uuid), public.has_admin_permission(uuid, text) to authenticated, anon;
