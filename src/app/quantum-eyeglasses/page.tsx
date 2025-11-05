"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import CrispChat from '@/components/CrispChat';
import YouTube from 'react-youtube';

// CTA Button Component
const CTAButton = ({ className = '' }: { className?: string }) => (
  <Link
    href="/order-quantum-eyeglasses"
    className={`inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-lg transition-all ${className}`}
    aria-label="Order Your Quantum Eyeglasses Now"
    prefetch={false}
  >
    <FaCheckCircle className="mr-2 text-white/90 shrink-0" /> Order Your Quantum Eyeglasses Now
  </Link>
);

export default function QuantumEyeglassesPage() {
  // Countdown timer logic (reused from quantum page)
  function getNextDeadline() {
    const now = new Date();
    const deadline = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    deadline.setHours(23, 59, 59, 999);
    return deadline;
  }

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Timer implementation here (same as quantum page)
  }, []);

  return (
    <>
      <Head>
        <title>See Clearly Again — The Power of Quantum Energy Eyeglasses | Coach Amara</title>
        <meta name="description" content="Experience natural vision restoration with Quantum Energy Eyeglasses. Safe, effective relief from glaucoma, cataracts, and eye strain." />
      </Head>

      <main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black relative">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center py-12 md:py-24 px-4 bg-white text-center relative overflow-hidden border-b border-gray-100">
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight font-playfair text-amber-700 drop-shadow-lg tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 bg-clip-text text-transparent">See Clearly Again</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-black font-sans tracking-tight">A Natural Way to Restore, Protect, and Energize Your Eyes</h2>
            <p className="max-w-2xl mx-auto mb-10 text-xl md:text-2xl text-black/80 font-semibold">
              Imagine waking up every day with sharper, clearer vision. No more constant eye drops, hospital visits, or fear of blindness. Quantum Energy Eyeglasses are not just glasses — they are a healing tool designed to support your eyes' natural ability to repair themselves.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <FaLock className="text-amber-500" title="SSL Secured" />
              <span className="text-xs text-black/60">SSL Secured | Lagos, Nigeria</span>
            </div>
          </div>
        </section>

        {/* What Makes These Glasses Different Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">
              What Makes These Glasses Different
            </h2>
            <p className="text-lg md:text-xl text-center mb-8 text-black/80">
              Our Quantum Eyeglasses are infused with quantum photon, far-infrared, and scalar energy technology — the same frequencies your body uses to maintain balance and healing.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
                <span>Improve micro-circulation around the eyes</span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
                <span>Reduce eye pressure and strain caused by glaucoma and cataracts</span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
                <span>Activate the optic nerves and restore energy flow to the eyes</span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
                <span>Protect against harmful blue light and UV rays</span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
                <span>Boost concentration and relieve headaches or dizziness from eye fatigue</span>
              </li>
            </ul>
            <p className="text-center mt-8 text-lg text-black/80">
              They are safe, natural, and suitable for all ages, including children and the elderly.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-amber-700 font-playfair text-center drop-shadow tracking-tight">
            Real People. Real Healing.
          </h2>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="flex flex-col bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden p-6">
              <p className="text-lg md:text-xl font-medium mb-3 text-black/90">
                "After 30 years of glaucoma, doctors declared me free. I can see clearly again!"
              </p>
              <footer className="text-base text-black/60 font-semibold">— Azuka, Lagos</footer>
            </div>
            <div className="flex flex-col bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden p-6">
              <p className="text-lg md:text-xl font-medium mb-3 text-black/90">
                "My right eye was closed for decades. After wearing these glasses for a few weeks, it opened!"
              </p>
              <footer className="text-base text-black/60 font-semibold">— Moses, Benin</footer>
            </div>
            <div className="flex flex-col bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden p-6">
              <p className="text-lg md:text-xl font-medium mb-3 text-black/90">
                "I had cataracts and could barely read my Bible. Now I see without surgery."
              </p>
              <footer className="text-base text-black/60 font-semibold">— Mama Okojie</footer>
            </div>
          </div>
          <p className="text-center mt-8 text-xl font-medium text-black/80">
            Quantum Energy works by equipping your body to heal itself — because the body is the best healer when properly energized.
          </p>
        </section>

        {/* Why This Works Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-gradient-to-br from-amber-50 via-white to-amber-100 border-b border-amber-200">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-playfair text-amber-700 drop-shadow tracking-tight">
              Why This Works
            </h2>
            <div className="text-lg md:text-xl text-black/80 space-y-6">
              <p>
                Every cell in your body carries an electric charge. When your energy field weakens, your cells can't function optimally — leading to poor circulation, pressure, and degeneration in the eyes.
              </p>
              <p>
                Quantum Energy Eyeglasses restore energy balance around your optic nerves and retina.
                The result? Sharper vision, relief from eye pain, improved clarity, and gradual reversal of conditions like glaucoma and cataract.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-playfair text-amber-700 drop-shadow tracking-tight">
              Your Best Health Investment
            </h2>
            <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8 mb-8">
              <div className="text-3xl md:text-4xl font-bold text-black mb-4">₦285,600</div>
              <div className="text-lg text-black/80 mb-4">Use Duration: Lifetime</div>
              <p className="text-base text-black/70">
                No side effects. No maintenance costs. Only better vision, peace of mind, and long-term wellness.
              </p>
            </div>
            <p className="text-lg text-black/80">
              People spend millions on surgeries that fail to heal the root cause — but with Quantum Energy Eyeglasses, you're supporting your body to do what it was designed to do: heal itself naturally.
            </p>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-playfair text-amber-700 drop-shadow tracking-tight">
            Don't Wait Until It's Too Late
          </h2>
          <div className="max-w-2xl mx-auto text-center mb-8">
            <p className="text-xl mb-6">If your eyes could speak, they'd say "Thank you" for this.</p>
            <p className="text-lg text-black/80 mb-8">
              Thousands of people have already experienced healing and clarity through Quantum Energy.
              Now it's your turn.
            </p>
            <div className="space-y-4">
              <CTAButton className="w-full max-w-md" />
              <div className="text-base text-black/60">
                <span className="inline-flex items-center">
                  <FaCheckCircle className="mr-2 text-amber-500" /> Or Chat with our wellness consultant to learn which Quantum products best complement your healing journey.
                </span>
              </div>
            </div>
          </div>
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4 text-amber-700">Final Note</h3>
            <p className="text-lg text-black/80">
              True healing begins with belief — and Quantum Energy is faith meeting science.
              Don't live another day in limitation.
              Give your eyes the energy they need to see the world again.
            </p>
          </div>
        </section>
      </main>
      <CrispChat positionRight={true} themeColor="#25D366" />
    </>
  );
}