Deployment checklist — prepare secrets and set ADMIN_API_KEY

1) Generate a secure ADMIN_API_KEY locally (do not commit):

   node ./scripts/generate_admin_key.js

   Copy the printed value.

2) Set environment variables in your hosting provider (Vercel, Netlify, Render, Docker env, etc.):

   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
   - PAYSTACK_SECRET_KEY
   - NEXT_PUBLIC_BASE_URL (set to https://your-production-domain.com)
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (https://your-production-domain.com)
   - RESEND_API_KEY
   - RESEND_FROM_EMAIL
   - OWNER_EMAIL
   - ADMIN_API_KEY  <-- paste the generated key here
   - CONTACT_DEBUG=false

3) Verify server-to-server auth (quick test):

   After deployment, call a protected internal endpoint with the header `x-admin-key: <ADMIN_API_KEY>` and expect a 200 response. Example using curl:

   curl -H "x-admin-key: <ADMIN_API_KEY>" https://your-production-domain.com/api/admin/ping

4) Rotate and revoke keys:

   - Rotate ADMIN_API_KEY periodically. To rotate, generate a new key locally and update the environment variable in your provider, then remove the old value.

5) Security notes:

   - Never commit secrets into git. Use your host's secret manager or a dedicated vault (AWS Secrets Manager, Hashicorp Vault, etc.).
   - Limit SUPABASE_SERVICE_ROLE_KEY access and rotate if leaked.

