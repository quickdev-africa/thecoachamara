Title: CI env-safety + auth hardening

Summary
-------
This PR introduces CI checks and hardens authentication for production readiness.

Key changes
- Add GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on pushes and PRs to `main` and uses Node 20. It runs `npm ci`, `npm run check:env`, and `npm run build`.
- Harden NextAuth configuration to use JWT sessions and explicit secure cookie options in production (`src/pages/api/auth/[...nextauth].ts`). Persist the `isAdmin` claim into the JWT/session.
- Add `src/supabaseClient.ts` runtime fallback to avoid bundling Node-only modules into client bundles (use `eval('require')` for `undici`).
- Add server-side admin guards in `src/lib/requireAdmin.ts` and a debug endpoint `src/app/api/debug/session/route.ts`.
- Add helper scripts and a SQL migration to mark admin users:
  - `supabase/migrations/20250902_mark_admins.sql` — SQL to set `raw_user_meta_data.admin = true` for target emails (optional DELETE of auth.sessions commented).
  - `scripts/mark-admins-with-service-key.js` — Node helper to patch users via Supabase REST using a service role key (run locally with env vars).

Security notes
- DO NOT commit real secrets to `.env.local`; `.env.local.example` is sanitized in this branch.
- CI runs `npm run check:env` and will fail if `DEV_ADMIN_BYPASS` is enabled in production envs.

How to apply the admin migration (two options)
1) Run SQL in Supabase SQL editor
   - Open your Supabase project, navigate to SQL editor, paste the contents of `supabase/migrations/20250902_mark_admins.sql`, and run it.
2) Use the helper script (requires service role key)
   - Run locally:

     SUPABASE_URL="https://<project>.supabase.co" SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" node ./scripts/mark-admins-with-service-key.js

Verification checklist
- [ ] Ensure `DEV_ADMIN_BYPASS` is NOT set in production env.
- [ ] Deploy using Node 20+ (recommended).
- [ ] Sign in as an admin in a browser and confirm a session cookie is set (Application → Cookies). Check `/api/debug/session` returns isAdmin true.
- [ ] Merge PR after CI passes.

Notes
- This branch rewrites history to scrub secrets from `.env.local.example`. If you have local copies of `.env.local`, keep them private and do not commit.

If you want, I can also run the migration for you (requires a service role key) or remove remaining dev artifacts before merge.
