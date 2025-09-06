#!/usr/bin/env node
// secret-check.js
// Scans tracked files for common secret patterns and exits non-zero when found.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function gitTrackedFiles() {
  const out = execSync('git ls-files', { encoding: 'utf8' });
  return out.split('\n').filter(Boolean);
}

const allowlist = new Set([
  '.env.example',
  '.env.local.example',
  '.env.production.example',
]);

const patterns = [
  /\bADMIN_API_KEY\s*=/i,
  /\bSUPABASE_SERVICE_ROLE_KEY\s*=/i,
  /\bNEXTAUTH_SECRET\s*=/i,
  /\bRESEND_API_KEY\s*=/i,
  /\bPAYSTACK_SECRET_KEY\s*=/i,
  /\bNEXT_PUBLIC_SUPABASE_ANON_KEY\s*=/i,
  /\b[A-Za-z0-9_+-]{20,}={0,2}\b/, // long base64-like tokens
  /sk_live_[A-Za-z0-9]{10,}/i,
  /sk_test_[A-Za-z0-9]{10,}/i,
  /re_[A-Za-z0-9_]{8,}/i,
  /ak_live_[A-Za-z0-9_]{8,}/i,
  /AIza[0-9A-Za-z\-_]{35}/i, // Google API key
];

function isBinary(filename) {
  const ext = path.extname(filename).toLowerCase();
  const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.zip', '.pdf', '.woff', '.woff2', '.class'];
  return binaryExts.includes(ext);
}

let findings = [];
const files = gitTrackedFiles();
for (const f of files) {
  if (!f || allowlist.has(f)) continue;
  if (f.startsWith('node_modules/') || f.startsWith('.git/') || f.startsWith('.next/') ) continue;
  if (isBinary(f)) continue;
  let content = '';
  try {
    content = fs.readFileSync(f, 'utf8');
  } catch (e) {
    continue;
  }
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const re of patterns) {
      if (re.test(line)) {
        findings.push({ file: f, line: i + 1, text: line.trim(), pattern: re.toString() });
      }
    }
  }
}

if (findings.length) {
  console.error('\nSecret scan found potential secrets in tracked files:');
  for (const r of findings) {
    console.error(`- ${r.file}:${r.line} -> ${r.text}`);
  }
  console.error('\nIf these are false positives, add the safe files to scripts/secret-check allowlist or .gitignore.');
  process.exit(2);
}

console.log('Secret scan passed: no obvious secrets detected in tracked files.');
process.exit(0);
