const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const base = 'http://localhost:3000';
  console.log('Seeding dev payment...');
  const seedResp = await fetch(base + '/api/dev/seed-payments?dev_seed=true', { method: 'POST' });
  const seedJson = await seedResp.json();
  console.log('Seed response:', seedJson && seedJson.success ? 'OK' : 'FAIL', JSON.stringify(seedJson));
  if (!seedJson || !seedJson.success || !Array.isArray(seedJson.data) || seedJson.data.length === 0) {
    console.error('Seeder failed');
    process.exit(2);
  }

  const ref = seedJson.data[0].reference;
  console.log('Looking for seeded reference:', ref);

  // Wait a moment for DB visibility
  await new Promise(r => setTimeout(r, 500));

  const listResp = await fetch(base + '/api/payments?limit=50', { headers: { 'Cache-Control': 'no-cache' } });
  const listJson = await listResp.json();
  const found = (listJson && Array.isArray(listJson.data)) ? listJson.data.find(p => p.reference === ref) : null;

  if (found) {
    console.log('SUCCESS: Seeded payment found in /api/payments');
    console.log('Found record:', found);
    // cleanup: attempt to delete the seeded row via dev delete endpoint
    try {
      const delResp = await fetch(base + '/api/dev/seed-payments?dev_seed=true', { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ reference: ref }) });
      const delJson = await delResp.json();
      console.log('Cleanup delete response:', delJson);
    } catch (err) {
      console.warn('Cleanup delete failed', err);
    }

    process.exit(0);
  } else {
    console.error('FAIL: Seeded payment NOT found in /api/payments');
    console.error('List meta:', listJson && listJson.meta);
    // dump first few references for debugging
    if (listJson && Array.isArray(listJson.data)) {
      console.error('First 10 refs:', listJson.data.slice(0,10).map(d => d.reference));
    }
    process.exit(3);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
