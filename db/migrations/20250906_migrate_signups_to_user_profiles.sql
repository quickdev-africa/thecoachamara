-- 20250906_migrate_signups_to_user_profiles.sql
-- Safe migration: copy legacy `signups` rows into `user_profiles` when a matching
-- customer/lead doesn't already exist. This migration is idempotent and preserves
-- the `signups` table as an archive. Run on staging first and back up your DB.

-- Notes:
-- - This script attempts to read common columns directly (name, email, phone, memberType,
--   joinDate, timestamp, orderAnalytics, geoAnalytics, conversionAnalytics). If your
--   `signups` table stores payload in a JSONB column named `data`, the COALESCE calls
--   will pick those values too.
-- - It does NOT delete or modify `signups`. It only INSERTs into `user_profiles` when
--   there is no existing user with the same (case-insensitive) email, or when phone-based
--   matching does not find an existing profile.
-- - It records insert time as now() and marks migrated rows `auto_created = true` to keep
--   them visible as leads.

BEGIN;

-- Ensure pgcrypto is available for uuid generation (no-op if already present)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Migrate signups that have an email and no matching user_profiles.email (case-insensitive)
INSERT INTO public.user_profiles (id, name, email, phone, joined_at, is_active, auto_created, meta, created_at)
SELECT
  gen_random_uuid() AS id,
  COALESCE(s.name, (s.data->>'name'))::text AS name,
  COALESCE(NULLIF(s.email, ''), NULLIF(s.data->>'email',''))::text AS email,
  COALESCE(s.phone, (s.data->>'phone'))::text AS phone,
  COALESCE(
    NULLIF(s.joinDate::text, ''),
    (CASE WHEN s.timestamp IS NOT NULL THEN to_timestamp((s.timestamp::bigint / 1000.0))::timestamptz ELSE now() END),
    now()
  ) AS joined_at,
  true AS is_active,
  true AS auto_created,
  jsonb_strip_nulls(jsonb_build_object(
    'source', coalesce(s.source, 'signups'),
    'memberType', coalesce(s.memberType, s.data->>'memberType'),
    'conversionAnalytics', coalesce(s.conversionAnalytics, s.data->'conversionAnalytics'),
    'orderAnalytics', coalesce(s.orderAnalytics, s.data->'orderAnalytics'),
    'geoAnalytics', coalesce(s.geoAnalytics, s.data->'geoAnalytics')
  )) AS meta,
  now() AS created_at
FROM public.signups s
WHERE COALESCE(NULLIF(s.email, ''), NULLIF(s.data->>'email','')) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE lower(up.email) = lower(COALESCE(NULLIF(s.email,''), NULLIF(s.data->>'email','')))
  );

-- 2) Migrate signups without email: try to upsert by phone (if phone present and not matched)
--    For databases where user_profiles.email is NOT NULL, create a harmless placeholder email.
INSERT INTO public.user_profiles (id, name, email, phone, joined_at, is_active, auto_created, meta, created_at)
SELECT
  gen_random_uuid() AS id,
  COALESCE(s.name, (s.data->>'name'))::text AS name,
  -- placeholder email to satisfy NOT NULL constraints; prefixed so it's identifiable
  (COALESCE(NULLIF(s.phone, ''), (s.data->>'phone'), ('noemail' || clock_timestamp()::text)) || '@no-reply.thecoachamara.local')::text AS email,
  COALESCE(s.phone, (s.data->>'phone'))::text AS phone,
  COALESCE(
    NULLIF(s.joinDate::text, ''),
    (CASE WHEN s.timestamp IS NOT NULL THEN to_timestamp((s.timestamp::bigint / 1000.0))::timestamptz ELSE now() END),
    now()
  ) AS joined_at,
  true AS is_active,
  true AS auto_created,
  jsonb_strip_nulls(jsonb_build_object(
    'source', coalesce(s.source, 'signups'),
    'memberType', coalesce(s.memberType, s.data->>'memberType'),
    'conversionAnalytics', coalesce(s.conversionAnalytics, s.data->'conversionAnalytics'),
    'orderAnalytics', coalesce(s.orderAnalytics, s.data->'orderAnalytics'),
    'geoAnalytics', coalesce(s.geoAnalytics, s.data->'geoAnalytics')
  )) AS meta,
  now() AS created_at
FROM public.signups s
WHERE (COALESCE(NULLIF(s.email, ''), NULLIF(s.data->>'email','')) IS NULL)
  AND COALESCE(NULLIF(s.phone,''), NULLIF(s.data->>'phone','')) IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.phone = COALESCE(NULLIF(s.phone,''), NULLIF(s.data->>'phone',''))
  );

-- 3) Verification queries (run after migration to confirm counts and duplicates)
-- Count how many signups existed vs how many profiles now exist with matching emails
-- You can run these manually in Supabase SQL editor after running the migration.

-- Total legacy signups
-- SELECT count(*) FROM public.signups;

-- New user_profiles rows created from signups (approx)
-- SELECT count(*) FROM public.user_profiles WHERE auto_created = true AND meta ->> 'source' = 'signups';

-- Potential duplicate emails still in signups that weren't migrated because a profile already existed
-- SELECT s.id, COALESCE(NULLIF(s.email,''), s.data->>'email') AS email
-- FROM public.signups s
-- WHERE COALESCE(NULLIF(s.email,''), s.data->>'email') IS NOT NULL
--   AND EXISTS (SELECT 1 FROM public.user_profiles up WHERE lower(up.email) = lower(COALESCE(NULLIF(s.email,''), s.data->>'email')));

COMMIT;

-- End of migration script. Keep `signups` as an archive until you're comfortable removing it.


