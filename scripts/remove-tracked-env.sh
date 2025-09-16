#!/usr/bin/env bash
# Helper: stop tracking .env.local and remove it from git index safely
set -euo pipefail
if [ -f .env.local ]; then
  echo "Removing .env.local from git tracking (will remain on disk)."
  git rm --cached .env.local || true
  echo ".env.local" >> .gitignore || true
  git add .gitignore || true
  git commit -m "chore: stop tracking local env file .env.local" || true
  echo "Committed changes. Please push the branch and rotate any exposed keys if needed."
else
  echo ".env.local not present in repo root; nothing to do."
fi
