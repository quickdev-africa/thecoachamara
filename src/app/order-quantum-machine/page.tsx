"use client";

import React, { useEffect } from 'react';

// Fix PaystackPop type for TypeScript
declare global {
  interface Window {
    PaystackPop?: any;
  }
}
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import type { Product } from '../../lib/types';

// All duplicate code after this point has been removed.

// Delivery zones and fees
const DELIVERY_ZONES = {
  'Lagos': { zone: 'Zone 1', fee: 15000 },
  'Abuja': { zone: 'Zone 1', fee: 15000 },
  'Port Harcourt': { zone: 'Zone 2', fee: 25000 },
  'Kano': { zone: 'Zone 2', fee: 25000 },
  'Enugu': { zone: 'Zone 2', fee: 25000 },
  'Ibadan': { zone: 'Zone 2', fee: 25000 },
};

const getDeliveryInfo = (state: string) => {
  return DELIVERY_ZONES[state as keyof typeof DELIVERY_ZONES] || { zone: 'Zone 3', fee: 35000 };
};

const quantities = { full: 1, plan: 1 };

function TestimonialCarousel() {
  const testimonials = [
    { quote: "I feel healthier and more energized every day!", name: "Janet O." },
    { quote: "The Quantum Machine is a game changer. I sleep better and feel more balanced.", name: "Chinedu A." },
    { quote: "Coach Amara's community is so supportive. I found my tribe!", name: "Blessing K." },
    { quote: "I was skeptical, but the Quantum Machine really works!", name: "Tunde F." },
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i: number) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);
  return (
    <div className="flex flex-col items-start min-h-[80px]">
      <div className="text-black/80 italic mb-1">“{testimonials[idx].quote}”</div>
      <div className="text-black/60 text-sm">— {testimonials[idx].name}</div>
      <div className="flex gap-1 mt-2">
        {testimonials.map((_, i) => (
          <button key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-amber-500' : 'bg-amber-200'}`} onClick={() => setIdx(i)} aria-label={`Show testimonial ${i+1}`}/>
        ))}
      </div>
    </div>
  );
}

