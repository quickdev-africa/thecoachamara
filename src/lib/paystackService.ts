// Handles Paystack and backend API logic. All original logic preserved.
import type { Product } from '../lib/types';

export async function createOrderAndInitPayment({
  form,
  cartSessionId,
  total,
  subtotal,
  shipping,
  quantity,
  products,
  setLoading,
  router
}: {
  form: any;
  cartSessionId: string;
  total: number;
  subtotal: number;
  shipping: number;
  quantity: number;
  products: Product[];
  setLoading: (loading: boolean) => void;
  router: any;
}) {
  function getDeliveryZone(state: string) {
    const zones = {
      'Lagos': 'Zone 1',
      'Abuja': 'Zone 1',
      'Port Harcourt': 'Zone 2',
      'Kano': 'Zone 2',
      'Enugu': 'Zone 2',
      'Ibadan': 'Zone 2'
    };
    return zones[state as keyof typeof zones] || 'Zone 3';
  }

  try {
    // Ensure Paystack inline script is loaded and available as window.PaystackPop.setup
    const ensurePaystackLoaded = async () => {
      // Return the PaystackPop object (not just the setup function), so calls keep the
      // correct `this` context. Extracting the setup function and calling it loses `this`
      // and causes errors like "this.initialize is not a function".
      if (typeof (window as any).PaystackPop === 'object' && typeof (window as any).PaystackPop.setup === 'function') return (window as any).PaystackPop;
      // try to load script if not present
      if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
        const s = document.createElement('script');
        s.src = 'https://js.paystack.co/v1/inline.js';
        s.async = true;
        document.head.appendChild(s);
      }
      let attempts = 0;
      while (attempts < 50) {
        if (typeof (window as any).PaystackPop === 'object' && typeof (window as any).PaystackPop.setup === 'function') {
          return (window as any).PaystackPop;
        }
        await new Promise(resolve => setTimeout(resolve, 150));
        attempts++;
      }
      return null;
    };
    const paystackPop = await ensurePaystackLoaded();
    if (!paystackPop) {
      console.error('Paystack inline script not available on window after loading attempts.');
      throw new Error('Payment system not available. Please refresh the page and try again.');
    }
  // Use the public key exposed to the client. Keep this singular to avoid confusion.
  // Prefer environment-injected public key, fallback to window-exposed value from layout
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || (window as any).__NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      console.error('Paystack public key missing. Check NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY env and layout exposure.');
      throw new Error('Paystack public key not configured. Please contact support.');
    }
  // Use selectedProductId from form if present, otherwise fallback to first product
  let product = null;
  if (form.selectedProductId) {
    product = products.find((p: Product) => p.id === form.selectedProductId);
  }
  if (!product) {
    product = products[0];
  }
  // Defensive: if productId is not a valid UUID, show error and abort
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!product?.id || !uuidRegex.test(product.id)) {
    setLoading(false);
    alert('Sorry, the product information is unavailable. Please contact support or try again later.');
    return;
  }
  const productId = product.id;
  const orderData = {
  productId,
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      items: [{
        productId,
        productName: product?.name || 'Quantum Energy Machine',
        quantity: quantity,
        unitPrice: subtotal / quantity,
        totalPrice: subtotal,
        paymentOption: form.paymentOption,
        regularPrice: form.paymentOption === 'full' ? 3039600 : 3039600,
        discountedPrice: form.paymentOption === 'full' ? 2800000 : 1500000
      }],
      subtotal,
      deliveryFee: shipping,
      total,
      delivery: form.deliveryPref === 'pickup' 
        ? { 
            method: 'pickup', 
            location: form.pickupLocation,
            details: `Pickup at ${form.pickupLocation}`
          }
        : {
            method: 'shipping',
            address: {
              street: form.street,
              city: form.area,
              state: form.region,
              country: form.country,
              postalCode: form.postalCode,
              landmark: form.landmark
            },
            zone: form.region ? getDeliveryZone(form.region) : 'Zone 3'
          },
      metadata: {
        source: 'quantum-funnel',
        cartSessionId,
        paymentOption: form.paymentOption,
        quantity: quantity,
        specialRequests: form.specialRequests,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        pricing: {
          regularPrice: 3039600,
          finalPrice: subtotal / quantity,
          totalSavings: form.paymentOption === 'full' ? (3039600 - 2800000) * quantity : 0
        }
      }
    };
    // Create the order + payment attempt on the server atomically via funnel endpoint.
    const funnelResp = await fetch('/api/funnel/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const funnelContentType = funnelResp.headers.get('content-type') || '';
    if (!funnelContentType.includes('application/json')) {
      const text = await funnelResp.text();
      throw new Error(`Funnel API returned unexpected response. Response: ${text.substring(0, 200)}...`);
    }
    const funnelResult = await funnelResp.json();
    if (!funnelResult.success || !funnelResult.orderId || !funnelResult.paymentReference) {
      throw new Error(funnelResult.error || 'Failed to initialize payment on server');
    }
    const orderId = funnelResult.orderId;
    const paymentReference = funnelResult.paymentReference;
    // amount returned is expected in NGN (integer). Use it if present, otherwise fall back to client total.
    const payAmountNgn = typeof funnelResult.amount === 'number' ? funnelResult.amount : total;
    // If server returned a Paystack authorization URL, prefer it (server-initialized reference)
    const authorizationUrl = funnelResult.paystackAuthorizationUrl || null;
    const serverPaystackRef = funnelResult.paystackReference || null;

    if (authorizationUrl) {
      // Redirect user to Paystack-hosted checkout (recommended for server-side initialize)
      window.location.href = authorizationUrl;
      return;
    }

    return new Promise<void>(async (resolve) => {
      try {
        const refToUse = serverPaystackRef || paymentReference;
        // call setup on the PaystackPop object so `this` inside setup is correct
        const handler = paystackPop.setup({
          key: paystackKey,
          email: form.email,
          amount: payAmountNgn * 100,
          currency: 'NGN',
          ref: refToUse,
          firstname: form.name.split(' ')[0] || form.name,
          lastname: form.name.split(' ').slice(1).join(' ') || '',
          phone: form.phone,
          metadata: {
            orderId,
            source: 'quantum-funnel',
            cartSessionId,
            paymentOption: form.paymentOption,
            custom_fields: [
              {
                display_name: 'Delivery Method',
                variable_name: 'delivery_method',
                value: form.deliveryPref === 'pickup' ? `Pickup: ${form.pickupLocation}` : 'Shipping'
              }
            ]
          },
          callback: function(response: any) {
            (async () => {
              setLoading(false);
              try {
                await fetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    paymentReference: response.reference,
                    paystackReference: response.reference,
                    status: 'success'
                  })
                });
                router.push(`/thank-you-premium?order=${orderId}&ref=${response.reference}&amount=${total}`);
              } catch {
                router.push(`/thank-you-premium?order=${orderId}&ref=${response.reference}&amount=${total}`);
              }
              resolve();
            })();
          },
          onClose: function() {
            setLoading(false);
            alert('Payment was cancelled. Your order has been saved and you can complete it later.');
            resolve();
          }
        });

        // Some Paystack builds return a handler that requires openIframe() to be called.
        if (handler && typeof handler.openIframe === 'function') {
          try { handler.openIframe(); } catch (e) { /* ignore */ }
        }
      } catch (e) {
        console.error('Error initializing Paystack:', e);
        setLoading(false);
        alert('Payment initialization failed. Please try again later.');
        resolve();
      }
    });
  } catch (error) {
    setLoading(false);
    let errorMessage = 'Payment failed. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('API returned HTML')) {
        errorMessage = 'Server error: API route not found. Please contact support.';
      } else {
        errorMessage = error.message;
      }
    }
    alert(errorMessage);
  }
}
