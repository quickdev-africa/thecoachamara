#!/usr/bin/env node
// generate_admin_key.js
// Generates a cryptographically secure ADMIN_API_KEY for production use.
// Usage: node scripts/generate_admin_key.js

const { randomBytes } = require('crypto');

function generateKey(bytes = 48) {
  // 48 bytes -> 96 hex characters (~384 bits)
  return randomBytes(bytes).toString('hex');
}

const key = generateKey(48);
// Print to stdout so operators can copy it into their secret manager.
console.log(key);

// For safety: do NOT write this value to any tracked file in the repo.
// Run this locally and paste the printed value into your hosting provider's secret store.
