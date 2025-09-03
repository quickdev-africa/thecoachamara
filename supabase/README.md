# Supabase admin setup

This document explains how to run the provided migration to mark admin users, verify the change, and optional next steps (invalidate sessions). It also contains a small production checklist so local conveniences are not deployed to production.

1) Run the migration

- Open your Supabase project dashboard → SQL Editor.
- Copy the contents of `supabase/migrations/20250902_mark_admins.sql` and run it.
-- The migration updates `auth.users.raw_user_meta_data.admin = true` for the listed emails and runs a `SELECT` so you can verify immediately.

2) Verify the update

In the SQL editor, run:

```sql
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE email IN ('info.laserstarglobal@gmail.com');
```

Check that `raw_user_meta_data` contains `"admin": true`.

3) Force re-login (optional)

Users must sign out and sign back in to get the updated session claims. To force them to re-authenticate, delete their sessions (use with caution):

```sql
-- find user id(s)
SELECT id FROM auth.users WHERE email = 'info.laserstarglobal@gmail.com';

-- then delete sessions for that user id
DELETE FROM auth.sessions WHERE user_id = '<user-id>';
```

4) Alternative: run the helper locally

If you prefer to update via the repo helper (requires your Supabase service-role key):

```bash
SUPABASE_URL="https://your-project.supabase.co" SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE>" ADMIN_EMAIL="info.laserstarglobal@gmail.com" npm run mark-user-admin
```

5) Production checklist (do this before deploying)

- Ensure `DEV_ADMIN_BYPASS` is NOT set in your production environment (the code ignores it when NODE_ENV=production but do not set it).
- Ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are set in production env.
-- Confirm `raw_user_meta_data.admin=true` for production admin accounts using the SQL above.
- Restart the production app after making env changes.

7) Add the paystack_reference migration

- A new migration file `supabase/migrations/20250903_add_paystack_reference_to_payments.sql` is provided to add the optional `paystack_reference` column and an index.
- Recommended steps to apply safely:
	1. Take a DB backup / snapshot in Supabase before running any migration.
	2. Run the SQL in the Supabase SQL editor or via `psql`/`supabase` CLI against staging first.
	3. Verify the column exists: `SELECT column_name FROM information_schema.columns WHERE table_name='payments' AND column_name='paystack_reference';`
	4. Deploy to production and re-run the migration there if staging looks good.

Example (psql):

```bash
# export PG connection string (from Supabase project settings)
export DATABASE_URL="postgres://..."
psql "$DATABASE_URL" -f supabase/migrations/20250903_add_paystack_reference_to_payments.sql
```

If you'd like, I can also add a small script to run migrations via the Supabase CLI.

6) If you need different emails

Edit `supabase/migrations/20250902_mark_admins.sql` and add or remove emails in the `WHERE email IN (...)` list, then re-run the migration.

Questions or want me to add a migration for more emails? Paste the additional emails and I'll update the file.
