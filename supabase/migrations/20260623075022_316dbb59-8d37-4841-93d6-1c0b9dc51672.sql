
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text := lower(NEW.email);
  _is_admin_invite boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_users
    WHERE email = _email AND note ILIKE '%admin%'
  ) INTO _is_admin_invite;

  IF _is_admin_invite OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;
