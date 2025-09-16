-- Create email_queue table to store failed or pending email sends for retry
-- Idempotent: only creates table if it doesn't exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'email_queue'
  ) THEN
    CREATE TABLE email_queue (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      to_email text NOT NULL,
      subject text NOT NULL,
      html jsonb NOT NULL,
      attempts int DEFAULT 0,
      last_error text,
      next_try timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_email_queue_next_try'
  ) THEN
    CREATE INDEX idx_email_queue_next_try ON email_queue (next_try);
  END IF;
END$$;
