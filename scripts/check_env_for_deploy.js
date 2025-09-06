#!/usr/bin/env node
// check_env_for_deploy.js
// Lightweight check to ensure required production env vars are set in the current environment.

const required = [
  'NEXT_PUBLIC_BASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY',
  'NEXTAUTH_SECRET',
  'RESEND_API_KEY',
  'ADMIN_API_KEY'
];

let ok = true;
required.forEach((k) => {
  if (!process.env[k]) {
    console.error(`MISSING: ${k}`);
    ok = false;
  }
});

if (!ok) process.exit(2);
console.log('All required env vars present (basic check)');
