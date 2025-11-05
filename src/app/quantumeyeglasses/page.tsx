"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import CrispChat from '@/components/CrispChat';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

// Animation variants (same as quantum page)
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Video testimonial data
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
    videoId: '3YvHfSpJbH8',
  },
  {
    id: 'video2',
    videoId: 'zirTPqOzZdI',
  },
  {
    id: 'video3',
    videoId: 'F8Wt8prHEhM',
  },
  {
    id: 'video4',
    videoId: 'DmNlFNg1iWU',
  },
  {
    id: 'video5',
    videoId: 'Ecrv8bT8xbY',
  }
];

// CTA Button Component
const CTAButton = ({ className = '' }: { className?: string }) => (
  <Link
    href="/order-quantum-eyeglasses"
    className={`inline-flex items-center justify-center px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-lg transition-all ${className}`}
    aria-label="Order Your Quantum Eyeglasses Now"
    prefetch={false}
  >
    <FaCheckCircle className="mr-1.5 md:mr-2 text-white/90 shrink-0 text-base md:text-lg" /> 
    <span className="whitespace-nowrap">Order Your Quantum Eyeglasses Now</span>
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
    <div className="flex flex-col items-center w-full">
      <span className="uppercase text-[10px] md:text-xs font-bold text-amber-300 tracking-[0.2em] mb-2">
        Limited-Time Offer Ends In
      </span>
      <div className="w-full flex items-center justify-center gap-3 md:gap-5">
        <div className="flex flex-col items-center">
          <motion.span
            key={timeLeft.days}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white text-2xl md:text-4xl font-bold rounded px-3 py-2"
          >
            {String(timeLeft.days).padStart(2, '0')}
          </motion.span>
          <span className="text-xs font-semibold text-black/60">Days</span>
        </div>
        <div className="flex flex-col items-center">
          <motion.span
            key={timeLeft.hours}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white text-2xl md:text-4xl font-bold rounded px-3 py-2"
          >
            {String(timeLeft.hours).padStart(2, '0')}
          </motion.span>
          <span className="text-xs font-semibold text-black/60">Hours</span>
        </div>
        <div className="flex flex-col items-center">
          <motion.span
            key={timeLeft.minutes}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white text-2xl md:text-4xl font-bold rounded px-3 py-2"
          >
            {String(timeLeft.minutes).padStart(2, '0')}
          </motion.span>
          <span className="text-xs font-semibold text-black/60">Minutes</span>
        </div>
        <div className="flex flex-col items-center">
          <motion.span
            key={timeLeft.seconds}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black text-white text-2xl md:text-4xl font-bold rounded px-3 py-2"
          >
            {String(timeLeft.seconds).padStart(2, '0')}
          </motion.span>
          <span className="text-xs font-semibold text-black/60">Seconds</span>
        </div>
      </div>
    </div>
  );
}

