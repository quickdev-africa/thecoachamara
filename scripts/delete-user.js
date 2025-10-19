#!/usr/bin/env node
/**
 * Delete a user from Supabase
 * Usage: node scripts/delete-user.js <email>
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function deleteUser(email) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    console.log(`🔍 Looking for user: ${email}\n`);
    
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      process.exit(1);
    }

    const user = data.users.find(u => u.email === email);

    if (!user) {
      console.log('❌ User not found');
      rl.close();
      process.exit(1);
    }

    console.log('📋 USER TO DELETE:');
    console.log('=====================================');
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user.id}`);
    console.log(`Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`Admin: ${user.user_metadata?.admin ? '✅ Yes' : '❌ No'}`);
    console.log('=====================================\n');

    // Check if --force flag is provided
    const forceFlag = process.argv.includes('--force');
    
    if (!forceFlag) {
      const confirm = await question('⚠️  Are you sure you want to DELETE this user? Type "DELETE" to confirm: ');
      
      if (confirm.trim() !== 'DELETE') {
        console.log('❌ Deletion cancelled');
        rl.close();
        process.exit(0);
      }
    } else {
      console.log('⚠️  --force flag detected, skipping confirmation...');
    }

    console.log('\n🗑️  Deleting user...');
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError.message);
      rl.close();
      process.exit(1);
    }

    console.log('✅ User deleted successfully!\n');
    rl.close();

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    rl.close();
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/delete-user.js <email>');
  console.error('Example: node scripts/delete-user.js user@example.com');
  process.exit(1);
}

deleteUser(email);
