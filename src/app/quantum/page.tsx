"use client";
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplet, Leaf, Sun, Circle, Star, Sparkles } from 'lucide-react';

const iconMap = {
  flame: Flame,
  droplet: Droplet,
  leaf: Leaf,
  sun: Sun,
  circle: Circle,
  star: Star,
  sparkles: Sparkles,
};

function FlipCard({ item, idx }: { item: { color: string; label: string; bg: string; icon: keyof typeof iconMap; benefit: string }; idx: number }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = iconMap[item.icon];
  // Flip on hover only
  return (
    <div
      className={`relative w-full md:w-1/7 flex-1 flex-shrink-0 ${item.bg} ${item.color === 'white' ? 'text-black' : 'text-white'} cursor-pointer group focus:outline-none 
        transition-shadow duration-200 
        shadow-md md:shadow-lg 
        rounded-2xl md:rounded-none 
        mb-4 md:mb-0 
        active:scale-95 
        ${item.color === 'white' ? 'border border-gray-200' : ''}
        aspect-[4/3] xs:aspect-[5/4] sm:aspect-[6/5] md:aspect-square min-h-[90px] xs:min-h-[110px] sm:min-h-[130px] md:min-h-0 max-h-[120px] xs:max-h-[140px] sm:max-h-[160px] md:max-h-none
      `}
      style={{ minWidth: 0 }}
      tabIndex={0}
      aria-label={item.label + ' color therapy card'}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      role="button"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl md:rounded-none flex items-center justify-center transition-transform duration-200 [perspective:1200px]"
        style={{
          willChange: 'transform',
          perspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Front Side: Icon and Title always visible, flips to show benefit only */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl md:rounded-none font-bold 
            text-[1.35rem] xs:text-[1.5rem] sm:text-[1.7rem] md:text-[1.7rem] select-none 
            px-2 xs:px-4 sm:px-6 md:px-0
            ${item.color === 'white' ? 'text-black' : 'text-white'}`}
          style={{
            background: 'inherit',
            zIndex: 2,
            transform: 'rotateY(0deg)',
            backfaceVisibility: 'hidden',
            direction: 'ltr',
          }}
        >
          <Icon size={44} className="mb-2" aria-hidden="true" />
          <span className="mt-1 font-extrabold tracking-tight text-center leading-tight">{item.label}</span>
        </div>
        {/* Back Side: Only benefit text */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl md:rounded-none font-semibold md:font-mono 
            text-[1.1rem] xs:text-[1.2rem] sm:text-[1.3rem] md:text-[1.05rem] px-2 xs:px-4 sm:px-6 md:px-2 text-center 
            ${item.color === 'white' ? 'text-black' : 'text-white'}`}
          style={{
            background: 'inherit',
            zIndex: 1,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            direction: 'ltr',
          }}
        >
          <span className="leading-snug xs:leading-normal sm:leading-normal md:leading-normal">{item.benefit}</span>
        </div>
      </motion.div>
    </div>
  );
}
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
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(open === idx ? null : idx);
    } else if (e.key === 'ArrowDown') {
      setOpen((open === null || open === faqData.length - 1) ? 0 : (open + 1));
    } else if (e.key === 'ArrowUp') {
      setOpen((open === null || open === 0) ? faqData.length - 1 : (open - 1));
    }
  };
  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-4">
      {faqData.map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <button
            className={`w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-lg md:text-xl focus:outline-none transition-colors group ${open === idx ? 'text-amber-700 bg-amber-50' : 'text-black/90'}`}
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
            aria-controls={`faq-panel-${idx}`}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            <span className="flex items-center gap-2">
              <FaCheckCircle className={`text-amber-500 text-xl transition-transform group-hover:scale-110 ${open === idx ? 'rotate-90' : ''}`} />
              <span className="underline decoration-amber-400/60 decoration-2 underline-offset-2 group-hover:decoration-amber-600">{item.question}</span>
            </span>
            <svg className={`w-6 h-6 ml-2 transition-transform duration-200 ${open === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <AnimatePresence initial={false}>
            {open === idx && (
              <motion.div
                id={`faq-panel-${idx}`}
                className="px-6 pb-5 text-black/70 text-base md:text-lg"
                aria-hidden={open !== idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <span className="block animate-fadeInUp">{item.answer}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

import Link from 'next/link';
const CTAButton = ({ className = '' }: { className?: string }) => (
  <Link
    href="/order-quantum-machine"
    className={`inline-flex items-center justify-center 
      px-5 py-3 text-base rounded-xl 
      sm:px-8 sm:py-4 sm:text-lg sm:rounded-2xl 
      md:px-10 md:py-5 md:text-xl md:rounded-full 
      font-extrabold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-2xl 
      hover:scale-105 hover:shadow-amber-400/40 transition-transform duration-200 drop-shadow-lg font-sans 
      ${className}`}
    aria-label="Get Your Quantum Machine Now"
    prefetch={false}
  >
    <FaCheckCircle className="mr-2 text-white/90" /> Get Your Quantum Machine Now
  </Link>
);

export default function QuantumPage() {
  // New Section: Why Every Home Needs the Quantum Machine
  // Uses /public/quantum-energy.jpg if available, else TODO comment
  const quantumImage = '/quantum-header.jpg'; // Updated to use the new header image
  // If not, replace with a TODO comment below

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
        {/* Why Every Home Needs the Quantum Machine Section (NEW) */}
        <section className="w-full relative min-h-[480px] md:min-h-[600px] flex flex-col justify-center items-center border-b border-gray-100 overflow-hidden">
          {/* Full-width background image */}
          <Image
            src={quantumImage}
            alt="Quantum Energy Machine in every home"
            fill
            className="object-cover w-full h-full absolute inset-0 z-0"
            priority
            sizes="100vw"
          />
          {/* Overlay for contrast */}
          <div className="absolute inset-0 bg-black/60 md:bg-black/65 z-10" />
          {/* Content overlay */}
          <div className="relative z-20 w-full flex flex-col items-center justify-center py-20 md:py-32 px-4">
            <h2 className="text-4xl xs:text-5xl md:text-7xl font-extrabold leading-tight font-playfair tracking-tight text-center mb-10 drop-shadow-xl text-white">
              Why Every Home Needs the Quantum Machine
            </h2>
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 md:p-14 border border-yellow-400 text-lg md:text-2xl text-black font-playfair font-bold mb-0 w-full max-w-3xl text-center leading-relaxed">
              <p className="mb-6">It’s not a good approach to depend on chemical drugs for the rest of your life. Imagine living free — without being tied down to daily medications. Don’t you think that would be better?</p>
              <p className="mb-0">That’s exactly what Quantum Energy makes possible.</p>
            </div>
            <CTAButton className="w-full max-w-md md:w-auto mt-10" />
          </div>
        </section>

        {/* Modern Two-Column Section (Full Width, No Padding/Margin, Contrasting BGs) */}
        <section className="w-full flex flex-row flex-wrap border-b border-gray-100">
          {/* Left Column */}
          <div className="flex-1 min-w-[320px] bg-amber-50 flex items-center justify-center py-10 md:py-24">
            <div className="max-w-2xl w-full px-3 xs:px-4 sm:px-6 md:px-16 text-base xs:text-lg md:text-2xl font-semibold text-black/80 leading-relaxed">
              <p className="mb-8 break-words">
                For those already managing terminal or lifelong conditions like
                <span className="text-amber-700 font-extrabold text-lg xs:text-xl md:text-2xl md:text-3xl italic underline underline-offset-4 mx-1 md:mx-2">hypertension</span>,
                <span className="text-amber-700 font-extrabold text-lg xs:text-xl md:text-2xl md:text-3xl italic underline underline-offset-4 mx-1 md:mx-2">diabetes</span>,
                <span className="text-amber-700 font-extrabold text-lg xs:text-xl md:text-2xl md:text-3xl italic underline underline-offset-4 mx-1 md:mx-2">arthritis</span>,
                or other chronic diseases, Quantum Energy becomes a
                <span className="text-amber-700 font-extrabold text-lg xs:text-xl md:text-2xl md:text-3xl italic underline underline-offset-4 mx-1 md:mx-2">game-changer</span>.
                When you use the Quantum Machine, your body responds better to treatments. Many patients see their doctors gradually reduce their dosage of drugs — and some even get to a point where the doctor says,
                <span className="italic text-amber-700 text-lg xs:text-xl md:text-2xl md:text-3xl font-bold underline underline-offset-4 mx-1 md:mx-2">“You don’t need these drugs anymore.”</span>
              </p>
            </div>
          </div>
          {/* Right Column */}
          <div className="flex-1 min-w-[320px] bg-amber-600 flex items-center justify-center py-16 md:py-24">
            <div className="max-w-2xl px-8 md:px-16 text-lg md:text-2xl font-semibold text-white leading-relaxed">
              <p className="mb-8">
                This is why the Quantum Machine is inevitable.
                <span className="font-extrabold text-2xl md:text-3xl italic underline underline-offset-4 mx-2">It is not a luxury — it’s a must-have in every home.</span>
                Whether you’re currently battling a health challenge or want to prevent future ones, the Quantum Machine provides the support your body needs to heal naturally.
              </p>
            </div>
          </div>
        </section>
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
          <p className="text-2xl md:text-3xl font-extrabold text-amber-700 bg-amber-50 rounded-xl px-6 py-4 text-center shadow-lg border border-amber-200 mb-10">
            People are walking away from years of pain and illness &mdash; after just a few sessions.
          </p>
        </section>

        {/* ...existing code... */}

        {/* How It Works Section */}
        <section className="w-full flex flex-col border-b border-gray-100 bg-white">
          {/* Heading above columns */}
          <h2 className="w-full text-3xl xs:text-4xl md:text-5xl font-bold font-playfair text-amber-700 drop-shadow tracking-tight mb-0 py-8 px-4 text-center">How the Quantum Energy Machine Works</h2>
          <div className="flex flex-col md:flex-row items-stretch w-full">
            {/* Left: Text with its own background */}
            <div className="flex-1 flex flex-col justify-center items-center md:items-center py-0 px-0 bg-amber-50">
              <div className="w-full h-full flex flex-col gap-6 items-center justify-center px-4 xs:px-6 py-10 md:py-0">
                <p className="text-lg xs:text-xl md:text-2xl text-black/80 font-semibold text-center mb-4">
                  The Quantum Machine uses <span className="font-extrabold text-amber-700">7 healing light frequencies</span> that penetrate deep into your body&apos;s cells, waking them up, clearing toxins, and restoring balance &mdash; naturally.
                </p>
                <p className="text-xl xs:text-2xl md:text-3xl font-extrabold text-amber-700 text-center mb-0">
                  It&apos;s like a full medical team working inside your body, without surgery or drugs.
                </p>
              </div>
            </div>
            {/* Right: Image with its own background */}
            <div className="flex-1 min-h-[260px] md:min-h-[420px] flex items-center justify-center relative bg-black">
              <div className="w-full h-full min-h-[260px] md:min-h-[420px] flex items-center justify-center">
                <Image
                  src="/quantum-header.jpg"
                  alt="Quantum Energy Machine illustration"
                  fill
                  className="object-contain w-full h-full"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{objectPosition: 'center'}}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quantum Lights Section - 7 Color Therapy Cards */}
        <section id="quantum-lights" className="w-full flex flex-col items-center bg-white">
          <div className="w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row">
            {[
              { color: 'red', label: 'Red', bg: 'bg-red-500', icon: 'flame' as const, benefit: 'Anti-aging, collagen stimulation, wound healing, inflammation reduction' },
              { color: 'blue', label: 'Blue', bg: 'bg-blue-500', icon: 'droplet' as const, benefit: 'Acne-fighting, antibacterial, oil reduction' },
              { color: 'green', label: 'Green', bg: 'bg-green-500', icon: 'leaf' as const, benefit: 'Balances mood, reduces hyperpigmentation, calms skin' },
              { color: 'white', label: 'Ca⁺', bg: 'bg-white border border-gray-200', icon: 'sparkles' as const, benefit: 'Enhances mineral absorption, rejuvenation, metabolic support' },
              { color: 'yellow', label: 'Yellow', bg: 'bg-yellow-400', icon: 'sun' as const, benefit: 'Soothes redness, improves circulation, brightens tone' },
              { color: 'orange', label: 'Orange', bg: 'bg-orange-400', icon: 'circle' as const, benefit: 'Revitalizes complexion, enhances glow, supports metabolism' },
              { color: 'purple', label: 'Purple', bg: 'bg-purple-500', icon: 'star' as const, benefit: 'Cell renewal, acne scar repair, skin refresh' },
            ].map((item, idx) => (
              <FlipCard key={item.color} item={item} idx={idx} />
            ))}
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">Who Can Benefit from Quantum Energy Healing?</h2>
          <ul className="max-w-6xl mx-auto grid gap-6 text-lg md:text-xl mb-0 text-black/90 font-bold md:grid-cols-3">
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">People with Chronic Pain:</span> Arthritis, back pain, migraines, and joint issues can all be relieved naturally, without dependency on painkillers.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Post-Surgery & Recovery:</span> Accelerate healing after surgery, injury, or illness. Quantum energy supports cell regeneration and reduces downtime.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Immune System Boosters:</span> Strengthen your body’s natural defenses, making it easier to fight off infections and stay healthy year-round.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Busy Professionals:</span> Combat stress, fatigue, and burnout. Experience deep relaxation and mental clarity after every session.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Athletes & Fitness Enthusiasts:</span> Speed up muscle recovery, reduce inflammation, and enhance performance—naturally and safely.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Seniors & Elderly:</span> Improve mobility, balance, and overall vitality. Enjoy a more active, pain-free lifestyle at any age.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Women’s Wellness:</span> Support hormonal balance, ease menstrual discomfort, and promote radiant skin and energy.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Children & Teens:</span> Safe for all ages—helps with focus, growth, and immune support, especially during stressful school periods.
              </span>
            </li>
            <li className="flex items-start bg-white rounded-2xl shadow p-5 border border-gray-100">
              <FaCheckCircle className="text-amber-500 mr-3 mt-1 text-xl" />
              <span>
                <span className="font-extrabold text-amber-700">Wellness Seekers:</span> Anyone who wants to feel younger, sleep better, and enjoy a vibrant, energized life—naturally.
              </span>
            </li>
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
                  <div className="flex flex-col items-center">
                    <motion.span
                      key={timeLeft.days}
                      initial={{ scale: 1.2, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >{timeLeft.days}</motion.span>
                    <span className="text-xs font-semibold text-black/60">Days</span>
                  </div>
                  <span>:</span>
                  <div className="flex flex-col items-center">
                    <motion.span
                      key={timeLeft.hours}
                      initial={{ scale: 1.2, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >{String(timeLeft.hours).padStart(2, '0')}</motion.span>
                    <span className="text-xs font-semibold text-black/60">Hours</span>
                  </div>
                  <span>:</span>
                  <div className="flex flex-col items-center">
                    <motion.span
                      key={timeLeft.minutes}
                      initial={{ scale: 1.2, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >{String(timeLeft.minutes).padStart(2, '0')}</motion.span>
                    <span className="text-xs font-semibold text-black/60">Minutes</span>
                  </div>
                  <span>:</span>
                  <div className="flex flex-col items-center">
                    <motion.span
                      key={timeLeft.seconds}
                      initial={{ scale: 1.2, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >{String(timeLeft.seconds).padStart(2, '0')}</motion.span>
                    <span className="text-xs font-semibold text-black/60">Seconds</span>
                  </div>
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

        {/* Social Proof Section with Video Testimonials */}
        <section className="w-full px-4 py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-amber-700 font-playfair text-center drop-shadow tracking-tight">Real Results from Real People</h2>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 mb-12">
            {/* Testimonial 1: Video and Quote in one card */}
            <div className="flex flex-col bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Replace the videoId below with the real YouTube video ID for Mrs. Ada */}
              <div className="aspect-video w-full bg-black">
                  <YouTube
                    videoId="UOtjOs5oTvU"
                    className="w-full h-full"
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 0,
                        mute: 0,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                  />
              </div>
              <div className="p-6 flex flex-col items-start">
                <p className="text-lg md:text-xl font-medium mb-3 text-black/90">&quot;I couldn&apos;t walk without pain. After 30 minutes on the Quantum Machine, I felt light, strong, and free.&quot;</p>
                <footer className="text-base text-black/60 font-semibold">&mdash; Mrs. Ada, Lagos</footer>
              </div>
            </div>
            {/* Testimonial 2: Video and Quote in one card */}
            <div className="flex flex-col bg-white border border-amber-300 rounded-2xl shadow-xl overflow-hidden">
              {/* Replace the videoId below with the real YouTube video ID for Mr. John */}
              <div className="aspect-video w-full bg-black">
                  <YouTube
                    videoId="l7d690a-5GI"
                    className="w-full h-full"
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 0,
                        mute: 0,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                  />
              </div>
              <div className="p-6 flex flex-col items-start">
                <p className="text-lg md:text-xl font-medium mb-3 text-black/90">&quot;My blood pressure dropped naturally after using the machine consistently. No drugs. No side effects.&quot;</p>
                <footer className="text-base text-black/60 font-semibold">&mdash; Mr. John, Abuja</footer>
              </div>
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
            <p
              className="text-2xl md:text-3xl font-extrabold mb-0 px-4 py-3 rounded-xl bg-black text-white shadow-lg border-2 border-black text-center"
            >
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
