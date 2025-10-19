#!/usr/bin/env node
/**
 * List all regular (non-admin) users sorted by creation date
 * Usage: node scripts/list-regular-users.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function listRegularUsers() {
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

    const regularUsers = data.users
      .filter(user => !user.user_metadata?.admin)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by newest first

    console.log('👤 REGULAR USERS (sorted by newest first):');
    console.log('=====================================');
    if (regularUsers.length === 0) {
      console.log('No regular users found.\n');
    } else {
      regularUsers.forEach((user, index) => {
        const isRecent = index < 5 ? '🆕' : '🗑️';
        console.log(`${isRecent} ${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
        console.log('');
      });
    }

    console.log('📊 SUMMARY:');
    console.log('=====================================');
    console.log(`Total Regular Users: ${regularUsers.length}`);
    console.log(`Latest 5 to KEEP: ${Math.min(5, regularUsers.length)}`);
    console.log(`Old users to DELETE: ${Math.max(0, regularUsers.length - 5)}`);
    console.log('');
    console.log('🆕 = Will be KEPT');
    console.log('🗑️  = Will be DELETED');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

listRegularUsers();
