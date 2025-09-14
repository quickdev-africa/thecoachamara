// scripts/check-test-signup.js
// Read .env.local and query Supabase for the test signup and queued email entries.
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function run() {
  const testEmail = 'lead+test@example.com';
  console.log('Checking for user_profiles row with email =', testEmail);
  try {
    const { data: users, error: userErr } = await supabase.from('user_profiles').select('id, name, email, phone, joined_at, auto_created, meta').eq('email', testEmail).limit(10);
    if (userErr) {
      console.error('user_profiles query error:', userErr.message || userErr);
    } else {
      console.log('user_profiles result count:', (users || []).length);
      console.log(JSON.stringify(users, null, 2));
    }
  } catch (e) {
    console.error('user_profiles query failed', e.message || e);
  }

  console.log('\nChecking email_queue for recipient =', testEmail);
  try {
    const { data: emails, error: emailErr } = await supabase.from('email_queue').select('*').eq('recipient', testEmail).limit(20);
    if (emailErr) {
      console.error('email_queue query error:', emailErr.message || emailErr);
    } else {
      console.log('email_queue result count:', (emails || []).length);
      console.log(JSON.stringify(emails, null, 2));
    }
  } catch (e) {
    console.error('email_queue query failed', e.message || e);
  }
}

run().catch(err => { console.error('Fatal error', err); process.exit(1); });
