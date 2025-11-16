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
import { trackMeta } from '@/lib/meta';

// Product ID for Quantum Dry Bone Ceramic Tableware (from database)
const QUANTUM_PLATE_PRODUCT_ID = 'b16d49ca-ec30-49f7-8454-0e74d1425ee3';

const DEFAULT_REGULAR_PRICE = 324360;
const DISCOUNTED_PRICE = 324360;

function Testimonials({ className }: { className?: string }) {
  const items = [
    {
      text: 'After years of stomach pain and bloating, I finally found relief. My digestion is smooth and my energy is back!',
      author: 'Mama Chika — Lagos'
    },
    {
      text: 'I used to take antacids daily. Now I eat without worry. This tableware changed my life.',
      author: 'Dr. Eze — Abuja'
    },
    {
      text: 'My ulcer symptoms disappeared within weeks. I can finally enjoy my meals again!',
      author: 'Blessing — Port Harcourt'
    }
  ];

  return (
    <div className={`grid gap-6 ${className || 'grid-cols-1'}`}>
      {items.map((t, i) => (
        <div key={i} className="bg-[#FFD700] rounded-3xl p-8 shadow-2xl border border-amber-300 hover:scale-[1.01] transform-gpu transition-all">
          <div className="flex items-start gap-4">
            <div className="text-black text-4xl leading-none font-bold">"</div>
            <div>
              <div className="text-black font-bold text-xl md:text-2xl leading-relaxed">{t.text}</div>
              <div className="mt-4 text-base font-bold text-black/80">— {t.author}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderQuantumPlatePage() {
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
      // Try to fetch from API first
      if (productIdFromQuery) {
        const res = await fetch(`/api/products/${productIdFromQuery}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProducts([data.data]);
          setProductError(null);
          return;
        }
      }
      
      // Try to fetch from products API and find the tableware
      try {
        const resp = await fetch('/api/products');
        const d = await resp.json();
        const list: Product[] = Array.isArray(d.products) ? d.products : (Array.isArray(d.data) ? d.data : []);
        const match = list.find(p => p.id === QUANTUM_PLATE_PRODUCT_ID) || 
                     list.find(p => p.name && (
                       p.name.toLowerCase().includes('tableware') || 
                       p.name.toLowerCase().includes('plate') ||
                       p.name.toLowerCase().includes('ceramic')
                     ));
        if (match) {
          setProducts([match]);
          setProductError(null);
          return;
        }
      } catch (apiError) {
        console.log('API fetch failed, using fallback product');
      }
      
      // Fallback: Create a properly structured product that matches the API format
      const fallbackProduct: Product = {
        id: QUANTUM_PLATE_PRODUCT_ID,
        name: 'Quantum Dry Bone Ceramic Tableware',
        description: 'Natural healing energy with every meal. Transform your digestion and restore your gut health naturally.',
        price: DISCOUNTED_PRICE,
        images: ['/quantum-plate/tableware.jpg'],
        stock: 100,
        category_id: 'quantum-plate',
        isActive: true,
        featured: true,
        metadata: { 
          tags: ['quantum', 'tableware', 'digestion', 'healing']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setProducts([fallbackProduct]);
      setProductError(null);
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
  const productImage = product?.images?.[0] || '/quantum-plate/tableware.jpg';
  const heroImage = '/quantum-plate/tableware.jpg';
  const regularPrice = product?.price || DEFAULT_REGULAR_PRICE;
  const discounted = DISCOUNTED_PRICE;

  const quantity = 1;
  const subtotal = discounted * quantity;
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
    <style jsx global>{`
      /* Hide header only on this page */
      header,
      nav,
      [role="navigation"] {
        display: none !important;
      }
    `}</style>
    <main className="min-h-screen w-full bg-white text-black font-sans">
      <Head>
        <title>Order Quantum Energy Tableware — Coach Amara</title>
        <meta name="description" content="Order Quantum Dry Bone Ceramic Tableware — ₦324,360. Natural healing energy with every meal. Transform your digestion naturally." />
      </Head>

      {/* HERO SECTION */}
      <section className="w-full relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-100">
        <div className="relative z-10 w-full mx-auto py-20 px-6">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="bg-amber-400 text-black px-8 py-3 rounded-full text-xl md:text-2xl font-extrabold mb-4 shadow-xl">Eat Well. Heal Naturally.</div>
            <h1 className="text-gray-900 text-5xl md:text-7xl font-extrabold leading-tight mb-6 font-playfair">Quantum Energy Tableware</h1>

            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-2xl text-2xl md:text-3xl font-extrabold italic mb-8 shadow-xl">Transform Your Digestion</div>

            <div className="w-full flex justify-center mb-8">
              <button
                onClick={() => {
                  try {
                    trackMeta('InitiateCheckout', { value: DISCOUNTED_PRICE, currency: 'NGN', content_ids: [QUANTUM_PLATE_PRODUCT_ID], content_type: 'product' });
                  } catch {}
                  const section = document.getElementById('shipping-section');
                  if (section) {
                    const yOffset = typeof window !== 'undefined' && window.innerWidth < 768 ? -20 : -100;
                    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-5 px-12 text-2xl md:text-3xl font-extrabold shadow-2xl transition-all"
              >
                Order Now — ₦324,360
              </button>
            </div>

            {/* Hero Image */}
            <div className="w-full max-w-4xl mb-8">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400">
                <Image 
                  src={heroImage} 
                  alt="Quantum Energy Tableware" 
                  fill 
                  className="object-cover" 
                  priority
                />
              </div>
            </div>

            <div className="bg-amber-500 rounded-2xl px-8 py-5 mb-8 shadow-xl">
              <div className="text-white text-2xl md:text-3xl font-extrabold">₦324,360</div>
              <div className="text-white/90 text-sm md:text-base font-semibold mt-1">Lifetime Use • No Maintenance</div>
            </div>

            <p className="max-w-3xl text-gray-800 text-xl md:text-2xl font-semibold mb-8 leading-relaxed">Natural healing energy with every meal. Quantum Energy Tableware transforms your digestion, reduces bloating, and restores your gut health — naturally and without medication.</p>
          </div>
        </div>
      </section>

      {/* FORM / FUNNEL SECTION */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Left: Product Benefits (2/3 width) */}
          <div className="order-1 md:col-span-2">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 font-playfair">Why Quantum Energy Tableware Works</h2>
            <p className="text-2xl md:text-3xl font-bold text-amber-700 mb-8 leading-relaxed">The Power of Quantum Energy for Your Gut</p>

            <ul className="space-y-6 mb-10">
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-500 text-3xl font-bold">✓</span>
                <span className="text-xl md:text-2xl font-bold">Restore energy balance in your digestive system</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-500 text-3xl font-bold">✓</span>
                <span className="text-xl md:text-2xl font-bold">Reduce bloating, gas, and indigestion naturally</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-500 text-3xl font-bold">✓</span>
                <span className="text-xl md:text-2xl font-bold">Improve nutrient absorption and gut microbiome health</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-500 text-3xl font-bold">✓</span>
                <span className="text-xl md:text-2xl font-bold">Support natural healing from ulcers and gastritis</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-500 text-3xl font-bold">✓</span>
                <span className="text-xl md:text-2xl font-bold">Boost energy levels and mental clarity</span>
              </li>
              <li className="flex items-start gap-4 text-gray-800">
                <span className="mt-1 text-amber-500 text-3xl font-bold">✓</span>
                <span className="text-xl md:text-2xl font-bold">Safe, natural, and suitable for the whole family</span>
              </li>
            </ul>

            <div className="relative inline-flex items-center bg-amber-400 text-black px-8 py-6 rounded-r-2xl rounded-l-lg shadow-2xl">
              <div className="pr-6">
                <div className="text-base uppercase font-extrabold mb-1">Special Offer</div>
                <div className="text-2xl md:text-3xl font-extrabold">Get Quantum Energy Tableware for ₦324,360</div>
                <div className="text-base font-bold text-black/80 mt-1">Lifetime Use • No Side Effects • No Maintenance Costs</div>
              </div>
              <div className="ml-4 pl-4 border-l-2 border-black/20">
                <svg className="w-12 h-12 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Checkout Form (1/3 width) */}
          <div className="order-2 md:col-span-1 self-start">
            <div id="shipping-section" className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-2xl ring-1 ring-black/5 flex flex-col justify-start gap-3 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${step===1? 'bg-amber-500 text-white':'bg-gray-100 text-gray-500'}`}>1</div>
                  <div>
                    <div className="text-base font-extrabold">SHIPPING</div>
                    <div className="text-xs text-gray-600 font-semibold">Where To Ship</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-bold">Step {step} of 2</div>
              </div>

              <form id="shipping-form" onSubmit={step===1 ? handleSubmit(onSubmitStep1) : handleSubmit((data) => onPay(data))} className="space-y-3 text-sm">
                {productError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 font-semibold">{productError}</div>}

                {step === 1 && (
                  <div className="space-y-4">
                    {/* delivery preference */}
                    <div className="flex gap-2">
                      <label className={`flex-1 p-4 rounded-lg text-center text-base font-bold border-2 cursor-pointer transition-all ${form.deliveryPref==='ship' ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200'}`}>
                        <input className="mr-2" type="radio" {...register('deliveryPref', { required: true })} value="ship" /> Ship it
                      </label>
                      <label className={`flex-1 p-4 rounded-lg text-center text-base font-bold border-2 cursor-pointer transition-all ${form.deliveryPref==='pickup' ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200'}`}>
                        <input className="mr-2" type="radio" {...register('deliveryPref', { required: true })} value="pickup" /> Pickup
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <input {...register('name', { required: 'Full name is required' })} placeholder="Full Name" className="p-4 border-2 border-gray-200 rounded-lg text-base font-semibold w-full focus:border-amber-400 focus:outline-none" />
                        {errors.name && <div className="text-xs text-red-600 mt-1 font-bold">{(errors.name as any).message}</div>}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <input {...register('phone', { required: 'Phone is required' })} placeholder="Phone Number" className="p-4 border-2 border-gray-200 rounded-lg text-base font-semibold w-full focus:border-amber-400 focus:outline-none" />
                          {errors.phone && <div className="text-xs text-red-600 mt-1 font-bold">{(errors.phone as any).message}</div>}
                        </div>
                        <div>
                          <input {...register('email', { required: 'Email is required' })} placeholder="Email Address" type="email" className="p-4 border-2 border-gray-200 rounded-lg text-base font-semibold w-full focus:border-amber-400 focus:outline-none" />
                          {errors.email && <div className="text-xs text-red-600 mt-1 font-bold">{(errors.email as any).message}</div>}
                        </div>
                      </div>

                      {/* Conditional: pickup or shipping */}
                      {form.deliveryPref === 'pickup' ? (
                        <div className="w-full">
                          <select {...register('pickupLocation', { required: true })} defaultValue={PICKUP_LOCATIONS[0]} className="w-full p-4 border-2 border-gray-200 rounded-lg text-base font-semibold focus:border-amber-400 focus:outline-none">
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

                    <div className="pt-3">
                      <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-extrabold text-lg shadow-lg transition-all">Continue to Payment →</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    {/* back link */}
                    <div className="mb-2">
                      <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-600 hover:underline font-bold">← Back to shipping</button>
                    </div>
                    
                    {/* Product summary */}
                    <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border-2 border-amber-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-amber-300">
                          <Image src={productImage} alt={product?.name || 'Quantum Energy Tableware'} fill className="object-contain bg-white" />
                        </div>
                        <div>
                          <div className="font-extrabold text-base text-gray-900">{product?.name || 'Quantum Dry Bone Ceramic Tableware'}</div>
                          <div className="text-xs text-gray-600 font-semibold mt-1">Natural healing energy technology</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm border-t border-amber-200 pt-3">
                        <div className="text-gray-700 font-bold">Price</div>
                        <div className="font-extrabold text-amber-600 text-lg">₦{discounted.toLocaleString()}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <div className="text-gray-700 font-bold">Shipping</div>
                        <div className="font-bold text-gray-900">{shipping > 0 ? `₦${shipping.toLocaleString()}` : 'Pickup - Free'}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t-2 border-amber-300 pt-3 text-base">
                        <div className="text-gray-900 font-extrabold">Total</div>
                        <div className="font-extrabold text-black text-2xl">₦{total.toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <PaystackButton type="submit" loading={loading} canPay={canProceed} paystackReady={true} total={total} />
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="w-full bg-gradient-to-b from-white to-amber-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">Real Stories. Real Healing.</h2>
          <p className="text-xl md:text-2xl text-center text-gray-700 mb-12 font-semibold">See what others are saying about Quantum Energy Tableware</p>
          <Testimonials className="grid-cols-1 md:grid-cols-3" />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="w-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-10 shadow-2xl border-4 border-white flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl">🍽️</div>

            <div className="flex-1">
              <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent font-extrabold text-5xl md:text-6xl mb-4 leading-tight">Ready to Transform Your Digestion?</div>
              <div className="text-2xl md:text-3xl text-gray-900 font-extrabold mt-3">Secure yours today — limited availability.</div>
            </div>

            <div>
              <button 
                onClick={() => {
                  const section = document.getElementById('shipping-section');
                  if (section) {
                    const yOffset = typeof window !== 'undefined' && window.innerWidth < 768 ? -20 : -100;
                    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }} 
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-5 px-12 text-2xl md:text-3xl font-extrabold shadow-2xl transition-all"
              >
                Order Now — ₦324,360
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-black">
        <div className="max-w-6xl mx-auto px-4 py-12 text-gray-300">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="font-bold text-xl text-white mb-2">Coach Amara</div>
              <div className="mt-2 text-sm font-semibold">10 Ajibodu Street Karaole Estate</div>
              <div className="text-sm font-semibold">College Road Ogba, Lagos</div>
              <div className="mt-1 text-sm font-semibold">NIGERIA</div>
            </div>

            <div>
              <div className="font-bold text-xl text-white mb-2">Contact</div>
              <div className="mt-2 text-sm font-semibold">Phone: +2349127768471</div>
              <div className="mt-1 text-sm font-semibold">WhatsApp: +2348033320512</div>
              <div className="mt-1 text-sm font-semibold">Email: info@coachamara.com</div>
            </div>

            <div>
              <div className="font-bold text-xl text-white mb-2">Hours & Legal</div>
              <div className="mt-2 text-sm font-semibold">Mon – Fri: 9:00 AM – 6:00 PM</div>
              <div className="mt-1 text-sm font-semibold">© {new Date().getFullYear()} Coach Amara. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>
    </main>
    <CrispChat positionRight={true} themeColor="#25D366" />
    </>
  );
}
