-- Add user_id column to orders (idempotent)
-- This migration ensures the 'user_id' column exists so PostgREST/Supabase schema cache won't return PGRST204 when writing orders.

DO $$
BEGIN
  -- Add the column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id uuid;
  END IF;

  -- Add a foreign key constraint to user_profiles.id if not present
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'orders'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
  ) THEN
    BEGIN
      -- wrap in BEGIN/EXCEPTION to avoid failing if user_profiles doesn't exist
      ALTER TABLE orders
        ADD CONSTRAINT fk_orders_user_profiles
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    EXCEPTION WHEN undefined_table THEN
      -- user_profiles table not present yet; skip FK addition for now
      RAISE NOTICE 'user_profiles table not found; skipping FK creation';
    END;
  END IF;

  -- Create an index for quick lookups
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_orders_user_id'
  ) THEN
    CREATE INDEX idx_orders_user_id ON orders (user_id);
  END IF;
END$$;
