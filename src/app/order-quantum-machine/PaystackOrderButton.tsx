// src/app/order-quantum-machine/PaystackOrderButton.tsx

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface PaystackOrderButtonProps {
  form: {
    name: string;
    phone: string;
    email: string;
    paymentOption: string;
    deliveryPref: string;
    pickupLocation?: string;
    street?: string;
    area?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    landmark?: string;
    specialRequests?: string;
  };
  loading: boolean;
  setLoading: (loading: boolean) => void;
  cartSessionId: string;
  total: number;
  subtotal: number;
  shipping: number;
  quantity: number;
  canPay: boolean;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {        // CORRECT: returns an object
        openIframe: () => void;        // with openIframe method
      };
    };
  }
}

export default function PaystackOrderButton({
  form,
  loading,
  setLoading,
  cartSessionId,
  total,
  subtotal,
  shipping,
  quantity,
  canPay
}: PaystackOrderButtonProps) {
  const router = useRouter();

  const handlePayment = async () => {
    if (!canPay || loading) {
      return;
    }

    setLoading(true);

    try {
      // Check if Paystack is available, if not wait and retry
      let paystack = window.PaystackPop?.setup;
      if (!paystack) {
        console.log('Paystack not immediately available, waiting...');
        // Wait up to 3 seconds for Paystack to load
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (window.PaystackPop && typeof window.PaystackPop.setup === 'function') {
            paystack = window.PaystackPop.setup;
            break;
          }
        }
      }
      if (!paystack) {
        throw new Error('Payment system not available. Please refresh the page and try again.');
      }
      console.log('Paystack available, creating order...');
      // Get Paystack public key
      const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_KEY;
      if (!paystackKey) {
        throw new Error('Paystack public key not configured. Please contact support.');
      }
      console.log('Using Paystack key:', paystackKey?.substring(0, 10) + '...');
      // Step 1: Create order in database
      const orderData = {
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        items: [{
          productId: 'quantum-machine',
          productName: 'Quantum Energy Machine',
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
      console.log('Creating order with data:', orderData);
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      console.log('Order response status:', orderResponse.status);
      console.log('Order response headers:', orderResponse.headers);
      // Check if response is actually JSON
      const contentType = orderResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await orderResponse.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error(`API returned HTML instead of JSON. Check if the API route exists and is working. Response: ${textResponse.substring(0, 200)}...`);
      }
      const orderResult = await orderResponse.json();
      console.log('Order result:', orderResult);
      if (!orderResult.success || !orderResult.order?.id) {
        throw new Error(orderResult.error || 'Failed to create order');
      }
      const orderId = orderResult.order.id;
      console.log('Order created successfully:', orderId);
      // Step 2: Create payment attempt record - but don't fail if this fails
      const paymentReference = `QEM_${orderId}_${Date.now()}`;
      try {
        const paymentAttemptResponse = await fetch('/api/payments/attempt', {
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
        if (!paymentAttemptResponse.ok) {
          console.warn('Failed to create payment attempt record');
        }
      } catch (paymentAttemptError) {
        console.warn('Payment attempt logging failed:', paymentAttemptError);
        // Continue anyway - this is not critical
      }
      // Step 3: Initialize Paystack payment
      // Use the same 'paystack' variable, do not redeclare
      if (!paystack) {
        throw new Error('Payment system not available. Please refresh the page and try again.');
      }
      console.log('Initializing Paystack payment...');
      paystack({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: form.email,
        amount: total * 100, // Convert to kobo
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
        callback: async (response: any) => {
          console.log('Payment successful:', response);
          setLoading(false);
          try {
            // Update payment attempt as successful
            await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentReference: response.reference,
                paystackReference: response.reference,
                status: 'success'
              })
            });
            console.log('Payment verified, redirecting to thank you page...');
            // Redirect to premium thank you page
            router.push(`/thank-you-premium?order=${orderId}&ref=${response.reference}&amount=${total}`);
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            // Still redirect to thank you page as payment was successful
            router.push(`/thank-you-premium?order=${orderId}&ref=${response.reference}&amount=${total}`);
          }
        },
        onClose: () => {
          console.log('Payment modal closed');
          setLoading(false);
          // Show friendly message to user
          alert('Payment was cancelled. Your order has been saved and you can complete it later.');
        }
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
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
  };

  // Helper function for delivery zone calculation
  const getDeliveryZone = (state: string) => {
    const zones = {
      'Lagos': 'Zone 1',
      'Abuja': 'Zone 1', 
      'Port Harcourt': 'Zone 2',
      'Kano': 'Zone 2',
      'Enugu': 'Zone 2',
      'Ibadan': 'Zone 2'
    };
    return zones[state as keyof typeof zones] || 'Zone 3';
  };

  return (
    <button
      type="button"
      className={`w-full py-4 px-6 rounded-xl text-lg md:text-xl font-bold transition-all duration-200 ${
        canPay && !loading
          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      disabled={!canPay || loading}
      onClick={handlePayment}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing Payment...
        </div>
      ) : (
        `Pay Now - ₦${total.toLocaleString()}`
      )}
    </button>
  );
}