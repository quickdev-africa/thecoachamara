-- Add commonly-needed customer/delivery/payment fields
-- Idempotent: only adds columns/indexes if they don't exist

DO $$
BEGIN
  -- payments: add email and metadata for quick lookups and storing gateway payload
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='email'
  ) THEN
    ALTER TABLE payments ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='metadata'
  ) THEN
    ALTER TABLE payments ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- payment_attempts: metadata to store gateway init/verify payload and customer snapshot
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='payment_attempts' AND column_name='metadata'
  ) THEN
    ALTER TABLE payment_attempts ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- orders: more delivery/billing columns to capture order form fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_method text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_state'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='shipping_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_address jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='pickup_location'
  ) THEN
    ALTER TABLE orders ADD COLUMN pickup_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_state'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_state text;
  END IF;

  -- indexes for commonly filtered fields
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_payments_email'
  ) THEN
    CREATE INDEX idx_payments_email ON payments (email);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_orders_shipping_state'
  ) THEN
    CREATE INDEX idx_orders_shipping_state ON orders (shipping_state);
  END IF;

END$$;

-- Notes: application should keep canonical customer contact on the orders row (customerEmail, customerPhone).
-- payments and payment_attempts should reference order_id and may duplicate customer email for quick lookups.
