-- 20250906_resend_audit_request_id_and_index.sql
-- Add a request_id column and an index on recipient for faster lookups.

BEGIN;

ALTER TABLE IF EXISTS public.resend_audit
  ADD COLUMN IF NOT EXISTS request_id text;

CREATE INDEX IF NOT EXISTS idx_resend_audit_recipient ON public.resend_audit (recipient);

COMMIT;

-- End of migration
