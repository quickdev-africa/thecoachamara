/*
 Reconciliation script for placeholder products auto-created by funnel/create.
 Usage:
   node scripts/reconcile_placeholders.js --list
   node scripts/reconcile_placeholders.js --delete <productId>

 This script requires the following env vars to be set:
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY

 It's intentionally simple: it lists products where is_active = false and metadata._note indicates placeholder.
*/

const { createClient } = require('@supabase/supabase-js');
const argv = require('minimist')(process.argv.slice(2));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listPlaceholders() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', false)
    .like('metadata', '%_note%');

  if (error) {
    console.error('Failed to fetch placeholders', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No placeholder products found.');
    return;
  }

  console.log('Found placeholders:', data.map(d => ({ id: d.id, name: d.name, metadata: d.metadata })));
}

async function deletePlaceholder(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete placeholder', error);
    process.exit(1);
  }
  console.log('Deleted placeholder', id);
}

(async () => {
  if (argv.list) return await listPlaceholders();
  if (argv.delete) return await deletePlaceholder(argv.delete);
  console.log('Usage: --list or --delete <productId>');
})();
