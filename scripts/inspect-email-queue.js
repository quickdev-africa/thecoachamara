// scripts/inspect-email-queue.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing SUPABASE_URL or SUPABASE_KEY'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function run() {
  try {
    const { data, error } = await supabase.from('email_queue').select('*').limit(1);
    if (error) {
      console.error('Query error:', error.message || error);
      return;
    }
    if (!data || data.length === 0) {
      console.log('email_queue: table exists but has no rows (or no access).');
      return;
    }
    const row = data[0];
    console.log('email_queue sample row keys:', Object.keys(row));
    console.log('sample row:', JSON.stringify(row, null, 2));
  } catch (e) {
    console.error('Unexpected error:', e.message || e);
  }
}

run();
