-- Mark specific users as admin in raw_user_meta_data
-- Update the email list as needed.
BEGIN;

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{admin}', 'true'::jsonb)
WHERE email IN ('info.laserstarglobal@gmail.com','amaranwiru@gmail.com');

-- Optional: force users to re-login by deleting existing sessions. Uncomment to run.
-- DELETE FROM auth.sessions
-- WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('info.laserstarglobal@gmail.com','amaranwiru@gmail.com'));

COMMIT;
-- Migration: mark admin users
-- Date: 2025-09-02
-- Purpose: set user_metadata.admin = true for specified emails
-- Usage: run this in your Supabase SQL editor or include in your migration pipeline.

BEGIN;

-- Replace or extend the email list below with the admin accounts you want to enable.
-- Note: this project stores metadata in `raw_user_meta_data` (jsonb) so we update that column.
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{admin}', 'true'::jsonb, true)
WHERE email IN (
  'info.laserstarglobal@gmail.com',
  'amaranwiru@gmail.com'
  --,'other.admin@example.com'
);

-- Optional: if you also want to mark the user as a super-admin via the dedicated boolean column:
-- UPDATE auth.users
-- SET is_super_admin = true
-- WHERE email IN ('info.laserstarglobal@gmail.com', 'amaranwiru@gmail.com');

-- Verify the update (returns id, email, raw_user_meta_data and is_super_admin)
SELECT id, email, raw_user_meta_data, is_super_admin
FROM auth.users
WHERE email IN (
  'info.laserstarglobal@gmail.com',
  'amaranwiru@gmail.com'
  --,'other.admin@example.com'
);

COMMIT;

-- Rollback examples (run separately if you need to undo):
-- Option A: remove the admin key entirely (raw_user_meta_data)
-- UPDATE auth.users
-- SET raw_user_meta_data = (raw_user_meta_data::jsonb - 'admin')::jsonb
-- WHERE email IN ('info.laserstarglobal@gmail.com', 'amaranwiru@gmail.com');

-- Option B: set admin flag to false (raw_user_meta_data)
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{admin}', 'false'::jsonb, true)
-- WHERE email IN ('info.laserstarglobal@gmail.com', 'amaranwiru@gmail.com');

-- Optional: Invalidate sessions for these users to force re-login
-- DELETE FROM auth.sessions
-- WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email IN ('info.laserstarglobal@gmail.com')
-- );
