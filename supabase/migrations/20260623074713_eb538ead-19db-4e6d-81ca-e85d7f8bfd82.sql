
-- Trekt EXECUTE in van het 'public' role (default voor alle nieuwe functies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.email_has_access(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lowercase_allowed_email() FROM PUBLIC, anon, authenticated;

-- has_role moet wel aanroepbaar zijn door ingelogde gebruikers (gebruikt in policies)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- email_has_access alleen vanuit server-side code (service_role) gebruiken
GRANT EXECUTE ON FUNCTION public.email_has_access(text) TO service_role;
