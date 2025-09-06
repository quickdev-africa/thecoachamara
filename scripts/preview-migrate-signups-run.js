// scripts/preview-migrate-signups-run.js
// JS runner for previewing signups -> user_profiles migration.
// Usage: DOTENV_CONFIG_PATH=.env.local node ./scripts/preview-migrate-signups-run.js
require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in env.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log('Previewing signups -> user_profiles migration');

  let signupCount = null;
  let profileCount = null;
  try {
    const signupsCountRes = await supabase.from('signups').select('*', { count: 'exact', head: false }).maybeSingle();
    signupCount = signupsCountRes?.count ?? null;
  } catch (e) { signupCount = null; }
  try {
    const profilesCountRes = await supabase.from('user_profiles').select('*', { count: 'exact', head: false }).maybeSingle();
    profileCount = profilesCountRes?.count ?? null;
  } catch (e) { profileCount = null; }

  console.log('signups count:', signupCount === null ? 'unknown or table missing' : signupCount);
  console.log('user_profiles count:', profileCount === null ? 'unknown or table missing' : profileCount);

  let signupsWithEmail = [];
  try {
    const res = await supabase.from('signups').select('id, name, email, phone, joinDate, timestamp, data').limit(10);
    signupsWithEmail = res.data || [];
  } catch (e) { signupsWithEmail = []; }

  console.log('\nSample signups (up to 10):');
  console.table((signupsWithEmail || []).map(s => ({ id: s.id, name: s.name || (s.data && s.data.name), email: s.email || (s.data && s.data.email), phone: s.phone || (s.data && s.data.phone) })));

  let allSignupsSample = [];
  let profiles = [];
  try { const sres = await supabase.from('signups').select('id, name, email, phone, data').limit(200); allSignupsSample = sres.data || []; } catch (e) { allSignupsSample = []; }
  try { const pres = await supabase.from('user_profiles').select('email'); profiles = pres.data || []; } catch (e) { profiles = []; }
  const emails = new Set((profiles || []).map(p => (p.email || '').toLowerCase()));
  const candidates = (allSignupsSample || []).filter(s => { const e = (s.email || (s.data && s.data.email) || ''); return e && !emails.has(e.toLowerCase()); });

  console.log('\nCandidates to migrate (sample):');
  console.table((candidates || []).slice(0, 20).map(s => ({ id: s.id, email: s.email || (s.data && s.data.email), phone: s.phone || (s.data && s.data.phone), name: s.name || (s.data && s.data.name) })));

  console.log('\nPreview complete.');
}

main().catch(err => { console.error('Preview failed:', err && (err.message || err)); process.exit(1); });
