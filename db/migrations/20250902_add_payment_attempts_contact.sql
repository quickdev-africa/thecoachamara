-- Add contact fields to payment_attempts for storing customer email/phone
-- Idempotent: add columns only if they don't exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='payment_attempts' AND column_name='email'
  ) THEN
    ALTER TABLE payment_attempts ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='payment_attempts' AND column_name='phone'
  ) THEN
    ALTER TABLE payment_attempts ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_payment_attempts_email'
  ) THEN
    CREATE INDEX idx_payment_attempts_email ON payment_attempts (email);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_payment_attempts_phone'
  ) THEN
    CREATE INDEX idx_payment_attempts_phone ON payment_attempts (phone);
  END IF;
END$$;
