const fetch = require('node-fetch');
const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) { console.error('Missing env'); process.exit(1); }
(async ()=>{
  const urls = [
    `${SUPABASE_URL}/rest/v1/payment_attempts?payment_reference=eq.sim-ref-123&select=*,orders(*)&order=created_at.desc`,
    `${SUPABASE_URL}/rest/v1/payments?select=*&order=created_at.desc&limit=10`,
    `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=10`
  ];
  for (const u of urls) {
    console.log('\n== ' + u + '\n');
    const res = await fetch(u, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    const text = await res.text();
    console.log(text);
  }
})();
