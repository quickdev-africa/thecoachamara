#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8');
    const lines = txt.split(/\r?\n/);
    const env = {};
    for (const l of lines) {
      const line = l.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      env[key] = val;
    }
    return env;
  } catch (e) {
    return {};
  }
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const envFile = path.join(repoRoot, '.env.local');
  const env = loadEnvFile(envFile);

  const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const APP_URL = process.env.APP_URL || env.NEXTAUTH_URL ? env.NEXTAUTH_URL.replace(/:\/\/[^:]+$/, 'http://localhost:3001') : (process.env.APP_URL || 'http://localhost:3001');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local or environment');
    process.exit(2);
  }

  const testEmail = `smoke+${Date.now()}@example.com`;
  const payload = {
    customerName: 'Smoke Test Buyer',
    customerEmail: testEmail,
    customerPhone: '+2348000000000',
    items: [
      { productId: 'test-prod-1', productName: 'Smoke Product', unitPrice: 1000, quantity: 1 }
    ],
    subtotal: 1000,
    deliveryFee: 0,
    total: 1000,
    delivery: {
      method: 'ship',
      shippingAddress: {
        street: '1 Smoke St',
        area: 'Test Area',
        city: 'Lagos',
        state: 'Lagos',
        postalCode: '100001',
        country: 'Nigeria'
      }
    }
  };

  try {
    console.log('Posting test order to', `${APP_URL}/api/funnel/create`);
    const postResp = await fetch(`${APP_URL}/api/funnel/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // small timeout not implemented - rely on default
    });
    const postJson = await postResp.text();
    console.log('POST status:', postResp.status);
    try { console.log('POST response:', JSON.parse(postJson)); } catch (e) { console.log('POST response (raw):', postJson); }
  } catch (e) {
    console.error('Failed to POST test order to local app:', e.message || e);
    console.error('If your dev server is running on a different port, set APP_URL env variable.');
  }

  // Wait briefly for DB writes
  await new Promise((r) => setTimeout(r, 1200));

  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/orders?select=*,order_items(*)&order=created_at.desc&limit=1`;
    console.log('Fetching latest order from Supabase REST:', url);
    const resp = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json'
      }
    });
    const text = await resp.text();
    let json;
    try { json = JSON.parse(text); } catch(e) { console.error('Failed to parse JSON from Supabase:', text); process.exit(3); }
    if (!Array.isArray(json) || json.length === 0) {
      console.error('No orders returned from Supabase REST.');
      console.log('Raw response:', JSON.stringify(json, null, 2));
      process.exit(4);
    }
    const order = json[0];
    console.log('Latest order (pretty):');
    console.log(JSON.stringify(order, null, 2));

    // Quick checks
    const items = order.order_items || [];
    const missingTotal = items.filter(it => it.total_price === null || it.total_price === undefined);
    if (missingTotal.length > 0) {
      console.error(`Found ${missingTotal.length} order_items with missing total_price`);
      process.exit(5);
    }
    if (order.shipping_address && order.shipping_address.country) {
      console.log('shipping_address.country:', order.shipping_address.country);
    } else if (order.delivery && order.delivery.shippingAddress && order.delivery.shippingAddress.country) {
      console.log('delivery.shippingAddress.country:', order.delivery.shippingAddress.country);
    } else {
      console.warn('Country not found in shipping_address or delivery.shippingAddress');
    }

    console.log('Smoke test completed successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Failed to fetch latest order from Supabase REST:', e.message || e);
    process.exit(6);
  }
}

main();
