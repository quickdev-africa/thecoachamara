// scripts/check-oye-signup.js
// Query Supabase for the test signup and inspect email_queue schema & rows for the provided email.
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
  const testEmail = 'oye.olusegun@gmail.com';
  console.log('Checking for user_profiles row with email =', testEmail);
  try {
    const { data: users, error: userErr } = await supabase.from('user_profiles').select('id, name, email, phone, joined_at, auto_created, meta').ilike('email', testEmail).limit(10);
    if (userErr) {
      console.error('user_profiles query error:', userErr.message || userErr);
    } else {
      console.log('user_profiles result count:', (users || []).length);
      console.log(JSON.stringify(users, null, 2));
    }
  } catch (e) {
    console.error('user_profiles query failed', e.message || e);
  }

  console.log('\nInspecting email_queue columns');
  try {
    const { data: cols, error: colsErr } = await supabase.rpc('sql', { q: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'email_queue' ORDER BY ordinal_position;` }).catch(() => null);
    // supabase-js doesn't support arbitrary SQL via rpc by default; fallback to a direct table select to probe existence
    if (!cols) {
      // try selecting first row from email_queue to infer schema
      const { data: rows, error: rowsErr } = await supabase.from('email_queue').select('*').limit(5);
      if (rowsErr) {
        console.error('email_queue select error:', rowsErr.message || rowsErr);
      } else {
        console.log('email_queue sample rows:', JSON.stringify(rows, null, 2));
        if ((rows || []).length > 0) {
          console.log('Inferred columns from sample row keys:', Object.keys(rows[0]));
        }
      }
    } else {
      console.log('email_queue columns:', JSON.stringify(cols, null, 2));
    }
  } catch (e) {
    console.error('email_queue inspection failed', e.message || e);
  }

  console.log('\nFetching email_queue rows that might reference the test email (searching string match)');
  try {
    // Attempt a broad string search on provider_response or recipient-like columns
    const { data: raws, error: rawErr } = await supabase.from('email_queue').select('*').limit(50);
    if (rawErr) {
      console.error('email_queue full select error:', rawErr.message || rawErr);
    } else {
      const matches = (raws || []).filter(r => JSON.stringify(r).includes(testEmail));
      console.log('email_queue total rows fetched:', (raws || []).length);
      console.log('Matches containing email:', matches.length);
      console.log(JSON.stringify(matches, null, 2));
    }
  } catch (e) {
    console.error('email_queue broad fetch failed', e.message || e);
  }
}

run().catch(err => { console.error('Fatal error', err); process.exit(1); });
