// scripts/check-resend-audit.js
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
  const { data, error } = await supabase.from('resend_audit').select('*').eq('recipient', testEmail).order('created_at', { ascending: false }).limit(20);
  if (error) {
    console.error('resend_audit query error:', error.message || error);
    return;
  }
  console.log('resend_audit rows for', testEmail, ':', (data || []).length);
  console.log(JSON.stringify(data, null, 2));
}

run().catch(err => { console.error('Fatal', err); process.exit(1); });
