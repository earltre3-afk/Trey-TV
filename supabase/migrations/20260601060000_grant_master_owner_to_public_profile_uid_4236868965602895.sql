-- Grant master admin access to the Trey TV universe for the user with public_profile_uid = '4236868965602895'.
-- This makes the user a root owner in `public.admin_users` and gives an active Tradio owner role.
-- The migration is idempotent and only applies if the public profile exists.

with target as (
  select p.id as user_id, u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.public_profile_uid = '4236868965602895'
)

-- Update existing admin_users rows for the target user(s)
update public.admin_users au
set role = 'owner',
    email = t.email
from target t
where au.user_id = t.user_id;

-- Insert admin_users rows if they do not exist
insert into public.admin_users (user_id, email, role)
select t.user_id, t.email, 'owner'
from target t
where not exists (
  select 1 from public.admin_users au where au.user_id = t.user_id
);

-- Update existing tradio_user_roles to active owner for the target user(s)
update public.tradio_user_roles tur
set role_status = 'active',
    granted_at = now(),
    granted_by = t.user_id,
    role_metadata = jsonb_build_object('granted_via','migration')
from target t
where tur.user_id = t.user_id and tur.role = 'owner';

-- Insert tradio_user_roles owner role if missing
insert into public.tradio_user_roles (user_id, role, role_status, granted_by, role_metadata, granted_at)
select t.user_id, 'owner', 'active', t.user_id, jsonb_build_object('granted_via','migration'), now()
from target t
where not exists (
  select 1 from public.tradio_user_roles tur where tur.user_id = t.user_id and tur.role = 'owner'
);
