#!/usr/bin/env node
// Simple staged-file scanner to detect common secret patterns before commit.
// Usage: node scripts/check-secrets.js (git staged files are read from git)

const { execSync } = require('child_process')
const fs = require('fs')

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
    return out.split('\n').filter(Boolean)
  } catch (e) {
    return []
  }
}

const secrets = [
  /(?:supabase|supabase_service_role|SUPABASE_SERVICE_ROLE|SUPABASE_SERVICE_ROLE_KEY)/i,
  /sk_live_|sk_test_|pk_live_|pk_test_|paystack/i,
  /NEXTAUTH_SECRET/i,
  /CLOUDINARY_API_SECRET|CLOUDINARY_API_KEY/i,
  /AIza[0-9A-Za-z-_]{35}/, // Google API key-ish
  /ghp_[0-9A-Za-z]{36}/, // GitHub token-ish
  /-----BEGIN PRIVATE KEY-----/i,
  /(?:AKIA|A3T|A1Z)[0-9A-Z]{16}/, // AWS-ish
]

function scanFile(path) {
  try {
    const content = fs.readFileSync(path, 'utf8')
    for (const re of secrets) {
      if (re.test(content)) return { path, match: re.toString() }
    }
    // also scan for long base64-looking tokens
    if (/[A-Za-z0-9_\-]{40,}/.test(content)) return { path, match: 'long-token-like' }
  } catch (e) {
    // ignore binary or unreadable
  }
  return null
}

const staged = getStagedFiles()
if (staged.length === 0) process.exit(0)

const findings = []
for (const f of staged) {
  const res = scanFile(f)
  if (res) findings.push(res)
}

if (findings.length) {
  console.error('\nERROR: Potential secret(s) found in staged files:')
  for (const r of findings) console.error(` - ${r.path}   (${r.match})`)
  console.error('\nIf these are false positives you can bypass with:')
  console.error('  git commit -n  (not recommended)')
  console.error('\nOtherwise: remove secrets, add to .gitignore, rotate exposed keys, and run git history purge if needed.')
  process.exit(1)
}

process.exit(0)
