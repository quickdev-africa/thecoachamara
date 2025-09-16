const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const base = 'http://localhost:3000';
  console.log('Creating shipping order...');
  const shipResp = await fetch(base + '/api/funnel/create', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      customerName: 'Auto Smoke Ship', customerEmail: 'auto-ship@example.com', customerPhone: '+2348000000003',
      items: [{ productId: 'auto-smoke-ship', productName: 'Auto Ship Product', quantity:1, unitPrice:1200, totalPrice:1200 }],
      subtotal:1200, deliveryFee:100, total:1300,
      delivery: { method: 'shipping', shippingAddress: '55 Integration Lane, Lagos' }, metadata: { note: 'smoke' }
    })
  });
  const shipJson = await shipResp.json();
  console.log('Ship create:', shipJson);

  console.log('Creating pickup order...');
  const pickResp = await fetch(base + '/api/funnel/create', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      customerName: 'Auto Smoke Pick', customerEmail: 'auto-pick@example.com', customerPhone: '+2348000000004',
      items: [{ productId: 'auto-smoke-pick', productName: 'Auto Pick Product', quantity:1, unitPrice:2200, totalPrice:2200 }],
      subtotal:2200, deliveryFee:0, total:2200,
      delivery: { method: 'pickup', pickupLocation: 'Ikeja Hub' }, metadata: { note: 'smoke' }
    })
  });
  const pickJson = await pickResp.json();
  console.log('Pick create:', pickJson);

  // list
  const listResp = await fetch(base + '/api/orders?limit=5&offset=0');
  const listJson = await listResp.json();
  console.log('List result count:', listJson?.data?.length, 'meta.total:', listJson?.meta?.total);

  // delete the created ones
  const ids = [shipJson.orderId, pickJson.orderId].filter(Boolean).join(',');
  console.log('Deleting ids:', ids);
  const delResp = await fetch(base + '/api/orders?ids=' + encodeURIComponent(ids), { method: 'DELETE' });
  const delJson = await delResp.json();
  console.log('Delete result:', delJson);
}

run().catch(err => { console.error(err); process.exit(1); });
