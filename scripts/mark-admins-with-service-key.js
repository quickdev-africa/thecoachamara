#!/usr/bin/env node
// Usage: SUPABASE_URL="https://..." SUPABASE_SERVICE_ROLE_KEY="..." node ./scripts/mark-admins-with-service-key.js
// This script sets raw_user_meta_data.admin = true for the provided emails.
const fetch = globalThis.fetch || (() => { throw new Error('fetch not available'); })();

const emails = ['info.laserstarglobal@gmail.com','amaranwiru@gmail.com'];
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRole) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

(async function main(){
  try {
    // Fetch user ids for emails
    const q = emails.map(e=>`email=eq.${encodeURIComponent(e)}`).join('&');
    const listRes = await fetch(`${supabaseUrl}/rest/v1/auth.users?${q}&select=id,email`, {
      headers: { 'apikey': serviceRole, 'Authorization': `Bearer ${serviceRole}` }
    });
    const users = await listRes.json();
    for (const u of users) {
      const body = { raw_user_meta_data: { ...(u.raw_user_meta_data || {}), admin: true } };
      const r = await fetch(`${supabaseUrl}/rest/v1/auth.users?id=eq.${u.id}`, {
        method: 'PATCH',
        headers: { 'apikey': serviceRole, 'Authorization': `Bearer ${serviceRole}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
      const json = await r.text();
      console.log('Patched', u.email, '->', r.status, json);
    }
    console.log('Done');
  } catch (e) {
    console.error('Error', e);
    process.exit(1);
  }
})();
