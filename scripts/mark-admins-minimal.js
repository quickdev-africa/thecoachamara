#!/usr/bin/env node
// Minimal helper to mark users as admin via Supabase REST API using the service role key.
// Usage examples:
//   SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="..." node ./scripts/mark-admins-minimal.js email1@example.com email2@example.com
//   SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="..." MARK_ADMIN_EMAILS="a@b.com,c@d.com" node ./scripts/mark-admins-minimal.js --dry-run

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." node scripts/mark-admins-minimal.js [emails...] [--dry-run]

Emails may be passed as CLI args or via MARK_ADMIN_EMAILS env (comma-separated).
Options:
  --dry-run    Show what would be patched without making changes
  --help, -h   Show this help
`);
  process.exit(0);
}

const dryRun = args.includes('--dry-run');
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Collect emails: CLI args (excluding flags) or MARK_ADMIN_EMAILS env
const cliEmails = args.filter(a => !a.startsWith('--'));
const envEmails = process.env.MARK_ADMIN_EMAILS ? process.env.MARK_ADMIN_EMAILS.split(',').map(s=>s.trim()).filter(Boolean) : [];
const emails = cliEmails.length ? cliEmails : envEmails;

// Note: when doing a dry-run, we allow missing SUPABASE envs and print SQL preview commands
// If not dry-run and envs are missing, fail early.


if (!emails.length) {
  console.error('No emails provided. Pass emails as args or set MARK_ADMIN_EMAILS env. Use --help for details.');
  process.exit(1);
}

const fetcher = globalThis.fetch || (async () => { throw new Error('fetch not available in this runtime'); })();

(async function main(){
  try {
    // If --dry-run is requested, always print SQL preview and exit without calling Supabase
    if (dryRun) {
      console.log('[dry-run] Printing SQL preview (no network calls):');
      for (const e of emails) {
        console.log(`-- Update user ${e} to admin`);
        console.log(`UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{admin}', 'true'::jsonb) WHERE email = '${e.replace("'", "''")}' ;`);
      }
      return;
    }

    // Build an 'in' list for Supabase: comma-separated, with each email URL-escaped but without encoding commas
    const encoded = emails.map(e => encodeURIComponent(e)).join(',');
    const listUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/auth.users?select=id,email,raw_user_meta_data&email=in.(${encoded})`;
    const headers = { 'apikey': serviceRole, 'Authorization': `Bearer ${serviceRole}` };

    console.log('Fetching users for', emails.join(', '));
    const listRes = await fetch(listUrl, { headers });
    if (!listRes.ok) {
      const t = await listRes.text();
      throw new Error(`Failed to list users: ${listRes.status} ${t}`);
    }
    const users = await listRes.json();
    if (!users.length) {
      console.log('No users found for the provided emails. Nothing to do.');
      return;
    }

    for (const u of users) {
      const patchBody = { raw_user_meta_data: { ...(u.raw_user_meta_data || {}), admin: true } };
      console.log((dryRun ? '[dry-run]' : '[patch]'), u.email, '-> id:', u.id);
      if (!dryRun) {
        const patchUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/auth.users?id=eq.${u.id}`;
        const r = await fetch(patchUrl, {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify(patchBody)
        });
        const text = await r.text();
        if (!r.ok) {
          console.error('Failed to patch', u.email, r.status, text);
        } else {
          console.log('Patched', u.email, '->', r.status, text);
        }
      }
    }
    console.log('Done.');
  } catch (err) {
    console.error('Error', String(err));
    process.exit(1);
  }
})();
