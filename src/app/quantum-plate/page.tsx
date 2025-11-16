"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import CrispChat from '@/components/CrispChat';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Audio control state and component
const AudioControl = ({ 
  isMuted, 
  onToggle 
}: { 
  isMuted: boolean; 
  onToggle: () => void 
}) => {
  return (
    <button
      onClick={onToggle}
      className="absolute bottom-4 right-4 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
      aria-label={isMuted ? "Unmute video" : "Mute video"}
    >
      {isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
};

const videoTestimonials = [
  {
    id: 'video1',
    videoId: 'B9MXy2RUOJg',
  },
  {
    id: 'video2',
    videoId: 'OisSxMIFZJA',
  },
  {
    id: 'video3',
    videoId: 'OXL1K-VWvno',
  },
  {
    id: 'video4',
    videoId: 'NhexNAzZHzo',
  },
  {
    id: 'video5',
    videoId: 'lwiaBSQHZFM',
  }
];

// CTA Button Component
const CTAButton = ({ className = '' }: { className?: string }) => (
  <Link
    href="/order-quantum-plate"
    className={`inline-flex items-center justify-center px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-lg transition-all ${className}`}
    aria-label="Order Your Quantum Tableware Now"
    prefetch={false}
  >
    <FaCheckCircle className="mr-1.5 md:mr-2 text-white/90 shrink-0 text-base md:text-lg" /> 
    <span className="whitespace-nowrap">Order Your Quantum Tableware Now</span>
  </Link>
);

// Countdown Timer Component
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getNextDeadline() {
      const now = new Date();
      const deadline = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
      deadline.setHours(23, 59, 59, 999);
      return deadline;
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const deadline = getNextDeadline().getTime();
      const total = deadline - now;

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-amber-400 font-bold text-sm md:text-base">
      <span className="bg-black/40 px-2 md:px-4 py-1 md:py-2 rounded-lg backdrop-blur-sm">
        {String(timeLeft.days).padStart(2, '0')}
        <span className="text-[10px] md:text-xs ml-1">Days</span>
      </span>
      <span className="bg-black/40 px-2 md:px-4 py-1 md:py-2 rounded-lg backdrop-blur-sm">
        {String(timeLeft.hours).padStart(2, '0')}
        <span className="text-[10px] md:text-xs ml-1">Hours</span>
      </span>
      <span className="bg-black/40 px-2 md:px-4 py-1 md:py-2 rounded-lg backdrop-blur-sm">
        {String(timeLeft.minutes).padStart(2, '0')}
        <span className="text-[10px] md:text-xs ml-1">Minutes</span>
      </span>
      <span className="bg-black/40 px-2 md:px-4 py-1 md:py-2 rounded-lg backdrop-blur-sm">
        {String(timeLeft.seconds).padStart(2, '0')}
        <span className="text-[10px] md:text-xs ml-1">Seconds</span>
      </span>
    </div>
  );
}

export default function QuantumPlatePage() {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <>
      <Head>
        <title>Quantum Energy Tableware - Eat Well, Heal Naturally</title>
        <meta name="description" content="Transform your kitchen into a healing space with Quantum Energy Tableware" />
      </Head>

      <style jsx global>{`
        header, nav, .header, .navbar {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-gray-900">
          {/* Hero Content */}
          <motion.div 
            className="relative z-10 text-center px-4 max-w-5xl mx-auto py-16"
            initial="hidden"
            animate="show"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-transparent bg-clip-text drop-shadow-2xl">
                Eat Well. Heal Naturally. Live Fully.
              </span>
            </h1>

            <h2 className="text-2xl md:text-4xl text-white mb-6 font-semibold drop-shadow-lg">
              Transform Your Kitchen Into a Healing Space
            </h2>

            <p className="text-base md:text-xl text-gray-200 mb-4 max-w-3xl mx-auto leading-relaxed">
              Good health does not start in the hospital. It starts with what you place on your table.
            </p>

            <p className="text-base md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Quantum Energy Tableware is not ordinary dining ware. Each plate, cup, and bowl is infused with Quantum Scalar Energy, a natural life-supporting frequency that helps the body return to its healthy, self-healing state.
            </p>

            {/* Video Player */}
            <div className="relative w-full max-w-3xl mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-500">
              <div className="aspect-video">
                <YouTube
                  videoId="9AY-7nUY32w"
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      controls: 1,
                      mute: isMuted ? 1 : 0,
                      loop: 1,
                      playlist: '9AY-7nUY32w',
                      modestbranding: 1,
                      rel: 0,
                    },
                  }}
                  className="w-full h-full"
                />
              </div>
              <AudioControl isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
            </div>

            <div className="mb-6">
              <p className="text-amber-400 font-semibold mb-3 text-sm md:text-base">LIMITED-TIME OFFER ENDS IN</p>
              <CountdownTimer />
            </div>

            <CTAButton className="text-base md:text-xl shadow-2xl hover:scale-105" />
          </motion.div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                🍽️ Why Your Food Might Be Hurting You
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-red-400 mb-6">Today's Food Is:</h3>
                <ul className="space-y-4 text-gray-200 text-lg">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3 text-2xl">❌</span>
                    <span>Processed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3 text-2xl">❌</span>
                    <span>Chemically preserved</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3 text-2xl">❌</span>
                    <span>Irritating to the gut</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-3 text-2xl">❌</span>
                    <span>Difficult for the body to break down</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-red-400 mb-6">This Causes:</h3>
                <ul className="space-y-4 text-gray-200 text-lg">
                  <li className="flex items-start">
                    <span className="mr-3">•</span>
                    <span>Bloating</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">•</span>
                    <span>Indigestion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">•</span>
                    <span>Ulcers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">•</span>
                    <span>Constipation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">•</span>
                    <span>Low energy</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">•</span>
                    <span>Weak immunity</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white border-2 border-amber-500 rounded-2xl p-8 text-center shadow-lg">
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed">
                But when you eat from <span className="text-amber-600 font-bold">Quantum Tableware</span>, 
                the food becomes gentler, lighter, and more harmonized with your cells — allowing your body to 
                <span className="text-amber-700 font-bold"> digest better, detox better, and heal better</span>.
              </p>
            </div>
          </motion.div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-16 px-4 bg-gray-900">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                💎 What Makes Quantum Tableware Different
              </span>
            </h2>

            <p className="text-xl text-gray-300 text-center mb-12 max-w-4xl mx-auto leading-relaxed">
              When you place food or water in Quantum Tableware, the energy restructures and "activates" 
              the molecules — making meals easier for the body to absorb, soothing to the digestive system, 
              and supportive to your immune function.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white border-2 border-amber-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
                <div className="text-6xl mb-5">🌟</div>
                <h3 className="text-2xl font-bold text-amber-600 mb-4">Easier Digestion</h3>
                <p className="text-base text-gray-700">Better nutrient absorption and digestive comfort</p>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
                <div className="text-6xl mb-5">💨</div>
                <h3 className="text-2xl font-bold text-amber-600 mb-4">Less Bloating</h3>
                <p className="text-base text-gray-700">Reduced gas and discomfort after meals</p>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
                <div className="text-6xl mb-5">😌</div>
                <h3 className="text-2xl font-bold text-amber-600 mb-4">Calmer Stomach</h3>
                <p className="text-base text-gray-700">Soothing relief and digestive peace</p>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
                <div className="text-6xl mb-5">✨</div>
                <h3 className="text-2xl font-bold text-amber-600 mb-4">Better Detox</h3>
                <p className="text-base text-gray-700">Improved bowel movement and natural cleansing</p>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
                <div className="text-6xl mb-5">⚡</div>
                <h3 className="text-2xl font-bold text-amber-600 mb-4">More Energy</h3>
                <p className="text-base text-gray-700">Increased vitality after eating</p>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow">
                <div className="text-6xl mb-5">🛡️</div>
                <h3 className="text-2xl font-bold text-amber-600 mb-4">Stronger Immunity</h3>
                <p className="text-base text-gray-700">Enhanced immune system response</p>
              </div>
            </div>

            <p className="text-xl text-center text-gray-300 mb-8 leading-relaxed">
              Safe, natural, and suitable for the entire family — from children to elderly parents.
            </p>

            <div className="text-center">
              <CTAButton />
            </div>
          </motion.div>
        </section>

        {/* VIDEO TESTIMONIALS SECTION */}
        <section className="py-16 px-4 bg-black">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                Real People. Real Results.
              </span>
            </h2>

            <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
              Quantum Energy works by equipping your body to heal itself — because the body is 
              the best healer when properly energized.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videoTestimonials.map((video) => (
                <div key={video.id} className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                  <div className="aspect-video">
                    <YouTube
                      videoId={video.videoId}
                      opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                          modestbranding: 1,
                        },
                      }}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-black">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                Why Quantum Energy Tableware Works
              </span>
            </h2>

            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl text-gray-200 mb-6 leading-relaxed">
                Your body is designed to heal itself — but it needs support, not stress.
              </p>

              <p className="text-xl text-gray-200 mb-6 leading-relaxed">
                Quantum Tableware does not add anything artificial. It simply restores the natural 
                energetic balance of whatever you eat or drink.
              </p>

              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                This makes the food more compatible with your cells, helping your body absorb nutrients 
                more efficiently and eliminate waste more effectively.
              </p>
            </div>

            {/* Full-width image section */}
            <div className="w-full -mx-4 mb-12">
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src="/quantum-plate/quantum_plate_hiw.jpg"
                  alt="How Quantum Energy Tableware Works"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white border-2 border-amber-500 rounded-2xl p-10 shadow-xl">
                <h3 className="text-3xl font-bold text-amber-600 mb-8 text-center">Results Over Time:</h3>
                <ul className="space-y-5 text-gray-800 text-xl">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-amber-600 mr-4 mt-1 flex-shrink-0 text-2xl" />
                    <span>Reduced inflammation</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-amber-600 mr-4 mt-1 flex-shrink-0 text-2xl" />
                    <span>Improved metabolic balance</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-amber-600 mr-4 mt-1 flex-shrink-0 text-2xl" />
                    <span>Better overall health and vitality</span>
                  </li>
                </ul>
              </div>

              <p className="text-2xl text-center text-amber-400 font-bold mt-10">
                Because when digestion improves, the entire body improves.
              </p>
            </div>

            <div className="text-center">
              <CTAButton />
            </div>
          </motion.div>
        </section>

        {/* PRICING SECTION */}
        <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                💰 Your Best Health Investment
              </span>
            </h2>

            <div className="bg-white border-4 border-amber-500 rounded-3xl p-12 mb-8 shadow-2xl">
              <p className="text-5xl md:text-6xl font-bold text-amber-600 mb-4">₦324,360</p>
              <p className="text-2xl text-gray-900 font-semibold mb-6">Use Duration: Lifetime</p>
              <p className="text-lg text-gray-700 mb-8">
                No harmful chemicals. No side effects. Only better digestion, peace of mind, and long-term wellness.
              </p>

              <div className="mb-8">
                <p className="text-amber-600 font-semibold mb-3">LIMITED-TIME OFFER ENDS IN</p>
                <CountdownTimer />
              </div>

              <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto leading-relaxed">
                People spend thousands on medications that only mask symptoms — but with Quantum Energy Tableware, 
                you're supporting your body to do what it was designed to do: heal itself naturally with every meal.
              </p>

              <CTAButton className="text-xl" />
            </div>
          </motion.div>
        </section>

        {/* WHO NEEDS THIS SECTION */}
        <section className="py-16 px-4 bg-gray-900">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                🎯 Who Benefits From Quantum Tableware?
              </span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white border-2 border-amber-500 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-start">
                  <FaCheckCircle className="text-amber-600 text-3xl mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-600 mb-3">Anyone seeking good health</h3>
                    <p className="text-base text-gray-700">Consistent wellness and vitality</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-start">
                  <FaCheckCircle className="text-amber-600 text-3xl mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-600 mb-3">Digestive challenges</h3>
                    <p className="text-base text-gray-700">Relief from ulcers, IBS, constipation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-start">
                  <FaCheckCircle className="text-amber-600 text-3xl mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-600 mb-3">Busy professionals</h3>
                    <p className="text-base text-gray-700">Maintain strength and energy</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-start">
                  <FaCheckCircle className="text-amber-600 text-3xl mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-600 mb-3">Families</h3>
                    <p className="text-base text-gray-700">Prevent illness naturally</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-start">
                  <FaCheckCircle className="text-amber-600 text-3xl mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-600 mb-3">Elderly parents</h3>
                    <p className="text-base text-gray-700">Essential body support</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-start">
                  <FaCheckCircle className="text-amber-600 text-3xl mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-600 mb-3">Children</h3>
                    <p className="text-base text-gray-700">Build strong immunity early</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-amber-500 rounded-2xl p-10 text-center shadow-xl">
              <p className="text-2xl md:text-3xl text-gray-800 italic font-medium">
                Your kitchen and dining table should be a place of healing, not stress.
              </p>
            </div>
          </motion.div>
        </section>

        {/* BEYOND DIGESTION SECTION */}
        <section className="py-16 px-4 bg-black">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                Beyond Digestion: Whole-Body Healing
              </span>
            </h2>

            <p className="text-xl text-gray-300 text-center mb-12 max-w-4xl mx-auto leading-relaxed">
              While Quantum Energy Tableware is designed for digestive support, its power goes far beyond 
              the stomach. We've received incredible feedback from users who experienced improved immunity, 
              better sleep, and increased vitality — all because of what Quantum Energy does inside the body.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/50 rounded-2xl p-8">
                <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="/quantum-plate/nutrient.jpg"
                    alt="Improved Nutrient Absorption"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">Improves Nutrient Absorption</h3>
                <p className="text-gray-300 leading-relaxed">
                  Better circulation of energy means your cells receive more nutrients from every meal.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/50 rounded-2xl p-8">
                <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="/quantum-plate/detox.jpg"
                    alt="Activates Natural Detox"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">Activates Natural Detox Systems</h3>
                <p className="text-gray-300 leading-relaxed">
                  Quantum frequencies help your body eliminate toxins more efficiently — naturally and without harsh cleanses.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/50 rounded-2xl p-8">
                <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src="/quantum-plate/balance1.jpg"
                    alt="Balances Body Energy"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">Balances Body Energy for Whole-Body Healing</h3>
                <p className="text-gray-300 leading-relaxed">
                  The body is interconnected. As Quantum Energy harmonizes your system, it doesn't just help 
                  digestion — it strengthens immunity, mental clarity, and overall vitality.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border-2 border-amber-500 rounded-2xl p-8 mb-8">
              <blockquote className="text-xl md:text-2xl text-gray-200 italic text-center leading-relaxed">
                "After using Quantum Tableware for a month, not only did my bloating disappear — 
                I felt more energetic and my chronic fatigue improved!"
              </blockquote>
            </div>

            <div className="text-center">
              <CTAButton />
            </div>
          </motion.div>
        </section>

        {/* FINAL TESTIMONIALS SECTION */}
        <section className="py-16 px-4 bg-gradient-to-b from-gray-900 to-black">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                ⚡ Don't Wait Until It's Too Late
              </span>
            </h2>

            <p className="text-xl text-gray-300 text-center mb-4 max-w-3xl mx-auto">
              If your body could speak, it would say "Thank you" for this.
            </p>

            <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
              Thousands of families have already experienced healing and vitality through Quantum Energy. 
              Now it's your turn.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white border-2 border-amber-500 rounded-xl p-10 shadow-xl hover:shadow-2xl transition-shadow">
                <p className="text-xl text-gray-800 mb-6 italic leading-relaxed">
                  "My ulcer pain disappeared after 2 weeks of using these plates!"
                </p>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                    M
                  </div>
                  <div>
                    <p className="text-amber-600 font-bold text-lg">Mama Chika</p>
                    <p className="text-gray-600 text-base">Lagos</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-10 shadow-xl hover:shadow-2xl transition-shadow">
                <p className="text-xl text-gray-800 mb-6 italic leading-relaxed">
                  "No more bloating after meals. My digestion has never been better!"
                </p>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                    D
                  </div>
                  <div>
                    <p className="text-amber-600 font-bold text-lg">Dr. Eze</p>
                    <p className="text-gray-600 text-base">Abuja</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-10 shadow-xl hover:shadow-2xl transition-shadow">
                <p className="text-xl text-gray-800 mb-6 italic leading-relaxed">
                  "I bought it for my elderly mother. She's stronger and eats better now."
                </p>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                    B
                  </div>
                  <div>
                    <p className="text-amber-600 font-bold text-lg">Blessing</p>
                    <p className="text-gray-600 text-base">Port Harcourt</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-amber-500 rounded-xl p-10 shadow-xl hover:shadow-2xl transition-shadow">
                <p className="text-xl text-gray-800 mb-6 italic leading-relaxed">
                  "My children are healthier and rarely get sick anymore."
                </p>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4">
                    P
                  </div>
                  <div>
                    <p className="text-amber-600 font-bold text-lg">Pastor Samuel</p>
                    <p className="text-gray-600 text-base">Enugu</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-amber-500 rounded-2xl p-12 mb-8 text-center shadow-xl">
              <h3 className="text-3xl md:text-4xl font-bold text-amber-600 mb-6">💬 Final Note</h3>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed max-w-3xl mx-auto">
                True healing begins with belief — and Quantum Energy is faith meeting science. 
                Don't live another day in limitation. Give your body the energy it needs to thrive with every meal.
              </p>
            </div>
          </motion.div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-16 px-4 bg-gradient-to-b from-black to-gray-900">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-transparent bg-clip-text">
                Ready to Experience Quantum Healing?
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              This is your moment to take charge of your health and well-being. Don't wait — start your 
              healing journey today and feel the difference with every meal.
            </p>

            <p className="text-2xl text-amber-400 font-bold mb-8">
              This is not just tableware. This is a health investment you use every single day.
            </p>

            <CTAButton className="text-xl mb-8" />

            <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/50 rounded-2xl p-8 mt-12">
              <p className="text-xl text-gray-200 mb-4">Call / WhatsApp:</p>
              <a 
                href="tel:+2348033320512" 
                className="text-3xl font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                +2348033320512
              </a>
            </div>
          </motion.div>
        </section>

        {/* Facebook Disclaimer */}
        <div className="py-8 px-4 bg-black">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500 text-sm">
              This site is not a part of Facebook™ or Meta Platforms, Inc. Additionally, this site is NOT 
              endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of Meta Platforms, Inc.
            </p>
          </div>
        </div>

        <CrispChat />
      </div>
    </>
  );
}
