#!/usr/bin/env node
/**
 * Delete old regular users, keeping only the latest N users
 * Usage: node scripts/delete-old-users.js [--keep=5] [--force]
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

async function deleteOldUsers() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  // Parse arguments
  const keepCount = parseInt(process.argv.find(arg => arg.startsWith('--keep='))?.split('=')[1] || '5');
  const forceFlag = process.argv.includes('--force');

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

    const usersToKeep = regularUsers.slice(0, keepCount);
    const usersToDelete = regularUsers.slice(keepCount);

    console.log('📊 DELETION PLAN:');
    console.log('=====================================');
    console.log(`Total Regular Users: ${regularUsers.length}`);
    console.log(`Users to KEEP (${keepCount} newest): ${usersToKeep.length}`);
    console.log(`Users to DELETE (old): ${usersToDelete.length}`);
    console.log('=====================================\n');

    if (usersToDelete.length === 0) {
      console.log('✅ No users to delete!');
      rl.close();
      process.exit(0);
    }

    console.log('🗑️  USERS TO BE DELETED:');
    console.log('-------------------------------------');
    usersToDelete.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (Created: ${new Date(user.created_at).toLocaleString()})`);
    });
    console.log('-------------------------------------\n');

    console.log('✅ USERS TO BE KEPT:');
    console.log('-------------------------------------');
    usersToKeep.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (Created: ${new Date(user.created_at).toLocaleString()})`);
    });
    console.log('-------------------------------------\n');

    if (!forceFlag) {
      const confirm = await question(`⚠️  Are you sure you want to DELETE ${usersToDelete.length} old users? Type "DELETE ALL" to confirm: `);
      
      if (confirm.trim() !== 'DELETE ALL') {
        console.log('❌ Deletion cancelled');
        rl.close();
        process.exit(0);
      }
    } else {
      console.log('⚠️  --force flag detected, skipping confirmation...\n');
    }

    console.log('\n🗑️  Deleting users...\n');
    
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToDelete) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting ${user.email}: ${deleteError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Deleted: ${user.email}`);
          successCount++;
        }
      } catch (e) {
        console.error(`❌ Unexpected error deleting ${user.email}:`, e.message);
        errorCount++;
      }
    }

    console.log('\n📊 DELETION SUMMARY:');
    console.log('=====================================');
    console.log(`✅ Successfully deleted: ${successCount}`);
    console.log(`❌ Failed to delete: ${errorCount}`);
    console.log(`📋 Total remaining users: ${data.users.length - successCount}`);
    console.log('=====================================\n');

    rl.close();

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    rl.close();
    process.exit(1);
  }
}

deleteOldUsers();
