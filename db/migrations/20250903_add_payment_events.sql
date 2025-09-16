-- Create payment_events table for audit/logging of payment verify/webhook events
-- Idempotent: only creates table if it doesn't exist
-- Ensure pgcrypto is available for gen_random_uuid()
-- This is idempotent and safe to run on Supabase/Postgres instances.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_events'
  ) THEN
    CREATE TABLE payment_events (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      reference text,
      event_type text,
      payload jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now()
    );
  END IF;

  -- Index for quick lookup by reference
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_payment_events_reference'
  ) THEN
    CREATE INDEX idx_payment_events_reference ON payment_events (reference);
  END IF;
END$$;
