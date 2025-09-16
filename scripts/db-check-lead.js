// One-off script to check a lead/user_profiles row by id or email.
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function run(idOrEmail) {
  try {
    // Try lookup by id first
    let { data, error } = await supabase.from('user_profiles').select('*').eq('id', idOrEmail).maybeSingle();
    if (error) {
      console.error('user_profiles query error (by id)', error);
    }
    if (data) {
      console.log('Found user_profiles by id:', data);
      return;
    }

    // Fallback to email search
    ({ data, error } = await supabase.from('user_profiles').select('*').ilike('email', idOrEmail).limit(10));
    if (error) {
      console.error('user_profiles query error (by email)', error);
    }
    if (data && data.length > 0) {
      console.log('Found user_profiles by email:', data);
      return;
    }

    // If not in user_profiles, check a generic 'customers' or 'signups' table if present
    const tablesToCheck = ['customers', 'signups', 'leads'];
    for (const t of tablesToCheck) {
      try {
        const res = await supabase.from(t).select('*').eq('id', idOrEmail).maybeSingle();
        if (res && res.data) {
          console.log(`Found in ${t}:`, res.data);
          return;
        }
      } catch (e) {
        // ignore missing table
      }
    }

    console.log('No matching lead/user profile found for:', idOrEmail);
  } catch (e) {
    console.error('Unexpected error', e);
  }
}

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/db-check-lead.js <id-or-email>');
  process.exit(1);
}
run(arg).then(() => process.exit(0));
