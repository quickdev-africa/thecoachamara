#!/usr/bin/env node
// CI helper: fail if DEV_ADMIN_BYPASS is enabled in non-development environments.
const devBypass = process.env.DEV_ADMIN_BYPASS === 'true';
const isProd = process.env.NODE_ENV === 'production';
if (devBypass && isProd) {
  console.error('DEV_ADMIN_BYPASS is enabled in production — aborting.');
  process.exit(1);
}
console.log('DEV_ADMIN_BYPASS check passed.');
