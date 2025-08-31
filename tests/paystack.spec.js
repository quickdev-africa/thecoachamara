const { test, expect } = require('@playwright/test');

test('Paystack modal is invoked when clicking Pay Now', async ({ page }) => {
  // Intercept Paystack CDN requests so the headless browser doesn't get 403s or MIME errors
  await page.route('https://checkout.paystack.com/*', route => {
    const url = route.request().url();
    if (url.endsWith('.css')) {
      route.fulfill({ status: 200, contentType: 'text/css', body: '/* stub css */' });
    } else if (url.endsWith('.js')) {
      route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.__PAYSTACK_CDN_STUB = true;' });
    } else {
      route.fulfill({ status: 200, contentType: 'text/plain', body: '' });
    }
  });

  // Stub Paystack and runtime key before any page scripts execute
  await page.addInitScript(() => {
    window.__NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = 'pk_test_dummy_key';
    window.PaystackPop = {
      setup: function() {
        return function(cfg) {
          window.__paystack_called = true;
          window.__last_paystack_cfg = cfg;
          if (cfg && typeof cfg.callback === 'function') {
            setTimeout(() => cfg.callback({ reference: 'MOCK_REF' }), 50);
          }
        };
      }
    };
  });

  const port = process.env.PORT || 3001;
  await page.goto(`http://localhost:${port}/order-quantum-machine`, { waitUntil: 'load', timeout: 30000 });

  // Wait for app and shipping form to render
  await page.waitForSelector('#shipping-form', { timeout: 20000 });
  // Ensure inputs are available
  await page.waitForSelector('input[placeholder="Full Name"]', { timeout: 15000 });

  // small debug: capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('PAGE_CONSOLE_ERROR>', msg.text());
  });

  // Fill shipping form (step 1)
  await page.fill('input[placeholder="Full Name"]', 'Playwright Tester', { timeout: 10000 });
  await page.fill('input[placeholder="Phone"]', '08012345678', { timeout: 5000 });
  await page.fill('input[placeholder="Email"]', 'pw@test.example', { timeout: 5000 });
  await page.fill('input[placeholder="Address"]', '1 Test St', { timeout: 5000 });
  await page.fill('input[placeholder="Landmark (e.g. near Unity Church)"]', 'Near Park', { timeout: 5000 });
  await page.fill('input[placeholder="State"]', 'Lagos', { timeout: 5000 });

  // Proceed to step 2
  await page.click('button:has-text("Go To Step #2")');

  // Wait for Pay button to appear and click it
  await page.waitForTimeout(800); // small wait for UI transition
  // Ensure a payment option is selected (required by form validation)
  await page.waitForSelector('input[value="full"]', { timeout: 5000 });
  await page.check('input[value="full"]');

  // Click the submit/pay button (use submit to trigger validation + payment orchestration)
  await page.click('button[type="submit"]');

  // Wait for our stub to be called
  await page.waitForFunction(() => window.__paystack_called === true, { timeout: 5000 });
  const called = await page.evaluate(() => !!window.__paystack_called);
  expect(called).toBe(true);
});
