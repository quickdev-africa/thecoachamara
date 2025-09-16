This repo includes SQL migrations for Supabase/Postgres in `db/migrations/`.

To apply the uniqueness constraints migration locally or in your Supabase project:

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli

2. Log in and link your project (optional). Example to run SQL directly:

supabase db remote set <PROJECT_REF>
# then
supabase db query < db/migrations/20250831_add_uniqueness_constraints.sql

Alternatively, run the SQL from your Postgres client using the project's connection string (keep credentials safe).

Note: Ensure you have backups and that the migration is compatible with existing data before applying.
