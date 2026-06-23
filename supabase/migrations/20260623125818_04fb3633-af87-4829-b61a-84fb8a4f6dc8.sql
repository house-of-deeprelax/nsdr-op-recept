
CREATE TABLE public.denied_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX denied_login_attempts_created_at_idx ON public.denied_login_attempts (created_at DESC);
CREATE INDEX denied_login_attempts_email_idx ON public.denied_login_attempts (email);

GRANT SELECT ON public.denied_login_attempts TO authenticated;
GRANT ALL ON public.denied_login_attempts TO service_role;

ALTER TABLE public.denied_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read denied login attempts"
  ON public.denied_login_attempts
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
