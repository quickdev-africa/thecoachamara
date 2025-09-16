"use client";
import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { usePaystack } from '@/hooks/usePaystack';
import PaystackButton from '@/components/PaystackButton';
import { PICKUP_LOCATIONS, calculateDeliveryFee, getDeliveryZone } from '@/lib/types';
import CrispChat from '@/components/CrispChat';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryPref: 'ship',
    street: '',
    area: '',
    region: '',
    city: '',
  postalCode: '',
  country: '',
  pickupLocation: ''
  });

  // helper: computed shipping zone name
  const shippingZoneName = getDeliveryZone(form.region || form.city || '') || undefined;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const products = items.map(i => ({ id: i.id, name: i.name, price: i.price, images: [i.image || '/logo.png'] }));

  // compute shipping based on delivery preference using centralized helper
  const shipping = form.deliveryPref === 'ship' ? calculateDeliveryFee(form.region || form.city || '') : 0;

  const paystack = usePaystack({ form, loading, setLoading, cartSessionId: 'local', total: subtotal + shipping, subtotal, shipping, quantity: items.reduce((s,i)=>s+i.quantity,0), products: products as any });

  function canProceed() {
    if (!form.name || !form.email || !form.phone || items.length === 0) return false;
    if (form.deliveryPref === 'ship') {
      return !!(form.street && form.city && form.region);
    }
    if (form.deliveryPref === 'pickup') {
      return !!form.pickupLocation;
    }
    return false;
  }

  function validateForm() {
    const e: Record<string,string> = {};
    if (!form.name) e.name = 'Please enter your name';
    if (!form.email) e.email = 'Please enter your email';
    if (!form.phone) e.phone = 'Please enter your phone number';
    if (form.deliveryPref === 'ship') {
      if (!form.street) e.street = 'Please enter street address';
      if (!form.city) e.city = 'Please enter city';
      if (!form.region) e.region = 'Please enter state / region';
    }
    if (form.deliveryPref === 'pickup') {
      if (!form.pickupLocation) e.pickupLocation = 'Please choose a pickup location';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <>
    <main className="min-h-screen bg-gray-50 px-4 py-12 font-sans antialiased text-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Checkout</h1>
          <p className="mt-2 text-sm text-gray-600">Complete your order and choose a delivery option</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: form */}
          <section className="md:col-span-7 bg-white p-8 rounded-xl shadow">
            {/* error summary for screen readers and visual */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-4" role="alert">
                <div className="text-sm text-red-600 font-medium">Please fix the following:</div>
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {Object.values(errors).map((msg, idx) => <li key={idx}>{msg}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Name</label>
                <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" aria-invalid={!!errors.name} />
                {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Email</label>
                <input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" aria-invalid={!!errors.email} />
                {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Phone</label>
                <input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" aria-invalid={!!errors.phone} />
                {errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm font-medium mb-3 text-gray-900">Delivery option</div>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center"><input type="radio" name="delivery" checked={form.deliveryPref==='ship'} onChange={()=>setForm({...form, deliveryPref:'ship'})} className="mr-2"/> <span className="text-sm">Ship</span></label>
                  <label className="inline-flex items-center"><input type="radio" name="delivery" checked={form.deliveryPref==='pickup'} onChange={()=>setForm({...form, deliveryPref:'pickup'})} className="mr-2"/> <span className="text-sm">Pickup</span></label>
                </div>
              </div>

              {form.deliveryPref === 'ship' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Street Address</label>
                    <input value={form.street} onChange={(e)=>setForm({...form, street: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" aria-invalid={!!errors.street} />
                    {errors.street && <div className="text-red-600 text-sm mt-1">{errors.street}</div>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900">Area / Landmark</label>
                    <input value={form.area} onChange={(e)=>setForm({...form, area: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">City</label>
                      <input value={form.city} onChange={(e)=>setForm({...form, city: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" aria-invalid={!!errors.city} />
                      {errors.city && <div className="text-red-600 text-sm mt-1">{errors.city}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">State / Region</label>
                      <input value={form.region} onChange={(e)=>setForm({...form, region: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" aria-invalid={!!errors.region} />
                      {errors.region && <div className="text-red-600 text-sm mt-1">{errors.region}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Postal code (optional)</label>
                      <input value={form.postalCode} onChange={(e)=>setForm({...form, postalCode: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Country</label>
                      <input value={form.country} onChange={(e)=>setForm({...form, country: e.target.value})} placeholder="Nigeria" className="mt-1 w-full p-3 border border-gray-200 rounded-lg bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {form.deliveryPref === 'pickup' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900">Select Pickup Location</label>
                  <select value={form.pickupLocation || PICKUP_LOCATIONS[0]} onChange={(e)=>setForm({...form, pickupLocation: e.target.value})} className="mt-1 w-full p-3 border border-gray-200 rounded bg-white" aria-invalid={!!errors.pickupLocation}>
                    {PICKUP_LOCATIONS.length > 1 ? <option value="">Choose pickup location</option> : null}
                    {PICKUP_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  {errors.pickupLocation && <div className="text-red-600 text-sm mt-1">{errors.pickupLocation}</div>}
                </div>
              )}
            </div>
          </section>

          {/* Right: order summary & payment */}
          <aside className="md:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <div className="mt-4 space-y-3">
                  {items.map(it => (
                    <div key={it.id} className="flex items-start justify-between gap-4">
                      <div className="text-sm text-gray-800">{it.name} <span className="text-xs text-gray-500">x{it.quantity}</span></div>
                      <div className="text-sm font-medium text-amber-600">₦{(it.price * it.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-4 text-sm text-gray-700">
                  <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-gray-900">₦{subtotal.toLocaleString()}</span></div>
                  <div className="flex items-center justify-between mt-2"><span>Shipping</span><span className="font-medium text-gray-900">{shipping > 0 ? `₦${shipping.toLocaleString()}` : 'Free / Pickup'}</span></div>
                  {shippingZoneName && <div className="mt-2 text-xs text-gray-600">Shipping zone: <span className="font-medium text-gray-800">{shippingZoneName}</span></div>}
                  <div className="mt-4 flex items-center justify-between text-lg font-bold">Total <span>₦{(subtotal + shipping).toLocaleString()}</span></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <PaystackButton loading={!!loading} canPay={!!canProceed()} paystackReady={true} total={subtotal + shipping} onClick={() => {
                  const ok = validateForm();
                  if (!ok) return;
                  paystack.handlePayment();
                }} />

                <div className="mt-4">
                  <button type="button" onClick={() => clearCart()} className="w-full border border-gray-200 rounded px-4 py-2 text-sm">Clear cart</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
    <CrispChat positionRight={true} themeColor="#25D366" />
    </>
  );
}
