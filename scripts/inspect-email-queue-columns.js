// scripts/inspect-email-queue-columns.js
// Query information_schema.columns for email_queue to get actual column names
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
  try {
    const { data, error } = await supabase.from('information_schema.columns').select('column_name,data_type').eq('table_name', 'email_queue').order('ordinal_position', { ascending: true });
    if (error) {
      console.error('information_schema query error:', error.message || error);
      return;
    }
    if (!data || data.length === 0) {
      console.log('No columns found for table email_queue (table may not exist or schema not accessible)');
      return;
    }
    console.log('email_queue columns:');
    data.forEach(col => console.log(`- ${col.column_name} : ${col.data_type}`));
  } catch (e) {
    console.error('Failed to query information_schema:', e.message || e);
  }
}

run().catch(err => { console.error('Fatal', err); process.exit(1); });
