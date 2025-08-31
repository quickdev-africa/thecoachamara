-- Migration: add uniqueness constraints for order_number and payment references

-- Ensure order_number is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_orders_order_number_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_orders_order_number_unique ON orders (order_number);
  END IF;
END$$;

-- Ensure payments.reference is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_payments_reference_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_payments_reference_unique ON payments (reference);
  END IF;
END$$;

-- Ensure payment_attempts.payment_reference is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_payment_attempts_reference_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_payment_attempts_reference_unique ON payment_attempts (payment_reference);
  END IF;
END$$;
