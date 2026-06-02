-- Grant master admin access to the Trey TV universe for the user with public_profile_uid = '4236868965602895'.
-- This makes the user a root owner in `public.admin_users` and gives an active Tradio owner role.
-- The migration is idempotent and only applies if the public profile exists.

DO $$
DECLARE
  v_user_id uuid;
  v_email text;
BEGIN
  SELECT p.id, u.email INTO v_user_id, v_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.public_profile_uid = '4236868965602895';

  -- If the profile doesn't exist, do nothing
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Update admin_users if present
  UPDATE public.admin_users
  SET role = 'owner', email = v_email
  WHERE user_id = v_user_id;

  -- Insert admin_users if missing
  INSERT INTO public.admin_users (user_id, email, role)
  SELECT v_user_id, v_email, 'owner'
  WHERE NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = v_user_id);

  -- Update tradio_user_roles to active owner if present
  UPDATE public.tradio_user_roles
  SET role_status = 'active', granted_at = now(), granted_by = v_user_id, role_metadata = jsonb_build_object('granted_via','migration')
  WHERE user_id = v_user_id AND role = 'owner';

  -- Insert tradio_user_roles owner role if missing
  INSERT INTO public.tradio_user_roles (user_id, role, role_status, granted_by, role_metadata, granted_at)
  SELECT v_user_id, 'owner', 'active', v_user_id, jsonb_build_object('granted_via','migration'), now()
  WHERE NOT EXISTS (SELECT 1 FROM public.tradio_user_roles WHERE user_id = v_user_id AND role = 'owner');
END;
$$;
