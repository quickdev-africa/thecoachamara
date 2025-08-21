"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import type { YouTubePlayer, YouTubeEvent } from 'react-youtube';

function VideoHero() {
  const [muted, setMuted] = useState(true);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    event.target.playVideo();
    event.target.mute();
  };

  const handleMuteToggle = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setMuted((m) => !m);
  };

  return (
    <div className="w-4/5 aspect-video mb-8 relative mx-auto">
      <YouTube
        videoId="Z25AVZ3bS5I"
        className="w-full h-full"
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            controls: 0,
            playlist: 'Z25AVZ3bS5I',
            modestbranding: 1,
            showinfo: 0,
            rel: 0,
          },
        }}
        onReady={onReady}
      />
      <button
        onClick={handleMuteToggle}
        className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-amber-700 font-bold rounded-full p-3 shadow-lg transition-colors z-20 flex items-center"
        aria-label={muted ? 'Unmute video' : 'Mute video'}
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" />
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
        <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
      </button>
    </div>
  );
}
import YouTube from 'react-youtube';
import Head from 'next/head';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaCheckCircle, FaMapMarkerAlt, FaLock, FaFacebook, FaInstagram } from 'react-icons/fa';
import { metadata } from './metadata';

// FAQ Accordion Data and Component (move outside main component)
const faqData = [
  {
    question: 'Is the Quantum Energy Machine safe?',
    answer: "Yes! It's non-invasive, drug-free, and safe for all ages, including children and pregnant women. Always consult your doctor for medical advice.",
  },
  {
    question: 'How soon will I feel results?',
    answer: 'Many people feel relief after just one session, but results vary. Consistency brings the best outcomes.',
  },
  {
    question: 'Do I need a prescription?',
    answer: 'No prescription is needed. You can own your Quantum Machine or try a session at our Lagos center.',
  },
  {
    question: 'Where are you located?',
    answer: 'Our Lagos center is in Lekki Phase 1. We serve all of Lagos and can deliver nationwide.',
  },
  {
    question: 'Is there a guarantee?',
    answer: 'We offer a satisfaction guarantee for all first-time users. See our terms for details.',
  },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-4">
      {faqData.map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <button
            className={`w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-lg md:text-xl focus:outline-none transition-colors ${open === idx ? 'text-amber-700' : 'text-black/90'}`}
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
            aria-controls={`faq-panel-${idx}`}
          >
            <span className="flex items-center gap-2">
              <FaCheckCircle className={`text-amber-500 text-xl transition-transform ${open === idx ? 'rotate-90' : ''}`} />
              {item.question}
            </span>
            <svg className={`w-6 h-6 ml-2 transition-transform duration-200 ${open === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div
            id={`faq-panel-${idx}`}
            className={`px-6 pb-5 text-black/70 text-base md:text-lg transition-all duration-200 ${open === idx ? 'block' : 'hidden'}`}
            aria-hidden={open !== idx}
          >
            {item.answer}
          </div>
        </div>
      ))}
    </div>
  );
}

import Link from 'next/link';
const CTAButton = ({ className = '' }: { className?: string }) => (
  <Link
    href="/order-quantum-machine"
    className={`inline-flex items-center justify-center px-10 py-5 text-xl font-extrabold rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-2xl hover:scale-105 hover:shadow-amber-400/40 transition-transform duration-200 drop-shadow-lg font-sans ${className}`}
    aria-label="Get Your Quantum Machine Now"
    prefetch={false}
  >
    <FaCheckCircle className="mr-2 text-white/90" /> Get Your Quantum Machine Now
  </Link>
);

export default function QuantumPage() {
  // Countdown timer logic for 4-day auto-renewing countdown
  function getNextDeadline() {
    const now = new Date();
    const deadline = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    deadline.setHours(23, 59, 59, 999);
    return deadline;
  }

  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 0, minutes: 0, seconds: 0 });
  const [deadline, setDeadline] = useState(getNextDeadline());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let diff = deadline.getTime() - now.getTime();
      if (diff <= 0) {
        const newDeadline = getNextDeadline();
        setDeadline(newDeadline);
        diff = newDeadline.getTime() - now.getTime();
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);
  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://thecoachamara.com/quantum" />
        <meta property="og:image" content="/quantum-machine.jpg" />
        <meta name="robots" content="index, follow" />
        {/* <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} /> */}
        <link rel="canonical" href="https://thecoachamara.com/quantum" />
      </Head>
      <main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black relative">
        {/* Hero Section - now at the top */}
        <section className="w-full flex flex-col items-center justify-center py-24 px-4 bg-white text-center relative overflow-hidden border-b border-gray-100">
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight font-playfair text-amber-700 drop-shadow-lg tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 bg-clip-text text-transparent">Experience Healing Like Never Before</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-black font-sans tracking-tight">Your Personal Hospital at Home</h2>
            <p className="max-w-2xl mx-auto mb-10 text-xl md:text-2xl text-black/80 font-semibold">
              Discover the <strong>Quantum Energy Machine</strong> – a revolutionary <strong>non-invasive healing device</strong> trusted by people around the world for <strong>pain relief</strong>, <strong>energy restoration</strong>, and total wellness.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <FaLock className="text-amber-500" title="SSL Secured" />
              <span className="text-xs text-black/60">SSL Secured | Lagos, Nigeria</span>
            </div>
          </div>
        </section>
        {/* Video Section - now below hero */}
        <section className="w-full flex justify-center bg-white pt-0 pb-8 px-0">
          <VideoHero />
        </section>

        {/* CTA Button Section - between video and benefits */}
        <section className="w-full flex justify-center py-10 bg-white border-b border-gray-100">
          <CTAButton className="w-full max-w-md md:w-auto" />
        </section>
        {/* Benefits Section */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">Why Choose the Quantum Energy Machine?</h2>
          <ul className="max-w-3xl mx-auto grid gap-6 text-lg md:text-xl mb-10 text-black/90 font-bold md:grid-cols-2">
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Boosts your body&apos;s natural healing power</li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Reduces pain, inflammation, and fatigue</li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Improves blood circulation and cell regeneration</li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Non-invasive, no pills, no side effects</li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Safe for everyone – even children and pregnant women</li>
          </ul>
          <p className="text-center text-xl font-semibold text-amber-700 mb-10">
            People are walking away from years of pain and illness &mdash; after just a few sessions.
          </p>
        </section>

        {/* Social Proof Section */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-amber-700 font-playfair text-center drop-shadow tracking-tight">Real Results from Real People</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 mb-12">
            <blockquote className="bg-white border border-amber-200 p-8 rounded-3xl shadow-xl flex flex-col items-start">
              <p className="text-xl md:text-2xl font-medium mb-4 text-black/90">&quot;I couldn&apos;t walk without pain. After 30 minutes on the Quantum Machine, I felt light, strong, and free.&quot;</p>
              <footer className="text-base text-black/60 font-semibold">&mdash; Mrs. Ada, Lagos</footer>
            </blockquote>
            <blockquote className="bg-white border border-amber-300 p-8 rounded-3xl shadow-xl flex flex-col items-start">
              <p className="text-xl md:text-2xl font-medium mb-4 text-black/90">&quot;My blood pressure dropped naturally after using the machine consistently. No drugs. No side effects.&quot;</p>
              <footer className="text-base text-black/60 font-semibold">&mdash; Mr. John, Abuja</footer>
            </blockquote>
          </div>
          <div className="flex justify-center">
            <CTAButton />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">How the Quantum Energy Machine Works</h2>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 border border-gray-100">
            <p className="text-xl md:text-2xl text-center mb-4 text-black/80 font-semibold">
              The Quantum Machine uses <strong>7 healing light frequencies</strong> that penetrate deep into your body&apos;s cells, waking them up, clearing toxins, and restoring balance &mdash; naturally.
            </p>
            <p className="text-lg text-center text-black/70 mb-0">
              It&apos;s like a full medical team working inside your body, without surgery or drugs.
            </p>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">Who Can Benefit from Quantum Energy Healing?</h2>
          <ul className="max-w-3xl mx-auto grid gap-6 text-lg md:text-xl mb-0 text-black/90 font-bold md:grid-cols-2">
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> People dealing with arthritis, fatigue, or high blood pressure</li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Those recovering from stroke, cancer, or surgery</li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Anyone seeking to boost immunity, relax deeply, and feel younger</li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100"><FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" /> Wellness lovers who want to stay healthy and energised for life</li>
          </ul>
        </section>

        {/* Service Options Section - Two Column Layout */}
        <section className="w-full bg-gradient-to-br from-amber-50 via-white to-amber-100 border-b border-amber-200 flex justify-center min-h-[500px] md:min-h-[600px] py-10 md:py-20">
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
            {/* Left Column: All original content */}
            <div className="flex flex-col justify-center h-full px-4 md:px-8">
              <h2 className="text-4xl md:text-5xl font-bold text-left md:text-left mb-6 font-playfair text-amber-700 drop-shadow tracking-tight">Own Your Healing Power</h2>
              <div className="mb-6">
                <p className="text-2xl md:text-3xl font-bold text-amber-700 mb-2">Get a Special Discount on the Quantum Energy Machine!</p>
                <p className="text-lg md:text-xl text-black/80 font-bold mb-4">Unlock unlimited home healing for you and your loved ones. For a limited time, you can own your personal Quantum Machine at a never-before-seen price. This is your chance to take charge of your health, boost your energy, and say goodbye to pain and fatigue—naturally.</p>
                <p className="text-base md:text-lg text-black/70 font-bold mb-2">Hurry! This exclusive offer is only available for a short time. When the timer hits zero, the countdown resets, but the discount may end at any moment.</p>
              </div>
              {/* Countdown Timer */}
              <div className="flex flex-col items-start mb-8">
                <span className="uppercase text-sm font-bold text-amber-600 tracking-widest mb-2">Limited-Time Offer Ends In</span>
                <div className="flex gap-3 md:gap-6 text-3xl md:text-5xl font-mono font-extrabold text-amber-700 bg-white/80 rounded-2xl px-6 py-4 shadow border border-amber-200">
                  <div className="flex flex-col items-center"><span>{timeLeft.days}</span><span className="text-xs font-semibold text-black/60">Days</span></div>
                  <span>:</span>
                  <div className="flex flex-col items-center"><span>{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-xs font-semibold text-black/60">Hours</span></div>
                  <span>:</span>
                  <div className="flex flex-col items-center"><span>{String(timeLeft.minutes).padStart(2, '0')}</span><span className="text-xs font-semibold text-black/60">Minutes</span></div>
                  <span>:</span>
                  <div className="flex flex-col items-center"><span>{String(timeLeft.seconds).padStart(2, '0')}</span><span className="text-xs font-semibold text-black/60">Seconds</span></div>
                </div>
              </div>
              <CTAButton className="w-full max-w-md md:w-auto mb-6" />
              <div className="max-w-xl text-left text-base text-black/60">
                <span className="inline-flex items-center"><FaCheckCircle className="mr-2 text-amber-500" /> Or try a single session at our Lagos center first</span>
              </div>
            </div>
            {/* Right Column: Image */}
            <div className="relative w-full h-[350px] md:h-auto min-h-[400px] md:min-h-[600px]">
              <Image
                src="/amarawithquantum.jpg"
                alt="Amara with Quantum Energy Machine"
                fill
                className="object-cover w-full h-full rounded-none md:rounded-l-3xl shadow-xl bg-white"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">Frequently Asked Questions</h2>
          <FAQAccordion />
        </section>

        {/* Limited Offer Section */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">Limited-Time Offer: Try It for Yourself</h2>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8 border border-gray-100">
            <p className="text-xl md:text-2xl text-center mb-4 text-black/80 font-semibold">
              We&apos;re offering first-time users an exclusive opportunity to own their personal Quantum Energy Machine at a special discount.
            </p>
            <p className="text-lg text-center text-red-600 font-semibold mb-0">
              Don&apos;t wait for sickness to strike. Take charge of your health today.
            </p>
          </div>
        </section>

        {/* Final CTA Section - Improved */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-8 font-playfair text-amber-700 drop-shadow tracking-tight">Ready to Experience Quantum Healing?</h2>
          <p className="text-lg md:text-xl font-bold text-black/80 mb-6 text-center max-w-2xl">This is your moment to take charge of your health and well-being. <span className="text-amber-700 font-extrabold">Don&apos;t wait</span>—start your healing journey today and feel the difference for yourself.</p>
          <p className="text-base md:text-lg text-black/60 font-semibold mb-8 text-center max-w-xl">Opportunities like this don&apos;t come often. Take action now and unlock a new level of energy, relief, and vitality.</p>
          <CTAButton className="w-full max-w-md md:w-auto" />
        </section>


  {/* Footer removed as requested */}
      </main>
    </>
  );
}
