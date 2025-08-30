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
    // Defensive: check PaystackPop.setup
    let paystack = null;
    let attempts = 0;
    while (attempts < 30) {
      if (
        typeof window.PaystackPop === 'object' &&
        typeof window.PaystackPop.setup === 'function'
      ) {
        paystack = window.PaystackPop.setup;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (!paystack) {
      throw new Error('Payment system not available. Please refresh the page and try again.');
    }
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_KEY;
    if (!paystackKey) {
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
    const orderResponse = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const contentType = orderResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await orderResponse.text();
      throw new Error(`API returned HTML instead of JSON. Check if the API route exists and is working. Response: ${textResponse.substring(0, 200)}...`);
    }
    const orderResult = await orderResponse.json();
    if (!orderResult.success || !orderResult.order?.id) {
      throw new Error(orderResult.error || 'Failed to create order');
    }
    const orderId = orderResult.order.id;
    const paymentReference = `QEM_${orderId}_${Date.now()}`;
    try {
      await fetch('/api/payments/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentReference,
          amount: total,
          currency: 'NGN',
          paymentProvider: 'paystack'
        })
      });
    } catch {}
    paystack({
      key: paystackKey,
      email: form.email,
      amount: total * 100,
      currency: 'NGN',
      ref: paymentReference,
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
        })();
      },
      onClose: function() {
        setLoading(false);
        alert('Payment was cancelled. Your order has been saved and you can complete it later.');
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
