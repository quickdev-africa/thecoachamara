const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function run() {
  const base = 'http://localhost:3000';
  const ts = Date.now();
  const payload = {
    name: 'Auto Smoke Join',
    email: `auto-join-${ts}@example.com`,
    phone: '+2348000000999',
    product: [], // non-order (free join)
    deliveryMethod: null,
  };

  console.log('Posting signup (non-order) ...');
  const resp = await fetch(base + '/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await resp.json().catch(() => ({}));
  console.log('Signup response:', resp.status, json);

  if (resp.ok && json && json.success) {
    console.log('SUCCESS: /api/signup non-order flow OK');
    process.exit(0);
  } else {
    console.error('FAIL: /api/signup non-order flow');
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(2);
});
