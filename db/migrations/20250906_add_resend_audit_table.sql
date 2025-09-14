-- 20250906_add_resend_audit_table.sql
-- Creates a lightweight audit table to persist outbound email provider responses.
-- Safe to run multiple times; idempotent.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.resend_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text,
  provider text,
  provider_response jsonb,
  created_at timestamptz DEFAULT now()
);

COMMIT;

-- End of migration
