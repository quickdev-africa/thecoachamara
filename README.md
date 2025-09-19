This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CI smoke tests and migrations

This repo contains a GitHub Actions workflow `.github/workflows/smoke-test.yml` which runs an integration smoke test on pull requests when the following secrets are configured in the repository settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL` (optional; if set the workflow will apply SQL files from `supabase/migrations` using `psql`)
- `PAYSTACK_SECRET_KEY` (optional; used to initialize Paystack during funnel create if provided)

If secrets are not present the workflow will skip the smoke tests to keep PRs from forks from failing.

CI notes
--------
To enable the CI smoke job (`.github/workflows/ci-smoke-and-env-safety.yml`) you'll need to add the following repository secrets in GitHub:

- `STAGING_BASE_URL` — the URL of a staging deployment to run the smoke test against (e.g. https://staging.example.com)
- `SMOKE_TEST_TOKEN` — short-lived token that the staging server recognizes for simulate verify (keep secret)

The CI job will run env-safety, build, and smoke test after changes are pushed to `main`.
<<<<<<< HEAD
=======

## Marketing Tracking (Meta Pixel & Conversions API)

The app includes an integrated Meta (Facebook) Pixel + (optional) Conversions API implementation with event deduplication.

Implemented events:
- `PageView` (initial + every SPA route change)
- `InitiateCheckout` (primary order CTA)
- `Purchase` (server-side on Paystack webhook success; only when CAPI enabled)

Environment variables:
- `NEXT_PUBLIC_FB_PIXEL_ID` (required for any browser Pixel tracking)
- `FB_CONVERSIONS_API_TOKEN` (server secret token for CAPI – only needed if enabling CAPI)
- `NEXT_PUBLIC_ENABLE_CAPI` (set to `true` to send server/browser events via Conversions API; omit or set to anything else for Pixel-only)

Default mode: Pixel-only. The helper (`src/lib/meta.ts`) checks `NEXT_PUBLIC_ENABLE_CAPI==='true'` before POSTing to `/api/meta/track`.

To enable full CAPI + Purchase event:
1. Set `NEXT_PUBLIC_FB_PIXEL_ID` and `FB_CONVERSIONS_API_TOKEN` in Vercel (Production + Preview).
2. Add `NEXT_PUBLIC_ENABLE_CAPI=true`.
3. Redeploy. Verify in Events Manager → Test Events (PageView, InitiateCheckout, Purchase with server icon & dedup).

To keep Pixel-only (no server calls):
- Leave `NEXT_PUBLIC_ENABLE_CAPI` unset (or not equal to `true`). The server Purchase event will be suppressed.

If you later add CAPI, no code change is required—just set the envs and redeploy.
>>>>>>> my-feature-branch
