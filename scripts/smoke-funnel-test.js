(async () => {
  try {
    const base = process.env.BASE_URL || 'http://localhost:3000';
    console.log('Using base URL:', base);

    // Wait for the dev server to be reachable to avoid ECONNREFUSED errors
    async function waitForServer(url, { timeoutMs = 15000, intervalMs = 500 } = {}) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try {
          // try a lightweight request
          const resp = await fetch(url, { method: 'GET' });
          if (resp && (resp.status >= 200 && resp.status < 500)) {
            return true;
          }
        } catch (err) {
          // ignore and retry
        }
        await new Promise((r) => setTimeout(r, intervalMs));
      }
      throw new Error(`Timeout waiting for server at ${url}`);
    }

    await waitForServer(base).catch((err) => {
      console.warn('Server did not become ready in time:', err.message);
    });

    const payload = {
      customerName: 'Smoke Test User',
      customerEmail: 'smoketest@example.com',
      customerPhone: '+2348012345678',
      items: [
        {
          // Use canonical product UUID so funnel/create uses the existing product and does not create a placeholder
          productId: "0cd6d480-66ca-4e3c-9c8c-63a64f7fbb78",
          productName: "Quantum Energy Grapheme Men's underwear",
          quantity: 1,
          unitPrice: 98600,
          total: 98600,
          price: 98600
        }
      ],
      subtotal: 98600,
      deliveryFee: 0,
      total: 98600,
      delivery: { method: 'pickup', pickupLocation: 'Lagos' },
      metadata: { test: true }
    };

    console.log('\nPOST /api/funnel/create payload:\n', JSON.stringify(payload, null, 2));
    const funnelResp = await fetch(`${base}/api/funnel/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const funnelJson = await funnelResp.json().catch(() => null);
    console.log('\nFunnel response status:', funnelResp.status);
    console.log('Funnel response body:', JSON.stringify(funnelJson, null, 2));

    if (!funnelJson || !funnelJson.success) {
      console.error('Funnel create failed, aborting smoke test.');
      process.exit(1);
    }

    const paymentReference = funnelJson.paymentReference || funnelJson.paystackReference || null;
    const orderId = funnelJson.orderId || null;

    if (!paymentReference) {
      console.warn('No paymentReference returned by funnel; server may return an auth URL instead. Script finished.');
      process.exit(0);
    }

    console.log('\nCalling /api/payments/verify in simulate mode with paymentReference:', paymentReference);
    const smokeToken = process.env.SMOKE_TEST_TOKEN || null;
    const verifyHeaders = { 'Content-Type': 'application/json' };
    if (smokeToken) verifyHeaders['x-smoke-test-token'] = smokeToken;

    const verifyResp = await fetch(`${base}/api/payments/verify`, {
      method: 'POST',
      headers: verifyHeaders,
      body: JSON.stringify({ paymentReference, simulate: true })
    });
    const verifyJson = await verifyResp.json().catch(() => null);
    console.log('\nVerify response status:', verifyResp.status);
    console.log('Verify response body:', JSON.stringify(verifyJson, null, 2));

    console.log('\nSmoke test completed. Check admin pages (/admin/orders, /admin/payments) or Supabase DB for created rows.');
  } catch (e) {
    console.error('Smoke test error', e);
    process.exit(1);
  }
})();
