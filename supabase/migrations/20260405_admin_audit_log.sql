CREATE TABLE IF NOT EXISTS admin_audit_log (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  action     text        NOT NULL,
  target     text        NOT NULL,
  details    jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- Pas de politique publique — accessible uniquement via service role
