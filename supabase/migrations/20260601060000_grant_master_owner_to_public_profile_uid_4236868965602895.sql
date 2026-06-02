-- Grant master admin access to the Trey TV universe for the user with public_profile_uid = '4236868965602895'.
-- This makes the user a root owner in `public.admin_users` and gives an active Tradio owner role.
-- The migration is idempotent and only applies if the public profile exists.

with target as (
  select p.id as user_id, u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.public_profile_uid = '4236868965602895'
)

insert into public.admin_users (user_id, email, role)
select user_id, email, 'owner'
from target
on conflict (user_id) do update
set role = 'owner',
    email = excluded.email;

insert into public.tradio_user_roles (user_id, role, role_status, granted_by, role_metadata)
select user_id, 'owner', 'active', user_id, jsonb_build_object('granted_via','migration')
from target
on conflict (user_id, role) do update
set role_status = 'active',
    granted_at = now(),
    granted_by = excluded.granted_by,
    role_metadata = excluded.role_metadata;
