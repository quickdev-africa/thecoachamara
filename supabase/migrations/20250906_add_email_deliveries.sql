-- Create email_deliveries table for logging Resend email events (idempotent)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'email_deliveries'
  ) THEN
    CREATE TABLE email_deliveries (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      to_email text NOT NULL,
      subject text NOT NULL,
      status text NOT NULL,
      provider text NOT NULL DEFAULT 'resend',
      payload jsonb,
      sent_at timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_email_deliveries_sent_at'
  ) THEN
    CREATE INDEX idx_email_deliveries_sent_at ON email_deliveries (sent_at DESC);
  END IF;
END$$;
