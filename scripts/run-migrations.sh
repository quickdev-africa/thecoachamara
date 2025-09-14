#!/usr/bin/env bash
# Run SQL migration files in supabase/migrations in alphabetical order against a DATABASE_URL.
# Usage:
#   export DATABASE_URL="postgres://..." && ./scripts/run-migrations.sh
# This script is intentionally simple and requires a valid DATABASE_URL env var.
set -euo pipefail

MIGRATIONS_DIR="$(dirname "$0")/../supabase/migrations"
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set. Export DATABASE_URL before running this script."
  exit 1
fi

echo "Running migrations from $MIGRATIONS_DIR against $DATABASE_URL"

for f in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  echo "--- Applying $f"
  psql "$DATABASE_URL" -f "$f"
done

echo "Migrations completed." 
