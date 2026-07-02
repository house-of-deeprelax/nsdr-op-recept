
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'client',
  message text NOT NULL,
  stack text,
  route text,
  user_agent text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  fingerprint text NOT NULL,
  context jsonb,
  resolved boolean NOT NULL DEFAULT false,
  last_notified_at timestamptz
);

CREATE INDEX error_logs_created_at_idx ON public.error_logs (created_at DESC);
CREATE INDEX error_logs_fingerprint_idx ON public.error_logs (fingerprint);

GRANT SELECT, INSERT, UPDATE ON public.error_logs TO authenticated;
GRANT ALL ON public.error_logs TO service_role;

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all error logs"
  ON public.error_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update error logs"
  ON public.error_logs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
