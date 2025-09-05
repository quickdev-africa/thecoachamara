-- Add archived flag to payment_events for soft-deletes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_events') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='payment_events' AND column_name='archived'
    ) THEN
      ALTER TABLE payment_events ADD COLUMN archived boolean DEFAULT false;
    END IF;
  END IF;
END$$;
