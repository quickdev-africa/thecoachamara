-- Purge data while keeping only the two most recent orders and their related rows
-- Scope: orders, payments, order_items, payment_attempts, order_status_history, and user_profiles
-- Safety: runs in a single transaction; identifies rows to keep by orders.created_at DESC
-- Note: This is an operational script (NOT a migration). Review carefully before running.

BEGIN;

-- 0) Admin whitelist: DO NOT DELETE these user profiles
--    Edit this list to include all admin/owner emails you want to preserve.
CREATE TEMP TABLE keep_admin_emails(email text) ON COMMIT DROP;
INSERT INTO keep_admin_emails(email) VALUES
  ('info.laserstarglobal@gmail.com'),
  ('amaranwiru@gmail.com'),
  ('admin@thecoachamara.com');

-- 1) Identify the two most recent orders to keep
CREATE TEMP TABLE keep_orders ON COMMIT DROP AS
SELECT
  o.id,
  o.user_id,
  COALESCE(
    to_jsonb(o)->>'customerEmail',
    to_jsonb(o)->>'customer_email'
  ) AS email
FROM public.orders o
ORDER BY o.created_at DESC NULLS LAST
LIMIT 2;

CREATE TEMP TABLE keep_order_ids ON COMMIT DROP AS
SELECT id FROM keep_orders;

-- 2) Delete dependent rows for all non-kept orders (child tables first)
-- order_items
DELETE FROM public.order_items
WHERE order_id IN (
  SELECT id FROM public.orders WHERE id NOT IN (SELECT id FROM keep_order_ids)
);

-- payment_attempts
DELETE FROM public.payment_attempts
WHERE order_id IN (
  SELECT id FROM public.orders WHERE id NOT IN (SELECT id FROM keep_order_ids)
);

-- payments tied to non-kept orders
DELETE FROM public.payments
WHERE order_id IN (
  SELECT id FROM public.orders WHERE id NOT IN (SELECT id FROM keep_order_ids)
);

-- order_status_history
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'order_status_history'
  ) THEN
    EXECUTE $sql$
      DELETE FROM public.order_status_history
      WHERE order_id IN (
        SELECT id FROM public.orders WHERE id NOT IN (SELECT id FROM keep_order_ids)
      );
    $sql$;
  END IF;
END $$;

-- 3) Delete all non-kept orders
DELETE FROM public.orders
WHERE id NOT IN (SELECT id FROM keep_order_ids);

-- 4) Clean up any orphan/loose payments that are not tied to kept orders
DELETE FROM public.payments
WHERE order_id IS NULL
   OR order_id NOT IN (SELECT id FROM keep_order_ids);

-- 4b) Cap payments to at most two rows, preferring one per kept order
--     This ensures /admin/payments shows no more than two entries.
CREATE TEMP TABLE keep_payments ON COMMIT DROP AS
WITH per_order AS (
  SELECT p.id, p.order_id, p.created_at,
         row_number() OVER (PARTITION BY p.order_id ORDER BY p.created_at DESC NULLS LAST) AS rn
  FROM public.payments p
  WHERE p.order_id IN (SELECT id FROM keep_order_ids)
), chosen_per_order AS (
  SELECT id, created_at
  FROM per_order
  WHERE rn = 1
)
SELECT id
FROM chosen_per_order
ORDER BY created_at DESC NULLS LAST
LIMIT 2;

DELETE FROM public.payments
WHERE id NOT IN (SELECT id FROM keep_payments);

-- 5) Purge customer profiles: keep only profiles linked to the kept orders
--    by user_id or by email match against kept orders.
--    This intentionally removes other user_profiles so the /admin/customers page
--    reflects only the two customers tied to the kept orders.
DELETE FROM public.user_profiles up
WHERE up.id NOT IN (
        SELECT user_id FROM keep_orders WHERE user_id IS NOT NULL
      )
  AND (
        up.email IS NULL
        OR lower(up.email) NOT IN (
             SELECT lower(email) FROM keep_orders WHERE email IS NOT NULL
           )
      )
  AND (
        up.email IS NULL OR lower(up.email) NOT IN (SELECT lower(email) FROM keep_admin_emails)
      );

-- Always keep admin profiles by email (whitelist)
-- If any were deleted by earlier condition, re-insert from backup would be required;
-- to be safe, we exclude them in the DELETE above using NOT IN, but we add this extra guard:
-- Delete nothing where email is in keep_admin_emails
-- Re-run a targeted delete to ensure admin users are preserved by excluding them explicitly
-- (No-op if the previous delete already skipped them.)

-- The safest approach is to perform deletion with whitelist exclusion in one step.
-- If you want to be extra safe, comment out the previous DELETE block and use the variant below:
--
-- DELETE FROM public.user_profiles up
-- WHERE up.id NOT IN (
--         SELECT user_id FROM keep_orders WHERE user_id IS NOT NULL
--       )
--   AND (
--         up.email IS NULL
--         OR lower(up.email) NOT IN (
--              SELECT lower(email) FROM keep_orders WHERE email IS NOT NULL
--           )
--       )
--   AND (
--         up.email IS NULL OR lower(up.email) NOT IN (SELECT lower(email) FROM keep_admin_emails)
--       );

COMMIT;

-- Optional post-checks (run separately):
-- SELECT count(*) AS orders_kept FROM public.orders;
-- SELECT count(*) AS payments_kept FROM public.payments;
-- SELECT count(*) AS customers_kept FROM public.user_profiles;
-- SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 5;
