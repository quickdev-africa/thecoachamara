const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

function parseEnv(text){
  return text.split(/\n/).reduce((acc,line)=>{
    line=line.trim(); if(!line||line.startsWith('#')) return acc;
    const idx=line.indexOf('='); if(idx===-1) return acc;
    const k=line.slice(0,idx).trim(); const v=line.slice(idx+1).trim(); acc[k]=v; return acc;
  },{});
}

(async ()=>{
  const envPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) { console.error('.env.local missing'); process.exit(1); }
  const env = parseEnv(fs.readFileSync(envPath,'utf8'));
  const SUPABASE_URL = env.SUPABASE_URL;
  const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !KEY) { console.error('Missing SUPABASE_URL or service role key in .env.local'); process.exit(1); }
  const endpoints = [
    {label: 'payment_attempts for sim-ref-123', url: `${SUPABASE_URL}/rest/v1/payment_attempts?payment_reference=eq.sim-ref-123&select=*,orders(*)&order=created_at.desc`},
    {label: 'payments for sim-ref-123', url: `${SUPABASE_URL}/rest/v1/payments?reference=eq.sim-ref-123&select=id,reference,order_id,amount,status,created_at`},
    {label: 'recent orders for dev@example.com', url: `${SUPABASE_URL}/rest/v1/orders?customerEmail=eq.dev@example.com&select=id,order_number,customerEmail,total,created_at&order=created_at.desc&limit=5`}
  ];

  for(const e of endpoints){
    try{
      console.log('\n== '+e.label+' ==');
      const r = await fetch(e.url, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
      const txt = await r.text();
      try{ const j=JSON.parse(txt); console.log(JSON.stringify(j,null,2)); } catch(err){ console.log(txt); }
    }catch(err){ console.error('fetch error',err); }
  }
})();
