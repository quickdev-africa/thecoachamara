Security steps for local developers and maintainers

1) Immediate rotation (if secrets leaked)
- Rotate the following immediately if they were ever committed or exposed:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PAYSTACK_SECRET_KEY`
  - `NEXTAUTH_SECRET`
  - `CLOUDINARY_API_SECRET`
- Use provider consoles to create new keys and delete the old ones.
- For Supabase, create a new service role key in the Project -> Settings -> API.
- For Paystack, rotate secret keys in the Paystack dashboard.
- For Cloudinary, rotate API secret in the account settings.

2) Remove dev bypass from production
- Ensure `DEV_ADMIN_BYPASS` is set to false or removed in production envs.
- Use CI checks to block PRs containing `DEV_ADMIN_BYPASS=true` (env-safety workflow).

3) Use platform secrets
- Configure Vercel/Netlify/GitHub Actions secrets instead of committing .env files.

4) If secrets were committed in the past, scrub history (see HISTORY_PURGE.md) and rotate.

5) Local safety
- Install the pre-commit hook: `cp .githooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit`
- The hook runs `node scripts/check-secrets.js` to scan staged files and block commits containing secrets.

6) Contact plan
- If a key was leaked publicly, rotate immediately and notify stakeholders. Follow each provider's incident response guide.
