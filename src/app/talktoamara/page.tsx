"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function TalkToAmara() {
  const [muted, setMuted] = useState(true);
  const videoId = 'oczlcHWR0Io';
  const iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&playsinline=1`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#071027] via-[#061226] to-[#04121a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: hero text */}
          <section className="md:col-span-6">
            <motion.h1 initial={{ y: 6, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ duration: 0.5 }} className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
              Coach Amara is transforming lives in Nigeria and globally by teaching the principles of Quantum Energy, wellness, and prosperity.
            </motion.h1>

            <motion.p initial={{ y: 6, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.08, duration: 0.5 }} className="mt-6 text-base md:text-lg text-gray-200 max-w-2xl whitespace-pre-line">
              {`🌍 You don’t have to wait for a live event — you can now join her exclusive Zoom sessions held periodically from anywhere in the world.`}
            </motion.p>

            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.16, duration: 0.5 }} className="mt-8 flex items-center gap-4">
              <Link href="/join" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg shadow">Join the Community</Link>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity:1 }} transition={{ delay: 0.28 }} className="mt-3 text-sm text-gray-300">Get instant access. Start today!</motion.p>
          </section>

          {/* Right: video thumbnail */}
          <aside className="md:col-span-6">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale:1, opacity:1 }} transition={{ duration: 0.5 }} className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
              <button aria-pressed={!muted} aria-label={muted ? 'Unmute video' : 'Mute video'} onClick={() => setMuted(!muted)} className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur">
                {muted ? '🔈' : '🔊'}
              </button>
              {/* YouTube iframe autoplay muted loop (playsinline). We keep controls minimal. */}
              <div className="aspect-[16/9] bg-black">
                <iframe
                  key={iframeSrc}
                  className="w-full h-full"
                  src={iframeSrc}
                  title="Coach Amara Video"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="absolute bottom-4 right-4 left-auto text-white text-right">
                <div className="bg-gradient-to-l from-black/60 via-transparent to-black/60 p-4 rounded-lg">
                  <div className="text-base md:text-lg font-semibold">Exclusive Live Coaching Sessions</div>
                  <div className="mt-2 flex items-center justify-end gap-4 text-sm text-gray-200">
                    <div className="flex items-center gap-2"><span>⏱</span> <span>Less Than 10 Min</span></div>
                    <div className="flex items-center gap-2"><span>📅</span> <span>Multiple times per month</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        {/* Secondary section: stylized cards and info */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.05 }} className="md:col-span-4 bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {/* simple quantum atom svg */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <circle cx="12" cy="12" r="2.2" fill="#60A5FA" />
                  <path d="M2 12c6-8 12-8 20 0" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                  <path d="M2 12c6 8 12 8 20 0" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-semibold">Global Access</div>
                <p className="mt-2 text-sm text-gray-200">You don’t have to wait for a live event — join exclusive Zoom sessions held periodically from anywhere in the world.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.12 }} className="md:col-span-4 bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="#FDE68A" />
                  <path d="M7 12h10M7 16h6" stroke="#92400E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-semibold">Purposeful Sessions</div>
                <p className="mt-2 text-sm text-gray-200">Each session is designed to inspire, educate, and equip you with practical tools for healing, balance, and financial growth.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ delay: 0.18 }} className="md:col-span-4 bg-white/5 p-8 rounded-2xl backdrop-blur-sm border border-white/6 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8h12v8H6z" fill="#C7D2FE" />
                  <path d="M8 10h8v4H8z" fill="#3730A3" opacity="0.9" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-semibold">Reserve Your Spot</div>
                <p className="mt-2 text-sm text-gray-200">Reserve your spot today — subscribe for ongoing access or book individual sessions and be part of this global movement for change.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Video description / cards area with stylized layout */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <motion.h2 initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.06 }} className="text-2xl font-bold text-white">Coach Amara is transforming lives in Nigeria and globally</motion.h2>
            <motion.p initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }} className="text-gray-200">Coach Amara is transforming lives in Nigeria and globally by teaching the principles of Quantum Energy, wellness, and prosperity. Subscribe to ongoing sessions or book a one-off session to experience transformational tools and practical coaching.</motion.p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div initial={{ scale:0.98 }} animate={{ scale:1 }} transition={{ delay:0.16 }} className="p-4 bg-white/5 rounded-lg border border-white/6">
                <div className="text-lg font-semibold">Healing & Balance</div>
                <div className="mt-2 text-sm text-gray-200">Guided practices and practical tools to restore balance and strengthen wellbeing.</div>
              </motion.div>

              <motion.div initial={{ scale:0.98 }} animate={{ scale:1 }} transition={{ delay:0.18 }} className="p-4 bg-white/5 rounded-lg border border-white/6">
                <div className="text-lg font-semibold">Prosperity Principles</div>
                <div className="mt-2 text-sm text-gray-200">Actionable teachings that help align your energy and strategies for financial growth.</div>
              </motion.div>
            </div>
          </div>

          <aside className="space-y-4">
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="p-4 bg-white/5 rounded-lg border border-white/6">
              <div className="text-sm font-medium">Quick Info</div>
              <div className="mt-2 text-xs text-gray-200">Join live sessions, replay recordings, or book private coaching. Flexible pricing and global schedules.</div>
            </motion.div>

            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.26 }} className="p-4 bg-white/5 rounded-lg border border-white/6">
              <div className="text-sm font-medium">Why join?</div>
              <ul className="mt-2 text-xs text-gray-200 list-disc list-inside">
                <li>Short, focused sessions</li>
                <li>Proven coaching frameworks</li>
                <li>Global community & support</li>
              </ul>
            </motion.div>
          </aside>
        </section>
      </div>
    </main>
  );
}
