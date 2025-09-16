"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
// Fix PaystackPop type for TypeScript
declare global {
  interface Window {
    PaystackPop?: any;
  }
}
import { useRouter, useSearchParams } from 'next/navigation';
import { usePaystack } from '../../hooks/usePaystack';
import { useCallback } from 'react';
import PaystackButton from '../../components/PaystackButton';
import AddressForm from '../../components/AddressForm';
import { useForm } from 'react-hook-form';
import type { Product } from '../../lib/types';
import { PICKUP_LOCATIONS, calculateDeliveryFee } from '../../lib/types';
import CrispChat from '@/components/CrispChat';

const QUANTUM_PRODUCT_ID = 'a0e22d4f-b4aa-4704-b5f2-5fd801b1ed88';

const DEFAULT_REGULAR_PRICE = 3039600;
const DISCOUNTED_PRICE = 2900000;

function Testimonials({ className }: { className?: string }) {
  const items = [
    {
      text: 'After three weeks I slept better and woke with more energy. Sessions are gentle and noticeably calming.',
      author: 'Janet Okoye — Lagos'
    },
    {
      text: 'Tension and headaches eased within days. Easy to use and great support from the team.',
      author: 'Chinedu A. — Abuja'
    },
    {
      text: 'Now part of our routine — calmer evenings and more focus during the day. Delivery was smooth.',
      author: 'Blessing K. — Port Harcourt'
    }
  ];

  return (
    // force one column so items render as distinct stacked rows; caller may pass custom grid classes
    <div className={`grid gap-6 ${className || 'grid-cols-1'}`}>
      {items.map((t, i) => (
        <div key={i} className="bg-white rounded-3xl p-6 shadow-2xl border border-black/5 hover:scale-[1.01] transform-gpu transition-all">
          <div className="flex items-start gap-4">
            <div className="text-amber-400 text-3xl leading-none">“</div>
            <div>
              <div className="text-gray-800 italic text-lg leading-relaxed">{t.text}</div>
              <div className="mt-4 text-sm font-bold text-gray-600">— {t.author}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderQuantumMachinePage() {
  const search = useSearchParams();
  const productIdFromQuery = search?.get('productId') || '';
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [cartSessionId, setCartSessionId] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [productError, setProductError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<number>(1);

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({ mode: 'onChange' });
  const form = watch();

  // load deliveryPref from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('deliveryPref');
      if (saved) setValue('deliveryPref', saved);
    } catch {}
  }, [setValue]);

  // persist deliveryPref when it changes
  useEffect(() => {
    try {
      if (form?.deliveryPref) localStorage.setItem('deliveryPref', form.deliveryPref);
    } catch {}
  }, [form?.deliveryPref]);

  const loadProduct = useCallback(async () => {
    try {
      if (productIdFromQuery) {
        const res = await fetch(`/api/products/${productIdFromQuery}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProducts([data.data]);
          setProductError(null);
          return;
        }
      }
      // fallback to category loader
      const resp = await fetch('/api/products?category=quantum');
      const d = await resp.json();
      const list: Product[] = Array.isArray(d.products) ? d.products : (Array.isArray(d.data) ? d.data : []);
      // best-effort match: prefer exact quantum product id, then name match, then first
      const match = list.find(p => p.id === QUANTUM_PRODUCT_ID) || list.find(p => p.name && p.name.toLowerCase().trim().includes('quantum')) || list[0];
      if (match) {
        setProducts([match]);
        setProductError(null);
      } else {
        const sample = list.slice(0,5).map(p=>p.name).join(', ') || 'no products';
        setProducts([]);
        setProductError(`Product not found. Found ${list.length} product(s). Sample: ${sample}`);
      }
    } catch (e) {
      console.error(e);
      setProducts([]);
      setProductError('Failed to load product. Check server or network.');
    }
  }, [productIdFromQuery]);

  useEffect(() => {
    loadProduct();
    createCartSession();
  }, [loadProduct]);

  async function createCartSession() {
    try {
      const sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
      await fetch('/api/cart/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) });
      setCartSessionId(sessionId);
    } catch {
      setCartSessionId(`local_${Date.now()}`);
    }
  }

  const getProduct = () => products[0] || null;
  const product = getProduct();
  const productImage = product?.images?.[0] || (product as any)?.image || (product as any)?.metadata?.image || '/quantum-energy.jpg';
  // Use the canonical header image for this page's hero (user-provided file in public/)
  const heroImage = '/quantum-header.jpg';
  const regularPrice = product?.price || DEFAULT_REGULAR_PRICE;
  const discounted = DISCOUNTED_PRICE; // force discounted price per spec

  const quantity = 1;
  const subtotal = form.paymentOption === 'plan' ? 1500000 * quantity : discounted * quantity;
  const shipping = form.deliveryPref === 'ship' && form.region ? calculateDeliveryFee(form.region) : 0;
  const total = subtotal + shipping;

  const canProceed = isValid;

  // Paystack wiring
  const paystackHook = usePaystack({ form, loading, setLoading, cartSessionId, total, subtotal, shipping, quantity, products });
  const handlePayment = paystackHook.handlePayment;

  const onSubmitStep1 = (data: any) => {
    // move to billing
    setStep(2);
  };

  const onPay = async (validatedData: any) => {
    setLoading(true);
    try {
      await handlePayment(validatedData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <main className="min-h-screen w-full bg-white text-black font-sans">
      <Head>
        <title>Order Quantum Healing Machine — Coach Amara</title>
  <meta name="description" content="Order the Quantum Healing Machine — discounted price ₦2,900,000. Secure checkout, fast delivery across Nigeria." />
      </Head>

    {/* HERO — full-width background image with blended primary-black + secondary-yellow overlay; centered text/CTA
      Note: any inline top-bar/header removed to rely on global SiteHeader in root layout */}
      <section className="w-full relative overflow-hidden">
        {/* full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <Image src={heroImage} alt={product?.name || 'Quantum Healing Machine'} fill className="object-cover object-center" />
          {/* lighter overlay so the header image shows through more */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full mx-auto py-28 px-6">
          <div className="flex flex-col items-center text-center text-white max-w-4xl mx-auto">
            <div className="text-white text-lg md:text-xl font-extrabold italic mb-2">Hospital in the Home</div>
            <h1 className="text-white text-6xl md:text-7xl font-extrabold leading-tight mb-4">Quantum Healing Machine</h1>

            <div className="text-white text-2xl md:text-3xl italic mb-4">Energy | Wellness | Inner Balance</div>

            <div className="bg-black/40 rounded-xl px-6 py-4 mb-6">
              <div className="text-amber-400 text-lg md:text-xl font-extrabold">Discounted offer N2,900,000.00</div>
            </div>

            <p className="max-w-3xl text-white/90 text-lg md:text-xl mb-8">Step into the future of natural healing. The Quantum Healing Machine helps restore your body’s energy flow, reduce stress, and support deep wellness from within. Designed with advanced frequency technology, it works to harmonize mind, body, and spirit — so you can feel lighter, stronger, and more balanced every day.</p>

            <div className="w-full flex justify-center">
              <button
                onClick={() => {
                  // Mobile-only: jump straight to Shipping form
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    try { setStep(1); } catch {}
                    const el = document.getElementById('shipping-form');
                    if (el && 'scrollIntoView' in el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      window.scrollTo({ top: 700, behavior: 'smooth' });
                    }
                  } else {
                    // Desktop: keep existing behavior
                    window.scrollTo({ top: 700, behavior: 'smooth' });
                  }
                }}
                className="bg-amber-400 text-black rounded-2xl py-4 px-10 text-xl md:text-2xl font-extrabold shadow-lg"
              >
                Order Now — ₦2,900,000
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FORM / FUNNEL */}
      <section className="max-w-6xl mx-auto px-4 py-12">
  <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Left: Big descriptive column spanning 2/3 */}
          <div className="order-1 md:col-span-2">
            <h2 className="text-5xl md:text-6xl font-extrabold italic text-gray-900 leading-tight mb-6">About the Quantum Healing Machine</h2>
            <p className="text-xl md:text-2xl italic font-semibold text-gray-700 mb-8">A natural, non-invasive wellness device designed to support energy, sleep and recovery. Trusted by hundreds of customers.</p>

            <ul className="space-y-6 mb-8">
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-400 text-2xl">➤</span>
                <span className="text-xl md:text-2xl font-extrabold italic">Supports deep relaxation and better sleep</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-400 text-2xl">➤</span>
                <span className="text-xl md:text-2xl font-extrabold italic">Non-invasive, safe for home use</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-400 text-2xl">➤</span>
                <span className="text-xl md:text-2xl font-extrabold italic">Clinically-inspired energy balancing</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-400 text-2xl">➤</span>
                <span className="text-xl md:text-2xl font-extrabold italic">Fast shipping nationwide</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-400 text-2xl">➤</span>
                <span className="text-xl md:text-2xl font-extrabold italic">Boosts circulation and cellular vitality</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-400 text-2xl">➤</span>
                <span className="text-xl md:text-2xl font-extrabold italic">Enhances focus, clarity, and overall resilience.</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-400 text-2xl">➤</span>
                <span className="text-xl md:text-2xl font-extrabold italic">Fast shipping nationwide;</span>
              </li>
            </ul>

            <div className="relative inline-flex items-center bg-amber-400 text-black px-6 py-5 rounded-r-xl rounded-l-md shadow-xl">
              <div className="pr-6">
                <div className="text-sm uppercase font-bold">Instant Discount</div>
                <div className="text-2xl md:text-3xl font-extrabold italic">Get the device now for ₦2,900,000 <span className="text-lg md:text-xl line-through ml-3 font-semibold text-black/70">(was ₦3,039,600)</span></div>
              </div>
              <div className="ml-4 pl-4 border-l border-black/20">
                <svg className="w-12 h-12 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Compact thin shipping/billing card (1/3) */}
          <div className="order-2 md:col-span-1 self-start">
            <div className="bg-white p-4 rounded-2xl border shadow-2xl ring-1 ring-black/5 flex flex-col justify-start gap-2 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${step===1? 'bg-amber-400 text-black':'bg-gray-100 text-gray-500'}`}>1</div>
                  <div>
                    <div className="text-sm font-bold">SHIPPING</div>
                    <div className="text-xs text-gray-500">Where To Ship</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Step {step} of 2</div>
              </div>

              <form id="shipping-form" onSubmit={step===1 ? handleSubmit(onSubmitStep1) : handleSubmit((data) => onPay(data))} className="space-y-2 text-sm">
                {productError && <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">{productError}</div>}

                {step === 1 && (
                  <div className="space-y-3">
                    {/* delivery preference moved to the top for quick access */}
                    <div className="flex gap-2">
                      <label className={`flex-1 p-3 rounded-lg text-center text-sm border ${form.deliveryPref==='ship' ? 'bg-amber-50 border-amber-300' : 'bg-white'}`}>
                        <input className="mr-2" type="radio" {...register('deliveryPref', { required: true })} value="ship" /> Ship it
                      </label>
                      <label className={`flex-1 p-3 rounded-lg text-center text-sm border ${form.deliveryPref==='pickup' ? 'bg-amber-50 border-amber-300' : 'bg-white'}`}>
                        <input className="mr-2" type="radio" {...register('deliveryPref', { required: true })} value="pickup" /> Pickup
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <input {...register('name', { required: 'Full name is required' })} placeholder="Full Name" className="p-3 border rounded-lg text-sm w-full" />
                        {errors.name && <div className="text-xs text-red-600 mt-1">{(errors.name as any).message}</div>}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <input {...register('phone', { required: 'Phone is required' })} placeholder="Phone" className="p-3 border rounded-lg text-sm w-full" />
                          {errors.phone && <div className="text-xs text-red-600 mt-1">{(errors.phone as any).message}</div>}
                        </div>
                        <div>
                          <input {...register('email', { required: 'Email is required' })} placeholder="Email" type="email" className="p-3 border rounded-lg text-sm w-full" />
                          {errors.email && <div className="text-xs text-red-600 mt-1">{(errors.email as any).message}</div>}
                        </div>
                      </div>

                      {/* if pickup is selected only show pickup options (no address/state/landmark) */}
                      {form.deliveryPref === 'pickup' ? (
                        <div className="w-full">
                          <select {...register('pickupLocation', { required: true })} defaultValue={PICKUP_LOCATIONS[0]} className="w-full p-3 border rounded-lg text-sm">
                            {PICKUP_LOCATIONS.length > 1 ? <option value="">Choose pickup location</option> : null}
                            {PICKUP_LOCATIONS.map((loc) => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <AddressForm register={register} errors={errors} title="Shipping Address" />
                      )}
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="w-full bg-amber-500 text-black py-2 rounded-lg font-bold shadow-md">Go To Step #2</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    {/* back link to step 1 */}
                    <div className="mb-1">
                      <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-600 hover:underline">← Back to shipping</button>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md border">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 relative">
                          <Image src={productImage} alt={product?.name} fill className="object-cover rounded" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{product?.name || 'Quantum Healing Machine'}</div>
                          <div className="text-xs text-gray-600">{product?.description?.slice(0,100) || 'Powerful healing device for wellbeing.'}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="text-gray-500">Price</div>
                        <div className="font-extrabold text-amber-500">₦{discounted.toLocaleString()}</div>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <div className="text-gray-500">Shipping</div>
                        <div className="font-bold text-gray-700">{shipping > 0 ? `₦${shipping.toLocaleString()}` : 'Pickup - Free'}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
                        <div className="text-gray-500">Total</div>
                        <div className="font-extrabold text-black">₦{total.toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold mb-2">Payment Option</div>
                      <div className="flex gap-2">
                        <label className="flex-1 p-2 border rounded-md text-xs">
                          <input type="radio" {...register('paymentOption', { required: true })} value="full" /> <span className="ml-2">Full</span>
                        </label>
                        <label className="flex-1 p-2 border rounded-md text-xs">
                          <input type="radio" {...register('paymentOption', { required: true })} value="plan" /> <span className="ml-2">Plan</span>
                        </label>
                      </div>
                    </div>

                    {/* ONE-TIME OFFER BOX (visible only in Step 2) */}
                    <div className="mt-2 p-4 border-2 border-dashed border-pink-300 rounded-lg bg-pink-50">
                      <div className="font-extrabold text-sm text-pink-700 mb-2">Yes, I Will Take It!</div>
                      <div className="text-xs text-gray-700">ONE TIME OFFER: Unlock deeper healing with the Quantum Healing Machine. Experience advanced energy balancing that supports your body’s natural repair process, relieves stress, and boosts vitality. This exclusive upgrade is only available now — don’t miss the chance to amplify your results and take your wellness journey to the next level!</div>
                    </div>

                    <div>
                      {/* Use submit so react-hook-form validation runs first */}
                      <PaystackButton type="submit" loading={loading} canPay={canProceed} paystackReady={true} total={total} />
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section — full-bleed black + amber background with centered heading and two columns below */}
      <section className="w-full" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,1) 82%, rgba(245,158,11,1) 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="text-4xl md:text-5xl font-extrabold text-white">REAL HEALING SOLUTIONS</div>
            <div className="text-lg md:text-xl text-gray-200 italic mt-2">powered by…</div>
            <div className="text-3xl md:text-4xl text-amber-400 font-extrabold mt-3">QUANTUM ENERGY TECHNOLOGY</div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col">
              <div className="relative w-full h-[560px] rounded-2xl overflow-hidden mb-6 shadow-2xl ring-1 ring-black/30">
                <Image src="/quantum-machine-section.jpg" alt="Quantum machine" fill className="object-cover object-top" />
                <div className="absolute inset-0 bg-black/30" />
              </div>
              {/* intro blurb removed per request */}
            </div>

            <div>
              <div className="bg-transparent">
                <Testimonials className="grid-cols-1 md:grid-cols-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* White CTA section before footer */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-xl">⚡</div>

            <div className="flex-1">
              <div className="text-amber-400 italic font-extrabold text-3xl md:text-4xl drop-shadow">Ready to transform your wellness?</div>
              <div className="text-lg md:text-xl text-gray-700 mt-2">Secure yours today at the discounted price — limited availability.</div>
            </div>

            <div>
              <button onClick={() => document.getElementById('shipping-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-amber-400 text-black rounded-2xl py-4 px-10 text-xl md:text-2xl font-extrabold shadow-lg">Order Now — ₦2,900,000</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — blended black background, plain text (no clickable text) */}
      <footer className="w-full" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,1) 85%, rgba(10,10,10,1) 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-12 text-gray-300">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="font-bold text-lg">Coach Amara</div>
              <div className="mt-2 text-sm">10 Ajibodu Street Karaole Estate College Road Ogba, Lagos</div>
              <div className="mt-1 text-sm">NIGERIA</div>
            </div>

            <div>
              <div className="font-bold text-lg">Contact</div>
              <div className="mt-2 text-sm">Phone: +2349127768471</div>
              <div className="mt-1 text-sm">Email: info@coachamara.com</div>
            </div>

            <div>
              <div className="font-bold text-lg">Hours & Legal</div>
              <div className="mt-2 text-sm">Mon – Fri: 9:00 AM – 6:00 PM</div>
              <div className="mt-1 text-sm">© {new Date().getFullYear()} Coach Amara. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    </main>
    <CrispChat positionRight={true} themeColor="#25D366" />
    </>
  );
}