export default function QuantumEyeglassesPage() {
  const [isMuted, setIsMuted] = React.useState(true);
  const videoRef = React.useRef<any>(null);
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
      <Head>
        <title>See Clearly Again — The Power of Quantum Energy Eyeglasses | Coach Amara</title>
        <meta name="description" content="Experience natural vision restoration with Quantum Energy Eyeglasses. Safe, effective relief from glaucoma, cataracts, and eye strain." />
        <meta property="og:title" content="See Clearly Again — The Power of Quantum Energy Eyeglasses" />
        <meta property="og:description" content="Experience natural vision restoration with Quantum Energy Eyeglasses. Safe, effective relief from glaucoma, cataracts, and eye strain." />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://thecoachamara.com/quantumeyeglasses" />
        <meta property="og:image" content="/quantum-eyeglasses-hero.jpg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thecoachamara.com/quantumeyeglasses" />
      </Head>

      <main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black relative">
        {/* Hero Section with Timer */}
        <section className="w-full relative min-h-[480px] md:min-h-[600px] flex flex-col justify-center items-center border-b border-gray-100 overflow-hidden bg-black">
          {/* Background Video */}
          <div className="absolute inset-0 w-full h-full z-0">
            <div className="relative w-full h-full">
              <YouTube
                videoId="1Nsxl3asl2Y"
                className="!w-full !h-full absolute inset-0"
                iframeClassName="w-full h-full object-cover"
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                    loop: 1,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    enablejsapi: 1,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    playsinline: 1,
                    mute: 1,
                    playlist: "1Nsxl3asl2Y"
                  },
                }}
                onReady={(event: { target: { playVideo: () => void; mute: () => void; unMute: () => void } }) => {
                  videoRef.current = event.target;
                  event.target.playVideo();
                  if (isMuted) {
                    event.target.mute();
                  } else {
                    event.target.unMute();
                  }
                }}
                onEnd={(event: { target: { playVideo: () => void } }) => {
                  event.target.playVideo();
                }}
                onStateChange={(event: { target: { playVideo: () => void } }) => {
                  event.target.playVideo();
                }}
              />
              
              {/* Audio Control Button */}
              <AudioControl 
                isMuted={isMuted} 
                onToggle={() => {
                  if (videoRef.current) {
                    if (isMuted) {
                      videoRef.current.unMute();
                    } else {
                      videoRef.current.mute();
                    }
                    setIsMuted(!isMuted);
                  }
                }} 
              />
            </div>
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/75 z-10" />
          
          {/* Content */}
          <div className="relative z-20 w-full py-16 md:py-24 px-4">
            <div className="mx-auto w-full max-w-5xl flex flex-col items-center">
              {/* Hero Text */}
              <div className="text-center mb-12">
                <h1 className="text-4xl xs:text-5xl md:text-6xl font-extrabold leading-tight font-playfair tracking-tight text-center mb-4 md:mb-6 drop-shadow-xl text-white">
                  See Clearly Again — The Power of Quantum Energy Eyeglasses
                </h1>
                <h2 className="text-2xl md:text-3xl font-medium text-amber-300 text-center mb-6">
                  A Natural Way to Restore, Protect, and Energize Your Eyes
                </h2>
              </div>

              {/* Product Video */}
              <div className="w-full max-w-3xl mb-8">
                <div className="relative w-full aspect-video overflow-hidden shadow-2xl border-2 border-yellow-300 rounded-xl">
                  <YouTube
                    videoId="1Nsxl3asl2Y"
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 1,
                        loop: 1,
                        controls: 0,
                        showinfo: 0,
                        rel: 0,
                        enablejsapi: 1,
                        modestbranding: 1,
                        iv_load_policy: 3,
                        playsinline: 1,
                        mute: 1,
                        playlist: "1Nsxl3asl2Y"
                      },
                    }}
                    onReady={(event: { target: { playVideo: () => void; mute: () => void; unMute: () => void } }) => {
                      videoRef.current = event.target;
                      event.target.playVideo();
                      if (isMuted) {
                        event.target.mute();
                      } else {
                        event.target.unMute();
                      }
                    }}
                    onEnd={(event: { target: { playVideo: () => void } }) => {
                      event.target.playVideo();
                    }}
                  />
                  {/* Audio Control Button */}
                  <AudioControl 
                    isMuted={isMuted} 
                    onToggle={() => {
                      if (videoRef.current) {
                        if (isMuted) {
                          videoRef.current.unMute();
                        } else {
                          videoRef.current.mute();
                        }
                        setIsMuted(!isMuted);
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="w-full max-w-2xl mb-8">
                <CountdownTimer />
              </div>

              {/* CTA */}
              <div className="w-full max-w-2xl mb-12 flex justify-center">
                <CTAButton className="w-full max-w-md" />
              </div>

              {/* Main Message Box */}
              <div className="w-full max-w-4xl">
                <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-yellow-400">
                  <p className="text-xl md:text-2xl text-black font-playfair font-bold text-center leading-relaxed mb-6">
                    Imagine waking up every day with sharper, clearer vision.
                    No more constant eye drops, hospital visits, or fear of blindness.
                  </p>
                  <div className="w-full h-px bg-amber-200 my-6"></div>
                  <p className="text-xl md:text-2xl text-black font-playfair font-bold text-center leading-relaxed mb-0">
                    Quantum Energy Eyeglasses are not just glasses — they are a healing tool designed to support your eyes' natural ability to repair themselves.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-10 font-playfair text-amber-700 drop-shadow tracking-tight">
              💎 What Makes These Glasses Different
            </h2>
            <p className="text-xl md:text-2xl text-center mb-10 text-black/90 font-medium leading-relaxed">
              Our Quantum Eyeglasses are infused with quantum photon, far-infrared, and scalar energy technology — the same frequencies your body uses to maintain balance and healing.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start bg-white rounded-2xl shadow p-6 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-4 mt-1 text-2xl flex-shrink-0" />
                <span className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                  Improve micro-circulation around the eyes
                </span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-6 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-4 mt-1 text-2xl flex-shrink-0" />
                <span className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                  Reduce eye pressure and strain caused by glaucoma and cataracts
                </span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-6 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-4 mt-1 text-2xl flex-shrink-0" />
                <span className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                  Activate the optic nerves and restore energy flow to the eyes
                </span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-6 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-4 mt-1 text-2xl flex-shrink-0" />
                <span className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                  Protect against harmful blue light and UV rays
                </span>
              </li>
              <li className="flex items-start bg-white rounded-2xl shadow p-6 border border-gray-100">
                <FaCheckCircle className="text-amber-500 mr-4 mt-1 text-2xl flex-shrink-0" />
                <span className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                  Boost concentration and relieve headaches or dizziness from eye fatigue
                </span>
              </li>
            </ul>
            <p className="text-xl md:text-2xl text-center mt-10 text-black/90 font-medium leading-relaxed">
              They are safe, natural, and suitable for all ages, including children and the elderly.
            </p>
          </div>
        </section>

        {/* Video Testimonials Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-amber-700 font-playfair text-center drop-shadow tracking-tight">
            Real People. Real Results.
          </h2>
          
          {/* Desktop: Grid, Mobile: Horizontal Scroll */}
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex overflow-x-auto md:grid md:grid-cols-5 gap-6 pb-6 md:pb-0">
              {videoTestimonials.map((video) => (
                <div key={video.id} className="flex-none w-[240px] md:w-[280px]">
                  <div className="flex flex-col bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="aspect-[9/16] w-full bg-black">
                      <YouTube
                        videoId={video.videoId}
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
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mobile Scroll Indicator */}
            <div className="flex justify-center mt-4 md:hidden">
              <div className="space-x-1">
                {videoTestimonials.map((_, index) => (
                  <span key={index} className="inline-block w-2 h-2 rounded-full bg-amber-200" />
                ))}
              </div>
            </div>
          </div>

          <p className="text-center mt-12 text-xl md:text-2xl font-semibold text-black/90 max-w-3xl mx-auto leading-relaxed">
            Quantum Energy works by equipping your body to heal itself — because the body is the best healer when properly energized.
          </p>
        </section>

        {/* Why It Works Section */}
        <section className="w-full bg-gradient-to-br from-amber-50 via-white to-amber-100 border-b border-amber-200 py-12 md:py-0">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
            <div className="flex-1 min-w-[320px] bg-amber-600 flex items-center justify-center py-12 md:py-24 order-2 md:order-1">
              <div className="max-w-2xl px-6 md:px-12 lg:px-16 text-base md:text-xl lg:text-2xl font-semibold text-white leading-relaxed">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 font-playfair">
                  Why the Quantum Energy Eyeglasses Works
                </h2>
                <p className="mb-3 md:mb-4">
                  Every cell in your body carries an electric charge. When your energy field weakens, your cells can't function optimally — leading to poor circulation, pressure, and degeneration in the eyes.
                </p>
                <p>
                  Quantum Energy Eyeglasses restore energy balance around your optic nerves and retina.
                  The result? Sharper vision, relief from eye pain, improved clarity, and gradual reversal of conditions like glaucoma and cataract.
                </p>
              </div>
            </div>
            
            {/* Right: Image */}
            <div className="flex-1 relative order-1 md:order-2 bg-white flex items-center justify-center">
              {/* Mobile wrapper */}
              <div className="block md:hidden relative w-full min-h-[600px] py-4">
                <Image
                  src="/quantum-eyeglasses/working.jpg"
                  alt="How Quantum Energy Eyeglasses Work"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
              {/* Desktop wrapper */}
              <div className="hidden md:block relative w-full h-full min-h-[420px] lg:min-h-[500px] py-12 lg:py-16">
                <Image
                  src="/quantum-eyeglasses/working.jpg"
                  alt="How Quantum Energy Eyeglasses Work"
                  fill
                  className="object-contain"
                  sizes="50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Investment Section with Timer */}
        <section className="w-full px-4 py-12 md:py-20 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-playfair text-amber-700 drop-shadow tracking-tight">
              💰 Your Best Health Investment
            </h2>
            <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8 mb-8">
              <div className="text-3xl md:text-4xl font-bold text-black mb-4">₦285,600</div>
              <div className="text-xl md:text-2xl font-semibold text-black/90 mb-4">Use Duration: Lifetime</div>
              <p className="text-lg md:text-xl font-semibold text-black/90 mb-6 leading-relaxed">
                No side effects. No maintenance costs. Only better vision, peace of mind, and long-term wellness.
              </p>
              <CountdownTimer />
            </div>
            <p className="text-xl md:text-2xl font-semibold text-black/90 mb-8 leading-relaxed">
              People spend millions on surgeries that fail to heal the root cause — but with Quantum Energy Eyeglasses, you're supporting your body to do what it was designed to do: heal itself naturally.
            </p>
            <CTAButton className="w-full max-w-md" />
          </div>
        </section>

        {/* Beyond Vision Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-gradient-to-br from-amber-50 via-white to-amber-100 border-b border-amber-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-8 font-playfair text-amber-700 drop-shadow-xl tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Beyond Vision: How Quantum Energy Restores Hearing
              </h2>
              <p className="text-xl md:text-2xl font-semibold text-black/90 mb-6 leading-relaxed max-w-4xl mx-auto">
                While Quantum Energy Eyeglasses are designed for the eyes, their power goes far beyond vision.
                We've received incredible feedback from users whose hearing was restored after consistent use — all because of what Quantum Energy does inside the body.
              </p>
              <CTAButton className="mt-8" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Benefit 1 */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
                <div className="relative w-full aspect-square mb-6 rounded-2xl overflow-hidden">
                  <Image
                    src="/quantum-eyeglasses/benefits/circulation.jpg"
                    alt="Improved Blood Circulation"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-amber-700 mb-4">Improves Blood Circulation to the Head and Ears</h3>
                <p className="text-lg font-medium text-black/80 leading-relaxed">
                  The glasses stimulate micro-circulation around the eyes, temples, and auditory nerves. This increased blood flow revitalizes ear cells, clearing blocked energy channels that affect hearing.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
                <div className="relative w-full aspect-square mb-6 rounded-2xl overflow-hidden">
                  <Image
                    src="/quantum-eyeglasses/benefits/cells.jpg"
                    alt="Cell Activation"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-amber-700 mb-4">Activates Dormant and Damaged Cells</h3>
                <p className="text-lg font-medium text-black/80 leading-relaxed">
                  Quantum frequencies reawaken weak or damaged auditory cells, helping them function again — naturally and without drugs or surgery.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
                <div className="relative w-full aspect-square mb-6 rounded-2xl overflow-hidden">
                  <Image
                    src="/quantum-eyeglasses/benefits/balance.jpg"
                    alt="Energy Balance"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-amber-700 mb-4">Balances Body Energy for Whole-Body Healing</h3>
                <p className="text-lg font-medium text-black/80 leading-relaxed">
                  The body is interconnected. As Quantum Energy harmonizes your electromagnetic field, it doesn't just help your eyes — it strengthens every nearby system, including hearing, balance, and focus.
                </p>
              </div>
            </div>

            {/* Additional Testimonial */}
            <div className="max-w-4xl mx-auto bg-[#FFD700] p-8 md:p-12 rounded-3xl shadow-lg mb-16 flex flex-col items-center">
              <blockquote className="text-2xl md:text-3xl font-bold text-black leading-relaxed mb-8 text-center">
                "After wearing the Quantum Energy Eyeglasses for vision, I realized I was also hearing better. My ears opened up — I could hear clearly again."
              </blockquote>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl -mx-4 md:-mx-8">
                <YouTube
                  videoId="Ecrv8bT8xbY"
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      loop: 1,
                      controls: 1,
                      showinfo: 0,
                      rel: 0,
                      enablejsapi: 1,
                      modestbranding: 1,
                      iv_load_policy: 3,
                      playsinline: 1,
                      mute: 1,
                      playlist: "Ecrv8bT8xbY"
                    },
                  }}
                  onReady={(event: { target: { playVideo: () => void; mute: () => void; unMute: () => void } }) => {
                    const testimonialVideoRef = event.target;
                    event.target.playVideo();
                    event.target.mute();
                  }}
                  onEnd={(event: { target: { playVideo: () => void } }) => {
                    event.target.playVideo();
                  }}
                />
                <button
                  onClick={(e) => {
                    const iframe = e.currentTarget.previousElementSibling?.querySelector('iframe');
                    if (iframe) {
                      const player = (iframe as any).contentWindow;
                      const isMuted = e.currentTarget.getAttribute('data-muted') === 'true';
                      if (isMuted) {
                        player.postMessage('{"event":"command","func":"unMute","args":""}', '*');
                        e.currentTarget.setAttribute('data-muted', 'false');
                        e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>';
                      } else {
                        player.postMessage('{"event":"command","func":"mute","args":""}', '*');
                        e.currentTarget.setAttribute('data-muted', 'true');
                        e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>';
                      }
                    }
                  }}
                  data-muted="true"
                  className="absolute bottom-4 right-4 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
                  aria-label="Toggle mute"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl font-semibold text-black/90 mb-8 leading-relaxed">
                This is more than sight restoration; it's complete sensory renewal.
                When you wear these glasses, you're not just protecting your eyes — you're energizing your entire head region, enhancing brain clarity, focus, and hearing.
              </p>

              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-amber-300 mb-12">
                <h3 className="text-3xl font-bold text-amber-700 mb-6">⚡ Why Wait for Surgery or Decline?</h3>
                <p className="text-xl md:text-2xl font-semibold text-black/90 mb-8 leading-relaxed">
                  Equip your body to heal itself — just as thousands already have.
                  Quantum Energy doesn't treat symptoms; it restores balance, and healing follows naturally.
                </p>
                <CTAButton className="w-full max-w-md" />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full px-4 py-12 md:py-20 bg-white flex flex-col items-center border-b border-gray-100">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-playfair text-amber-700 drop-shadow tracking-tight">
            ⚡ Don't Wait Until It's Too Late
          </h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-semibold text-black/90 mb-6 leading-relaxed">If your eyes could speak, they'd say "Thank you" for this.</p>
            <p className="text-xl md:text-2xl font-semibold text-black/90 leading-relaxed">
              Thousands of people have already experienced healing and clarity through Quantum Energy.
              Now it's your turn.
            </p>
          </div>
        </section>        {/* Final Note with Testimonials */}
        <section className="w-full px-4 py-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4 text-amber-700">💬 Final Note</h3>
              <p className="text-xl md:text-2xl font-semibold text-black/90 leading-relaxed">
                True healing begins with belief — and Quantum Energy is faith meeting science.
                Don't live another day in limitation.
                Give your eyes the energy they need to see the world again.
              </p>
            </div>

            {/* Testimonial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-12">
              {/* Testimonial 1 */}
              <div className="bg-[#FFD700] p-8 rounded-3xl shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mb-6">
                    <blockquote className="text-xl md:text-2xl font-bold text-black leading-relaxed">
                      "After 30 years of glaucoma, doctors declared me free. I can see clearly again!"
                    </blockquote>
                  </div>
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                      <span className="text-black font-bold text-xl">A</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-bold text-black">Azuka</p>
                      <p className="text-base font-medium text-black/80">Lagos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-[#FFD700] p-8 rounded-3xl shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mb-6">
                    <blockquote className="text-xl md:text-2xl font-bold text-black leading-relaxed">
                      "My right eye was closed for decades. After wearing these glasses for a few weeks, it opened!"
                    </blockquote>
                  </div>
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                      <span className="text-black font-bold text-xl">M</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-bold text-black">Moses</p>
                      <p className="text-base font-medium text-black/80">Benin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-[#FFD700] p-8 rounded-3xl shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mb-6">
                    <blockquote className="text-xl md:text-2xl font-bold text-black leading-relaxed">
                      "I had cataracts and could barely read my Bible. Now I see without surgery."
                    </blockquote>
                  </div>
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                      <span className="text-black font-bold text-xl">M</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-bold text-black">Mama Okojie</p>
                      <p className="text-base font-medium text-black/80">Lagos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="bg-[#FFD700] p-8 rounded-3xl shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mb-6">
                    <blockquote className="text-xl md:text-2xl font-bold text-black leading-relaxed">
                      "The improvement in my vision has been remarkable. I can read and drive with confidence again."
                    </blockquote>
                  </div>
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                      <span className="text-black font-bold text-xl">P</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-bold text-black">Pastor John</p>
                      <p className="text-base font-medium text-black/80">Abuja</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="w-full px-4 py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 font-playfair text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 leading-tight">
              Ready to Experience Quantum Healing?
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-800 font-semibold mb-6 leading-relaxed">
              This is your moment to take charge of your health and well-being. <span className="text-yellow-500 font-bold">Don't wait</span>—start your healing journey today and feel the difference for yourself.
            </p>
            
            <p className="text-lg md:text-xl text-gray-600 font-medium mb-10 leading-relaxed">
              Opportunities like this don't come often. Take action now and unlock a new level of energy, relief, and vitality.
            </p>

            <Link
              href="/order-quantum-eyeglasses"
              className="inline-flex items-center justify-center px-4 md:px-10 py-3 md:py-5 text-sm md:text-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-full shadow-2xl transition-all transform hover:scale-105"
              aria-label="Get Your Quantum Energy Eyeglasses Now"
              prefetch={false}
            >
              <FaCheckCircle className="mr-1.5 md:mr-3 text-white text-base md:text-2xl shrink-0" /> 
              <span className="whitespace-nowrap text-xs sm:text-sm md:text-xl">Get Your Quantum Energy Eyeglasses Now</span>
            </Link>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <footer className="w-full bg-black py-8 px-4 flex items-center justify-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-white text-center text-sm md:text-base leading-relaxed">
              This site is not a part of Facebook™ or Meta Platforms, Inc. Additionally, this site is NOT endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of Meta Platforms, Inc.
            </p>
          </div>
        </footer>
      </main>
      <CrispChat positionRight={true} themeColor="#25D366" />
    </>
  );
}