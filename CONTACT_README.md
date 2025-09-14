Contact form automatic delivery — setup and test

This file explains how to enable automatic delivery for the contact form so submissions are sent to `admin@thecoachamara.com` without opening the user's email client.

Options supported by the project

1) Internal (recommended) — Resend
- The app contains an internal API route at `/api/contact` that forwards form submissions to Resend. This requires a server-side API key.
- Env vars to set (server-side):
  - `RESEND_API_KEY=rsnd_xxx...`  # your Resend API key (keep secret)
  - `ADMIN_EMAIL=admin@thecoachamara.com`  # destination inbox

2) External endpoint (recommended if you already have a webhook)
- Set a public endpoint that accepts JSON (application/json) POSTs with fields {name,email,phone,message,source}.
- Env var to set (public):
  - `NEXT_PUBLIC_CONTACT_ENDPOINT=https://your-service.example.com/contact`

3) EmailJS (client-only alternative)
- If you prefer client-side sending via EmailJS, set the public keys below and create a template in EmailJS:
  - `NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id`
  - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id`
  - `NEXT_PUBLIC_EMAILJS_USER_ID=your_public_user_id`

How to add locally

1) Edit your `.env.local` at the repository root (do not commit secrets).

Example for Resend (local development):

RESEND_API_KEY=rsnd_test_XXXXXXXXXXXXXXXXXXXX
ADMIN_EMAIL=admin@thecoachamara.com

Optional (if you prefer external endpoint instead of internal API):

NEXT_PUBLIC_CONTACT_ENDPOINT=https://formspree.io/f/xxx

Restart dev server after changing env vars.

How to test

A) Using the site form (fastest)
- Start dev server: `npm run dev` or `pnpm dev` depending on your setup.
- Open `http://localhost:3000/contact`.
- Fill the form and submit. You should see a success message in the UI.
- Check the `ADMIN_EMAIL` inbox for the message (if using Resend) or your external service dashboard.

B) Curl test (targeting internal `/api/contact`)

Replace the JSON values as needed:

curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"+2347000000000","message":"Hello from curl"}'

Expected response: `{"ok":true}` or an error JSON with explanation.

C) If using `NEXT_PUBLIC_CONTACT_ENDPOINT` point the same curl to that endpoint.

Troubleshooting

- 500 error: check that `RESEND_API_KEY` is set on the server and valid. Local `.env.local` environment is only read by Next.js dev server, restart after editing.
- Check server logs (host platform or terminal running dev server) for stack traces.
- If using EmailJS and the client returns non-2xx, ensure the template, service, and user IDs are correct and that the template accepts the fields.

Security notes

- Never commit `RESEND_API_KEY` or other secrets to the repo. Use your host's secret manager for production.
- `NEXT_PUBLIC_*` vars are public — do not put secret keys there.

Want me to finish this for you?
- I can update `.env.local` with placeholder lines (I will not add real secrets).
- I can add a small test script that calls `/api/contact` with sample data.
- I can also add server-side logging or a debug-only endpoint to inspect received payloads.
Tell me which step you want me to take next (add `.env.local` sample, add test script, or implement a debug endpoint).

Helper scripts that were added
--------------------------------

1) `.env.local.sample`
  - Copy this file to `.env.local` and fill in the real values. Example values are placeholders and must be replaced.
  - The project already has `.env.local` in `.gitignore` so your secrets won't be committed.

2) `scripts/test-contact.sh`
  - A small bash helper that POSTs a test JSON payload to the contact endpoint.
  - Usage (make it executable first if needed):

    ./scripts/test-contact.sh

    or point at a deployed URL:

    ./scripts/test-contact.sh https://your-site.example.com/api/contact

  - The script defaults to `http://localhost:3000/api/contact` when no URL is provided.

Notes & quick checklist
------------------------
- Copy `.env.local.sample` -> `.env.local` and set `RESEND_API_KEY` and `ADMIN_EMAIL`.
- Restart your dev server after changing `.env.local`.
- Run the test script while the dev server is running to validate the flow.

Want me to run a quick smoke test (I can run the curl for you against a URL you provide or run it locally if you start the dev server)?

Debug mode (test from browser without Resend)
--------------------------------------------

If you don't want to configure `RESEND_API_KEY` for local testing, enable debug mode in `.env.local`:

CONTACT_DEBUG=true

When `CONTACT_DEBUG=true` and `RESEND_API_KEY` is not set, the internal `/api/contact` route will log the payload and return success so you can test the form end-to-end from the browser without sending real email.

Debug viewer
------------

While `CONTACT_DEBUG=true` you can view recent submissions at:

  GET /api/contact/debug

Example: http://localhost:3000/api/contact/debug

This returns a JSON list of recent in-memory submissions (max 50). This is debug-only and does not persist data.
