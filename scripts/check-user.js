#!/usr/bin/env node
/**
 * Check specific user details
 * Usage: node scripts/check-user.js <email>
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkUser(email) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log(`🔍 Checking user: ${email}\n`);
    
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      process.exit(1);
    }

    const user = data.users.find(u => u.email === email);

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('📋 USER DETAILS:');
    console.log('=====================================');
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user.id}`);
    console.log(`Phone: ${user.phone || 'Not set'}`);
    console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
    console.log(`Email Confirmed: ${user.email_confirmed_at ? '✅ Yes (' + new Date(user.email_confirmed_at).toLocaleString() + ')' : '❌ No'}`);
    console.log(`Phone Confirmed: ${user.phone_confirmed_at ? '✅ Yes' : '❌ No'}`);
    console.log(`Banned: ${user.banned_until ? '⛔ Yes (until ' + user.banned_until + ')' : '✅ No'}`);
    console.log(`\n🔐 METADATA:`);
    console.log('User Metadata:', JSON.stringify(user.user_metadata, null, 2));
    console.log('App Metadata:', JSON.stringify(user.app_metadata, null, 2));
    
    console.log(`\n✨ STATUS:`);
    const canLogin = user.email_confirmed_at && !user.banned_until;
    const isAdmin = user.user_metadata?.admin === true;
    
    if (canLogin && isAdmin) {
      console.log('✅ This user CAN login as ADMIN');
    } else if (canLogin && !isAdmin) {
      console.log('✅ This user CAN login but is NOT an admin');
    } else if (!canLogin) {
      console.log('❌ This user CANNOT login');
      if (!user.email_confirmed_at) console.log('   Reason: Email not confirmed');
      if (user.banned_until) console.log('   Reason: Account banned');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/check-user.js <email>');
  console.error('Example: node scripts/check-user.js marketbyamie@gmail.com');
  process.exit(1);
}

checkUser(email);
