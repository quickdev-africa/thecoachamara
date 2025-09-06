-- 20250906_resend_audit_index_request_id.sql
-- Add an index on request_id for faster lookups by request id.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_resend_audit_request_id ON public.resend_audit (request_id);

COMMIT;

-- End of migration
