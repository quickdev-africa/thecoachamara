
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import PaystackOrderButton from './PaystackOrderButton';

export default function OrderQuantumMachinePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp: '',
    street: '',
    area: '',
    region: '',
    country: '',
    postalCode: '',
    lagosArea: '', // legacy, can be removed from logic later
    landmark: '',
    paymentOption: '',
    paymentMethod: '',
    deliveryPref: '',
    specialRequests: '',
    pickupLocation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPaymentOptionError, setShowPaymentOptionError] = useState(false);


  // Countdown timer logic
  // Set the countdown duration (e.g., 5 hours, 4 minutes, 5 seconds, 30 tenths)
  const COUNTDOWN_SECONDS = 4 * 60 * 60 + 4 * 60 + 5; // 4 hours, 4 minutes, 5 seconds
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setSecondsLeft(COUNTDOWN_SECONDS); // Restart timer
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Format timer as DD:HH:MM:SS
  const days = Math.floor(secondsLeft / 86400).toString().padStart(2, '0');
  const hours = Math.floor((secondsLeft % 86400) / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center justify-start font-sans text-black font-semibold text-lg md:text-xl">
      {/* Coach Amara at the top */}
      <div className="w-full flex justify-center pt-6 pb-2">
        <span className="text-lg md:text-xl font-bold text-amber-700 font-playfair tracking-wide">Coach Amara</span>
      </div>
  {/* Header Section */}
  <section className="w-full max-w-5xl mx-auto px-4 py-12 mb-10 bg-white rounded-2xl border border-gray-200 shadow text-center text-lg md:text-xl font-sans">
        <h1 className="text-4xl md:text-5xl font-extrabold font-playfair text-gray-900 mb-2 drop-shadow tracking-tight">
          Own Your Personal Quantum Energy Machine
        </h1>
  <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
          Unlimited Healing Sessions at Home Forever
        </h2>
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="uppercase text-xs font-bold text-amber-700 tracking-widest">Special Launch Price Ends In</span>
          {/* Countdown Timer */}
          <div className="flex flex-col items-center">
            <div className="flex gap-2 text-2xl md:text-3xl font-mono font-extrabold text-black bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
              <span>{days}</span><span>:</span><span>{hours}</span><span>:</span><span>{minutes}</span><span>:</span><span>{seconds}</span>
            </div>
            <div className="flex gap-8 justify-center mt-1 text-xs md:text-sm font-bold text-gray-600">
              <span className="w-12 text-center">Days</span>
              <span className="w-12 text-center">Hours</span>
              <span className="w-12 text-center">Minutes</span>
              <span className="w-12 text-center">Seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Video + Benefits Section */}
  <section className="w-full max-w-5xl mx-auto px-4 py-12 mb-10 bg-white rounded-2xl border border-gray-200 shadow grid md:grid-cols-2 gap-8 items-start text-lg md:text-xl font-sans">
        {/* Video */}
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
          {/* Replace with actual video player */}
          <video
            src="/quantum-demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="/quantum-poster.jpg"
          />
        </div>
        {/* Benefits Recap */}
        <div className="flex flex-col gap-4 justify-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-black mb-2">Why Choose the Quantum Energy Machine?</h3>
          <ul className="space-y-2 text-base md:text-lg text-black font-bold">
            <li className="flex items-center"><span className="mr-2 text-green-500">&#10003;</span> Boosts your body's natural healing power</li>
            <li className="flex items-center"><span className="mr-2 text-green-500">&#10003;</span> Reduces pain, inflammation, and fatigue</li>
            <li className="flex items-center"><span className="mr-2 text-green-500">&#10003;</span> Improves blood circulation and cell regeneration</li>
            <li className="flex items-center"><span className="mr-2 text-green-500">&#10003;</span> Non-invasive, no pills, no side effects</li>
            <li className="flex items-center"><span className="mr-2 text-green-500">&#10003;</span> Safe for everyone – even children and pregnant women</li>
          </ul>
        </div>
      </section>

      {/* Social Proof Section */}
  <section className="w-full max-w-5xl mx-auto px-4 py-12 mb-10 bg-white rounded-2xl border border-gray-200 shadow text-lg md:text-xl font-sans">
  <h3 className="text-3xl md:text-4xl font-extrabold text-black mb-4 text-center">Real Results from Real People</h3>
        <div className="flex flex-col gap-4 md:flex-row md:gap-8 justify-center items-center">
          <blockquote className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black font-bold max-w-sm text-center">
            <p className="mb-2">"I couldn't walk without pain. After 30 minutes on the Quantum Machine, I felt light, strong, and free."</p>
            <footer className="text-xs text-gray-500 font-semibold">— Mrs. Ada, Lagos</footer>
          </blockquote>
          <blockquote className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black font-bold max-w-sm text-center">
            <p className="mb-2">"My blood pressure dropped naturally after using the machine consistently. No drugs. No side effects."</p>
            <footer className="text-xs text-gray-500 font-semibold">— Mr. John, Abuja</footer>
          </blockquote>
        </div>
      </section>

      {/* Pricing & Order Form Section */}
  <section className="w-full max-w-5xl mx-auto px-4 py-12 mb-10 bg-white rounded-2xl border border-gray-200 shadow text-lg md:text-xl font-sans">
  <h3 className="text-3xl md:text-4xl font-extrabold text-black mb-6 text-center">Choose Your Payment Option</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Full Payment Option */}
          <label
            className={`border-4 rounded-xl p-5 bg-gray-50 flex flex-col cursor-pointer transition-all duration-150 ${form.paymentOption === 'full' ? 'border-amber-500 shadow-lg' : 'border-gray-200'}`}
            htmlFor="paymentOption-full"
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="paymentOption-full"
                name="paymentOption"
                value="full"
                required
                className="accent-amber-500 w-6 h-6 mr-3"
                checked={form.paymentOption === 'full'}
                onChange={e => setForm(f => ({ ...f, paymentOption: e.target.value }))}
              />
              <span className="text-lg font-bold text-emerald-700">🏆 Full Payment (Best Value)</span>
            </div>
            <span className="text-sm font-bold text-black mb-2">Save ₦300,000 + Bonuses</span>
            <div className="text-2xl font-extrabold text-black mb-1">₦900,000</div>
            <div className="text-xs text-gray-500 mb-2 line-through">Regular: ₦1,200,000</div>
            <ul className="text-sm font-bold text-black mb-2 space-y-1">
              <li>✅ FREE Lagos Delivery (₦25,000)</li>
              <li>✅ FREE Setup & Training (₦50,000)</li>
              <li>✅ 3-Year Extended Warranty (₦75,000)</li>
              <li>✅ Family Usage Guide (₦15,000)</li>
            </ul>
            <div className="text-xs text-gray-500">Total Value: ₦1,365,000</div>
          </label>
          {/* Payment Plan Option */}
          <label
            className={`border-4 rounded-xl p-5 bg-gray-50 flex flex-col cursor-pointer transition-all duration-150 ${form.paymentOption === 'plan' ? 'border-amber-500 shadow-lg' : 'border-gray-200'}`}
            htmlFor="paymentOption-plan"
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="paymentOption-plan"
                name="paymentOption"
                value="plan"
                required
                className="accent-amber-500 w-6 h-6 mr-3"
                checked={form.paymentOption === 'plan'}
                onChange={e => setForm(f => ({ ...f, paymentOption: e.target.value }))}
              />
              <span className="text-lg font-bold text-emerald-700">💳 Payment Plan</span>
            </div>
            <span className="text-sm font-bold text-black mb-2">Secure Payment Plan</span>
            <div className="text-2xl font-extrabold text-black mb-1">₦400,000</div>
            <div className="text-xs text-gray-500 mb-2">Down Payment Today</div>
            <div className="text-sm font-bold text-black mb-2">5 x ₦120,000 monthly</div>
            <div className="text-xs text-gray-500">Total: ₦1,000,000</div>
          </label>
        </div>
        {/* Order Form */}
        <form
          className="flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            // Paystack handled by button click
          }}
        >
          {/* Personal Information Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
            <h4 className="text-2xl font-extrabold text-emerald-700 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Personal Information
            </h4>
            <div className="grid md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="name">Full Name</label>
                <input required id="name" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Enter your full name" name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="phone">Phone Number</label>
                <input required id="phone" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="e.g. +2348012345678" name="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <span className="text-xs text-gray-500">WhatsApp preferred for updates</span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">Email Address</label>
                <input required id="email" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="you@email.com" name="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            {/* Delivery Preference Section - improved */}
            <div className="mt-4">
              <h5 className="text-lg font-bold text-gray-900 mb-2">Delivery Preference</h5>
              <div className="flex flex-wrap gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deliveryPref" value="pickup" required className="accent-emerald-600 w-5 h-5" checked={form.deliveryPref === 'pickup'} onChange={e => setForm(f => ({ ...f, deliveryPref: e.target.value }))} />
                  <span className="text-base font-semibold">Pick Up</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deliveryPref" value="ship" required className="accent-emerald-600 w-5 h-5" checked={form.deliveryPref === 'ship'} onChange={e => setForm(f => ({ ...f, deliveryPref: e.target.value }))} />
                  <span className="text-base font-semibold">Ship It</span>
                </label>
              </div>
            </div>
            {/* Special Requests field moved below Delivery Address section */}
          </div>
          {form.deliveryPref === 'pickup' && (
            <div className="mb-4">
              <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Choose Pickup Location</h4>
              <select
                required
                className="border border-gray-200 rounded px-3 py-2 text-black font-bold text-base md:text-lg font-sans w-full"
                name="pickupLocation"
                value={form.pickupLocation || ''}
                onChange={e => setForm(f => ({ ...f, pickupLocation: e.target.value }))}
              >
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
                    <input required id="street" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="House number, street, etc." name="street" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="area">City / Town</label>
                    <input required id="area" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="City or town" name="area" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="region">State / Province / Region</label>
                    <input required id="region" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="State, province, or region" name="region" value={form.region || ''} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="country">Country</label>
                    <input required id="country" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Country" name="country" value={form.country || ''} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="postalCode">Postal / ZIP Code <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input id="postalCode" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="Postal or ZIP code" name="postalCode" value={form.postalCode || ''} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="landmark">Nearest Landmark</label>
                    <input required id="landmark" className="border border-gray-200 rounded px-3 py-2 w-full text-black font-bold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400" placeholder="e.g. hospital, bus stop, etc." name="landmark" value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} />
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
                <textarea
                  id="specialRequests"
                  className="border border-gray-300 rounded px-3 py-2 w-full text-black font-semibold text-base md:text-lg font-sans focus:ring-2 focus:ring-amber-400 min-h-[60px] resize-y"
                  placeholder="e.g. Please call before delivery, I have a pacemaker, etc."
                  name="specialRequests"
                  rows={2}
                  value={form.specialRequests}
                  onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                />
              </div>
            </>
          )}

          {/* Special requests textarea removed here to avoid duplication; now only in Personal Information card */}
          {/* CTA reassurance text above the button (undo) */}
          <span className="text-xs text-gray-500 mt-2 text-center block">256-bit SSL Secured | Start Healing in 24 Hours</span>
          <PaystackOrderButton form={form} loading={loading} setLoading={setLoading} />
        </form>
      </section>
    </main>
  );
}
