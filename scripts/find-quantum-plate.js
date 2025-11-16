// Script to find Quantum Tableware product in database
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

async function findQuantumPlate() {
  try {
    console.log('Searching for Quantum Tableware products...\n');
    
    // Search for tableware, plate, or ceramic products
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, description')
      .or('name.ilike.%tableware%,name.ilike.%plate%,name.ilike.%ceramic%,name.ilike.%quantum%');
    
    if (error) {
      console.error('Query error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} matching product(s):\n`);
      data.forEach((p, i) => {
        console.log(`${i + 1}. ID: ${p.id}`);
        console.log(`   Name: ${p.name}`);
        console.log(`   Price: ₦${p.price?.toLocaleString() || 'N/A'}`);
        console.log(`   Description: ${p.description || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('No matching products found.');
      console.log('\nTrying to list all products...\n');
      
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(20);
      
      if (allError) {
        console.error('Error listing products:', allError);
      } else if (allProducts && allProducts.length > 0) {
        console.log(`Showing first ${allProducts.length} products:\n`);
        allProducts.forEach((p, i) => {
          console.log(`${i + 1}. ${p.name} (₦${p.price?.toLocaleString() || 'N/A'}) - ID: ${p.id}`);
        });
      } else {
        console.log('No products found in database.');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

findQuantumPlate();
