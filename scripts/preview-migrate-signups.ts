#!/usr/bin/env node
/**
 * scripts/preview-migrate-signups.ts
 * Quick preview for the signups -> user_profiles migration.
 * Usage:
 *   NODE_ENV=development SUPABASE_URL=... SUPABASE_KEY=... npx ts-node ./scripts/preview-migrate-signups.ts
 *
 * The script prints counts and a small sample of signups that would be migrated.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in env.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log('Previewing signups -> user_profiles migration');

  let signupCount: number | null = null;
  let profileCount: number | null = null;
  try {
    const signupsCountRes = await supabase.from('signups').select('*', { count: 'exact', head: false }).maybeSingle();
    signupCount = (signupsCountRes as any)?.count ?? null;
  } catch (e) {
    signupCount = null;
  }

  try {
    const profilesCountRes = await supabase.from('user_profiles').select('*', { count: 'exact', head: false }).maybeSingle();
    profileCount = (profilesCountRes as any)?.count ?? null;
  } catch (e) {
    profileCount = null;
  }

  console.log('signups count:', signupCount === null ? 'unknown or table missing' : signupCount);
  console.log('user_profiles count:', profileCount === null ? 'unknown or table missing' : profileCount);

  // Preview signups with email that would be migrated (no matching profile email)
  let signupsWithEmail: any[] = [];
  try {
    const res = await supabase.from('signups').select('id, name, email, phone, joinDate, timestamp, data').limit(10);
    signupsWithEmail = res.data || [];
  } catch (e) {
    signupsWithEmail = [];
  }

  console.log('\nSample signups (up to 10):');
  console.table((signupsWithEmail || []).map(s => ({ id: s.id, name: s.name || s.data?.name, email: s.email || s.data?.email, phone: s.phone || s.data?.phone })));

  // Find signups with an email that do NOT already exist in user_profiles (sample)
  let allSignupsSample: any[] = [];
  let profiles: any[] = [];
  try {
    const sres = await supabase.from('signups').select('id, name, email, phone, data').limit(200);
    allSignupsSample = sres.data || [];
  } catch (e) {
    allSignupsSample = [];
  }
  try {
    const pres = await supabase.from('user_profiles').select('email');
    profiles = pres.data || [];
  } catch (e) {
    profiles = [];
  }
  const emails = new Set((profiles || []).map((p: any) => (p.email || '').toLowerCase()));
  const candidates = (allSignupsSample || []).filter((s: any) => {
    const e = (s.email || s.data?.email || '') as string;
    return e && !emails.has(e.toLowerCase());
  });

  console.log('\nCandidates to migrate (sample):');
  console.table((candidates || []).slice(0, 20).map((s: any) => ({ id: s.id, email: s.email || s.data?.email, phone: s.phone || s.data?.phone, name: s.name || s.data?.name })));

  console.log('\nPreview complete.');
}

main().catch(err => {
  console.error('Preview failed:', err.message || err);
  process.exit(1);
});
