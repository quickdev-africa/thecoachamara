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

function isAllowedEnvFile(file) {
  if (!file.startsWith('.env')) return false;
  if (allowlist.has(file)) return true;
  // Ignore example/sample/backup variations in repo
  const ignored = ['.example', '.sample', '.bak', '.backup'];
  return ignored.some((s) => file.includes(s));
}

function isIgnoredPath(file) {
  // Ignore common backup/export artifacts and test outputs
  if (file.startsWith('backup') || /(^|\/)backup[^/]*\.(json|sql)$/i.test(file)) return true;
  if (file.endsWith('.sql')) return true;
  if (file.startsWith('test-results/')) return true;
  return false;
}

const patterns = [
  // explicit env var assignments (common unsafe patterns)
  /\bADMIN_API_KEY\s*=\s*[^\s#]+/i,
  /\bSUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s#]+/i,
  /\bNEXTAUTH_SECRET\s*=\s*[^\s#]+/i,
  /\bRESEND_API_KEY\s*=\s*[^\s#]+/i,
  /\bPAYSTACK_SECRET_KEY\s*=\s*[^\s#]+/i,
  /\bNEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*[^\s#]+/i,
  // provider-prefixed tokens
  /sk_live_[A-Za-z0-9]{10,}/i,
  /sk_test_[A-Za-z0-9]{10,}/i,
  /re_[A-Za-z0-9_]{8,}/i,
  /ak_live_[A-Za-z0-9_]{8,}/i,
  /AIza[0-9A-Za-z\-_]{35}/i, // Google API key
  // long opaque tokens when seen in an assignment (avoid catching identifiers in code)
  /(?:=|:\s*)\s*[A-Za-z0-9_+-]{40,}={0,2}/,
];

function isBinary(filename) {
  const ext = path.extname(filename).toLowerCase();
  const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.zip', '.pdf', '.woff', '.woff2', '.class'];
  return binaryExts.includes(ext);
}

let findings = [];
const files = gitTrackedFiles();
for (const f of files) {
  if (!f) continue;
  if (isAllowedEnvFile(f)) continue;
  if (f.startsWith('node_modules/') || f.startsWith('.git/') || f.startsWith('.next/') ) continue;
  if (isBinary(f)) continue;
  if (isIgnoredPath(f)) continue;
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

  // Apply long opaque token heuristic ONLY for .env*-like files
  if (f.startsWith('.env')) {
    if (/[A-Za-z0-9_+-]{40,}={0,2}/.test(content)) {
      findings.push({ file: f, line: 0, text: '<long-token-like>', pattern: 'heuristic-long-token' });
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