export default function OrderQuantumMachinePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [cartSessionId, setCartSessionId] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productError, setProductError] = React.useState<string | null>(null);
  const [paystackReady] = React.useState(true); // Always true for react-paystack
  const COUNTDOWN_SECONDS = 4 * 60 * 60 + 4 * 60 + 5;
  const [secondsLeft, setSecondsLeft] = React.useState(COUNTDOWN_SECONDS);

  // react-hook-form setup
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isValid } } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      whatsapp: '',
      street: '',
      area: '',
      region: '',
      country: 'Nigeria',
      postalCode: '',
      lagosArea: '',
      landmark: '',
      paymentOption: '',
      paymentMethod: '',
      deliveryPref: '',
      specialRequests: '',
      pickupLocation: '',
    }
  });

  // Show PaystackButton only after review
  const [showPaystack, setShowPaystack] = React.useState(false);

  // Handler for review & pay
  const onReviewAndPay = () => {
    setShowPaystack(true);
  };

  useEffect(() => {
    if (secondsLeft <= 0) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  useEffect(() => {
    loadQuantumProducts();
    createCartSession();
  }, []);

  const loadQuantumProducts = async () => {
    try {
      const response = await fetch('/api/products?category=quantum');
      const data = await response.json();
      let quantumProduct: Product | undefined = undefined;
      if (data.success && Array.isArray(data.products)) {
        quantumProduct = data.products.find((p: Product) => p.name && p.name.toLowerCase().includes('quantum'));
      }
      if (quantumProduct) {
        setProducts([quantumProduct]);
        setProductError(null);
      } else {
        // Fallback: Set a default quantum product if none found
        const defaultProduct: Product = {
          id: 'quantum-default',
          name: 'Quantum Energy Machine',
          description: 'Revolutionary healing device for pain relief and wellness',
          price: 3039600,
          category_id: 'quantum',
          images: ['/quantum-energy.jpg'],
          stock: 10,
          isActive: true,
          featured: true,
          metadata: {
            tags: ['quantum', 'healing', 'wellness']
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProducts([defaultProduct]);
        setProductError(null);
      }
    } catch (error) {
      // Fallback on error
      const defaultProduct: Product = {
        id: 'quantum-default',
        name: 'Quantum Energy Machine',
        description: 'Revolutionary healing device for pain relief and wellness',
        price: 3039600,
        category_id: 'quantum',
        images: ['/quantum-energy.jpg'],
        stock: 10,
        isActive: true,
        featured: true,
        metadata: {
          tags: ['quantum', 'healing', 'wellness']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProducts([defaultProduct]);
      setProductError('Using default product data. Please check your connection.');
      console.error('Failed to load products:', error);
    }
  };

  const createCartSession = async () => {
    try {
      const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await fetch('/api/cart/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (response.ok) {
        setCartSessionId(sessionId);
      }
    } catch (error) {
      console.error('Failed to create cart session:', error);
      setCartSessionId(`local_${Date.now()}`);
    }
  };

  const days = Math.floor(secondsLeft / 86400).toString().padStart(2, '0');
  const hours = Math.floor((secondsLeft % 86400) / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  // Watch form values for dynamic UI
  const form = watch();
  // Handle deliveryPref logic
  useEffect(() => {
    if (form.deliveryPref === 'pickup') {
      setValue('street', '');
      setValue('area', '');
      setValue('region', '');
      setValue('country', 'Nigeria');
      setValue('postalCode', '');
      setValue('landmark', '');
    }
  }, [form.deliveryPref, setValue]);

  const getProductPricing = () => {
  const baseProduct = products.find(p => p.name && p.name.toLowerCase().includes('quantum')) || products[0];
  const regularPrice = baseProduct?.price || 3039600;
    return {
      regular: regularPrice,
      discounted: 2800000,
      savings: regularPrice - 2800000,
      installmentDown: 1500000,
      installmentMonthly: 384900,
      installmentTotal: regularPrice
    };
  };

  const calculateTotals = () => {
    const pricing = getProductPricing();
    const quantity = quantities[form.paymentOption as keyof typeof quantities] || 1;
    const subtotal = form.paymentOption === 'full' 
      ? pricing.discounted * quantity
      : form.paymentOption === 'plan' 
        ? pricing.installmentDown * quantity
        : 0;
    const shipping = form.deliveryPref === 'ship' && form.region 
      ? getDeliveryInfo(form.region).fee 
      : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total, quantity };
  };

  // Validation is now handled by react-hook-form

  const { subtotal, shipping, total, quantity } = calculateTotals();
  const pricing = getProductPricing();
  const canPay: boolean = Boolean(isValid && !!form.paymentOption && !loading);
  const canOrder = products.length > 0;


  // Dynamically import PaystackButton for SSR safety
  const PaystackButton = dynamic(() => import('react-paystack').then(mod => mod.PaystackButton), { ssr: false });

  // Prepare Paystack config
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  const paystackConfig = {
    email: form.email,
    amount: total * 100,
    publicKey,
    currency: 'NGN',
    metadata: {
      custom_fields: [
        { display_name: 'Name', variable_name: 'name', value: form.name },
        { display_name: 'Phone', variable_name: 'phone', value: form.phone },
        { display_name: 'Payment Option', variable_name: 'payment_option', value: form.paymentOption },
        { display_name: 'Delivery', variable_name: 'delivery', value: form.deliveryPref },
      ]
    },
    onSuccess: async (response: any) => {
      setLoading(true);
      try {
        const orderData = {
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          items: [{
            productId: products[0]?.id,
            productName: products[0]?.name || 'Quantum Energy Machine',
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
            ? { method: 'pickup', location: form.pickupLocation, details: `Pickup at ${form.pickupLocation}` }
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
                zone: form.region ? getDeliveryInfo(form.region).zone : 'Zone 3'
              },
          metadata: {
            source: 'quantum-funnel',
            cartSessionId,
            paymentOption: form.paymentOption,
            quantity: quantity,
            specialRequests: form.specialRequests,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
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
        const orderResult = await orderResponse.json();
        if (orderResult.success && orderResult.order?.id) {
          await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentReference: response.reference,
              paystackReference: response.reference,
              status: 'success'
            })
          });
          window.location.href = `/thank-you-premium?order=${orderResult.order.id}&ref=${response.reference}&amount=${total}`;
        } else {
          alert(orderResult.error || 'Order creation failed after payment. Please contact support.');
        }
      } catch (err: any) {
        alert('Order creation or payment verification failed. Please contact support.');
      } finally {
        setLoading(false);
      }
    },
    onClose: () => {
      setLoading(false);
      alert('Payment was cancelled. Your order has not been completed.');
    }
  };

  return (
  <main className="min-h-screen w-full bg-white flex flex-col items-center justify-start font-sans text-black font-semibold text-lg md:text-xl">
        {/* HERO/HEADER SECTION */}
        <section className="w-full bg-gradient-to-b from-amber-50 to-white border-b border-amber-100 py-10 px-4 flex flex-col items-center text-center">
          <span className="text-3xl md:text-4xl font-extrabold text-amber-700 font-playfair drop-shadow mb-2">Order Your Quantum Energy Machine</span>
          <span className="text-lg md:text-2xl text-black/80 font-semibold max-w-2xl mx-auto mb-4">Experience revolutionary healing, pain relief, and total wellness at home. Secure your device now at a special price!</span>
          <img src="/quantum-energy.jpg" alt="Quantum Energy Machine" className="w-40 md:w-56 mx-auto rounded-xl shadow mb-4 border border-amber-100" />
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold mb-2">100% Secure • Fast Delivery Nationwide</span>
          </section>
        {/* Pricing & Order Form Section */}
        <section className="w-full max-w-5xl mx-auto px-4 py-12 mb-10 bg-white rounded-2xl border border-gray-200 shadow text-lg md:text-xl font-sans">
          <form className="space-y-6" autoComplete="off" onSubmit={handleSubmit(onReviewAndPay)}>
          {/* Remove productError message about missing product. Only show error if fetch fails. */}
          {productError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold">
              {productError}
            </div>
          )}
            {/* Name, Phone, Email */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="name">Full Name</label>
                <input id="name" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Your full name" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="phone">Phone</label>
                <input id="phone" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Phone number" {...register('phone', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">Email</label>
                <input id="email" type="email" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Email address" {...register('email', { required: true })} />
              </div>
            </div>

            {/* Payment Option - visually enhanced */}
            <div className="mb-6">
              <label className="block text-base font-bold text-amber-700 mb-2 font-playfair" htmlFor="full">Choose Your Payment Option</label>
              <div className="flex flex-col md:flex-row gap-4">
                <label className={`flex-1 flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${form.paymentOption === 'full' ? 'border-amber-500 bg-amber-50 shadow' : 'border-gray-200 bg-white'}`}>
                  <input type="radio" id="full" value="full" {...register('paymentOption', { required: true })} className="accent-amber-600 scale-125" />
                  <span className="flex flex-col items-start">
                    <span className="font-bold text-black">Full Payment</span>
                    <span className="text-emerald-700 font-bold text-lg">₦2,800,000</span>
                    <span className="text-xs text-emerald-600 font-semibold">Save ₦{pricing.savings.toLocaleString()} (Best Value)</span>
                  </span>
                </label>
                <label className={`flex-1 flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${form.paymentOption === 'plan' ? 'border-amber-500 bg-amber-50 shadow' : 'border-gray-200 bg-white'}`}>
                  <input type="radio" id="plan" value="plan" {...register('paymentOption', { required: true })} className="accent-amber-600 scale-125" />
                  <span className="flex flex-col items-start">
                    <span className="font-bold text-black">Payment Plan</span>
                    <span className="text-amber-700 font-bold text-lg">₦1,500,000 down</span>
                    <span className="text-xs text-amber-600 font-semibold">+ 4 x ₦384,900 monthly</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Delivery Preference */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="pickup">Delivery Preference</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" id="pickup" value="pickup" {...register('deliveryPref', { required: true })} className="accent-emerald-600" />
                  Pick Up
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" id="ship" value="ship" {...register('deliveryPref', { required: true })} className="accent-emerald-600" />
                  Ship It
                </label>
              </div>
            </div>

            {/* Pickup Location */}
            {form.deliveryPref === 'pickup' && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="pickupLocation">Choose Pickup Location</label>
                <select id="pickupLocation" className="border border-gray-200 rounded px-3 py-2 text-black font-bold text-base md:text-lg font-sans w-full" {...register('pickupLocation', { required: form.deliveryPref === 'pickup' })}>
                  <option value="">Select a location</option>
                  <option value="Lagos">Lagos (Mainland)</option>
                  <option value="Lekki">Lekki (Island)</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Owerri">Owerri</option>
                  <option value="Onitsha">Onitsha</option>
                  <option value="Benin">Benin</option>
                </select>
              </div>
            )}

            {/* Shipping Address */}
            {form.deliveryPref === 'ship' && (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm mt-4">
                  <h4 className="text-2xl font-extrabold text-emerald-700 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4M4 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" /></svg>
                    Delivery Address
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="street">Street Address</label>
                      <input id="street" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="House number, street, etc." {...register('street', { required: form.deliveryPref === 'ship' })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="area">City / Town</label>
                      <input id="area" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="City or town" {...register('area', { required: form.deliveryPref === 'ship' })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="region">State / Province / Region</label>
                      <input id="region" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="State, province, or region" {...register('region', { required: form.deliveryPref === 'ship' })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="country">Country</label>
                      <input id="country" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Country" {...register('country', { required: form.deliveryPref === 'ship' })} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="postalCode">Postal / ZIP Code <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input id="postalCode" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Postal or ZIP code" {...register('postalCode')} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="landmark">Nearest Landmark</label>
                      <input id="landmark" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="e.g. hospital, bus stop, etc." {...register('landmark', { required: form.deliveryPref === 'ship' })} />
                      <span className="text-xs text-gray-500">Helps our team find you faster</span>
                    </div>
                  </div>
                </div>
                {/* Special Requests section below Delivery Address */}
                <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 mb-4 shadow-sm mt-4">
                  <label className="block text-lg font-extrabold text-emerald-700 mb-2" htmlFor="specialRequests">
                    Special Requests or Health Needs
                    <span className="block text-xs font-normal text-gray-500 mt-1">Let us know about allergies, mobility needs, delivery instructions, or anything else to help us serve you better.</span>
                  </label>
                  <textarea id="specialRequests" className="border border-gray-300 rounded px-3 py-2 w-full text-black font-semibold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400 min-h-[60px] resize-y" placeholder="e.g. Please call before delivery, I have a pacemaker, etc." rows={2} {...register('specialRequests')} />
                </div>
              </>
            )}

            {/* Order Summary */}
            {form.paymentOption && form.deliveryPref && (
              <div className="bg-white border border-amber-200 rounded-2xl p-6 mb-4 shadow-md">
                <h4 className="text-xl md:text-2xl font-bold text-amber-700 mb-2">Order Summary</h4>
                <div className="text-base md:text-lg text-black space-y-2">
                  <div>
                    <span className="font-bold">Product:</span> Quantum Energy Machine
                  </div>
                  <div>
                    <span className="font-bold">Quantity:</span> {quantity}
                  </div>
                  <div>
                    <span className="font-bold">Payment Plan:</span> {form.paymentOption === 'full' ? 'Full Payment (Best Value)' : 'Payment Plan'}
                  </div>
                  {form.paymentOption === 'plan' && (
                    <div className="text-sm text-gray-600">
                      <span className="font-bold">Payment Schedule:</span> ₦{(pricing.installmentDown * quantity).toLocaleString()} today + 4 monthly payments of ₦{(pricing.installmentMonthly * quantity).toLocaleString()}
                    </div>
                  )}
                  <div>
                    <span className="font-bold">Delivery Method:</span> {form.deliveryPref === 'pickup' ? 'Pick Up' : 'Ship It'}
                  </div>
                  {form.deliveryPref === 'pickup' && form.pickupLocation && (
                    <div>
                      <span className="font-bold">Pickup Location:</span> {form.pickupLocation}
                    </div>
                  )}
                  {form.deliveryPref === 'ship' && form.region && (
                    <>
                      <div>
                        <span className="font-bold">Shipping State:</span> {form.region}
                      </div>
                      <div>
                        <span className="font-bold">Shipping Zone:</span> {getDeliveryInfo(form.region).zone}
                      </div>
                      <div>
                        <span className="font-bold">Shipping Cost:</span> ₦{shipping.toLocaleString()}
                      </div>
                    </>
                  )}
                  <div>
                    <span className="font-bold">Subtotal:</span> ₦{subtotal.toLocaleString()}
                  </div>
                  {form.deliveryPref === 'ship' && (
                    <div>
                      <span className="font-bold">Shipping:</span> ₦{shipping.toLocaleString()}
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2 text-lg md:text-xl font-extrabold">
                    <span className="font-bold text-amber-700">Total:</span> ₦{total.toLocaleString()}
                  </div>
                  {form.paymentOption === 'full' && (
                    <div className="text-sm text-emerald-600 font-semibold">
                      You save ₦{(pricing.savings * quantity).toLocaleString()} with full payment!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CTA reassurance text above the button */}
            <span className="text-xs text-gray-500 mt-2 text-center block">256-bit SSL Secured | Start Healing in 24 Hours</span>


            {/* Review & Pay button, then show PaystackButton after validation */}
            {!showPaystack && canPay && canOrder && publicKey && (
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl text-lg md:text-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                disabled={loading}
              >
                Review & Pay
              </button>
            )}
            {showPaystack && canPay && canOrder && publicKey && (
              <PaystackButton
                {...paystackConfig}
                text={"Pay Now - ₦" + total.toLocaleString()}
                className="w-full py-4 px-6 rounded-xl text-lg md:text-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                disabled={loading}
              />
            )}

            {/* User-friendly validation feedback */}
            {!canPay && !loading && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h5 className="text-sm font-semibold text-amber-800 mb-2">Please complete the following:</h5>
                <ul className="text-xs text-amber-700 space-y-1">
                  {!form.name && <li>• Enter your full name</li>}
                  {!form.phone && <li>• Enter your phone number</li>}
                  {!form.email && <li>• Enter your email address</li>}
                  {!form.paymentOption && <li>• Select a payment option (Full Payment or Payment Plan)</li>}
                  {!form.deliveryPref && <li>• Choose pickup or shipping</li>}
                  {form.deliveryPref === 'pickup' && !form.pickupLocation && <li>• Select a pickup location</li>}
                  {form.deliveryPref === 'ship' && !form.street && <li>• Enter your street address</li>}
                  {form.deliveryPref === 'ship' && !form.area && <li>• Enter your city/town</li>}
                  {form.deliveryPref === 'ship' && !form.region && <li>• Enter your state/region</li>}
                  {form.deliveryPref === 'ship' && !form.landmark && <li>• Enter a nearby landmark</li>}
                </ul>
              </div>
            )}
          </form>
        </section>
  </main>
  );
}