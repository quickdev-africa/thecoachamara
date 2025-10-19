#!/usr/bin/env node
/**
 * List all admin users from Supabase
 * Usage: node scripts/list-admin-users.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function listAdminUsers() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log('🔍 Fetching all users from Supabase...\n');
    
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      process.exit(1);
    }

    const adminUsers = data.users.filter(user => user.user_metadata?.admin === true);
    const regularUsers = data.users.filter(user => !user.user_metadata?.admin);

    console.log('👥 ADMIN USERS:');
    console.log('=====================================');
    if (adminUsers.length === 0) {
      console.log('No admin users found.\n');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
        console.log(`   Email Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
        console.log('');
      });
    }

    console.log('📊 SUMMARY:');
    console.log('=====================================');
    console.log(`Total Users: ${data.users.length}`);
    console.log(`Admin Users: ${adminUsers.length}`);
    console.log(`Regular Users: ${regularUsers.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

listAdminUsers();
