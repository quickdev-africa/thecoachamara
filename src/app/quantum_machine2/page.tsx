"use client";
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Play, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const CTA = ({ primary = true, children, href, className = '' }) => (
  <a
    href={href}
    className={primary
      ? `inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-18px_rgba(5,150,105,0.65)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-18px_rgba(5,150,105,0.75)] md:px-8 md:py-4 md:text-lg ${className}`
      : `inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white/90 px-6 py-4 text-base font-semibold text-zinc-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40 md:px-8 md:py-4 md:text-lg ${className}`}
  >
    {children}
  </a>
);

const Section = ({ title, children, soft = false }) => (
  <section className={`relative ${soft ? 'bg-gradient-to-b from-zinc-50 to-white' : 'bg-white'}`}>
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 md:px-8 md:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-4xl text-center"
      >
        <h2 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl md:text-6xl">
          {title}
        </h2>
        <div className="mt-8 space-y-5 text-lg leading-8 text-zinc-600 sm:text-xl sm:leading-9 md:mt-10 md:text-[1.4rem] md:leading-10">
          {children}
        </div>
      </motion.div>
    </div>
  </section>
);

const ListCard = ({ items }) => (
  <div className="mt-8 grid gap-4 text-left sm:mt-10 sm:grid-cols-2">
    {items.map((item) => (
      <div
        key={item}
        className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-5 py-4 shadow-[0_18px_35px_-25px_rgba(0,0,0,0.25)]"
      >
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <p className="text-base font-medium leading-7 text-zinc-700 sm:text-lg sm:leading-8">{item}</p>
      </div>
    ))}
  </div>
);


const YouTubeEmbed = ({ videoId, title }) => {
  const iframeRef = useRef(null);
  const [muted, setMuted] = useState(true);

  // PostMessage API for mute/unmute
  const toggleMute = () => {
    if (!iframeRef.current) return;
    const command = muted ? 'unMute' : 'mute';
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
    setMuted((m) => !m);
  };

  // Always mute on mount
  React.useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func: 'mute', args: [] }),
      '*'
    );
    setMuted(true);
  }, [videoId]);

  return (
    <div className="relative w-full aspect-video rounded-[1.75rem] overflow-hidden border border-amber-200/80 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.28)]">
      <iframe
        ref={iframeRef}
        title={title}
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&showinfo=0`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-full h-full"
        style={{ border: 0 }}
      />
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
        aria-label={muted ? 'Unmute video' : 'Mute video'}
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-emerald-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v6h4l5 5V4l-5 5H9z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default function QuantumEnergyLandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_20%),linear-gradient(to_bottom,_#ffffff,_#fcfcfc)] text-zinc-900">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-800 sm:text-base">
              Quantum Energy
            </p>
          </div>
          <a
            href="#consultation"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:px-5 sm:text-base"
          >
            Schedule
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-6 sm:pt-36 md:px-8 md:pb-24 md:pt-40">
        <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl md:h-96 md:w-96" />
        <div className="absolute right-0 top-16 -z-10 h-48 w-48 rounded-full bg-amber-100/60 blur-3xl md:h-72 md:w-72" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              Non-invasive wellness technology
            </div>

            <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              Your Body Was Designed to Heal.
              <span className="mt-2 block bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
                It Just Needs the Right Support.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-xl leading-8 text-zinc-700 sm:text-2xl sm:leading-9 lg:mx-0 lg:max-w-2xl md:text-[1.8rem] md:leading-[1.5]">
              A non-invasive wellness technology designed to support your body’s natural energy system and long-term vitality.
            </p>

            <div className="mx-auto mt-10 max-w-2xl space-y-4 text-lg leading-8 text-zinc-600 sm:text-xl sm:leading-9 lg:mx-0 md:text-[1.32rem] md:leading-9">
              <p>My name is Coach Amara.</p>
              <p>And over the years, I have worked with individuals who appear strong on the outside — but internally, their bodies are depleted.</p>
              <p>Not broken.</p>
              <p>Not sick.</p>
              <p className="text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl">Just quietly exhausted.</p>
            </div>

            <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center lg:justify-start">
              <CTA href="https://docs.google.com/forms/d/e/1FAIpQLSdJjPk3kbikdhJ0AQ7svZhUXQOLbB339gbj9HPw9qS-1gjjbA/viewform" className="w-full sm:w-auto">
                Book a Private Consultation
                <ArrowRight className="h-5 w-5" />
              </CTA>
              <CTA primary={false} href="https://wa.me/2348033320512?text=QUANTUM" className="w-full sm:w-auto">
                <MessageCircle className="h-5 w-5" />
                Send “QUANTUM” on WhatsApp
              </CTA>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_35px_90px_-35px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6 md:rounded-[2.25rem] md:p-7">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 md:p-7">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm sm:text-sm">
                  Natural support
                </div>
                <h3 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-4xl">
                  Designed to complement your natural healing ability.
                </h3>
                <p className="mt-5 text-lg leading-8 text-zinc-600 sm:text-xl sm:leading-9">
                  Non-invasive. Drug-free. Created for those who want to support strength, clarity, recovery and vitality with intention.
                </p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  'Energy balance',
                  'Mental clarity',
                  'Physical recovery',
                ].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">Support</p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-zinc-950">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Section title="When Energy Drops, Everything Else Begins to Struggle." soft>
        <p>When your internal energy weakens, you may notice:</p>
        <ListCard
          items={[
            'Reduced focus',
            'Emotional imbalance',
            'Slow recovery',
            'Fatigue that rest doesn’t fix',
            'Decreased resilience',
          ]}
        />
        <p>Most people wait until symptoms become loud.</p>
        <p className="text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl">I teach intelligent prevention.</p>
      </Section>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 md:px-8 md:py-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-5xl"
        >
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 sm:mb-5 sm:text-base">
            Real Clients. Real Experiences.
          </p>
          <YouTubeEmbed videoId="14lK-PWheWs" title="Real Clients. Real Experiences." />
          <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-7 text-zinc-500 sm:mt-5 sm:text-lg">
            Listen to how the Quantum Energy Machine has supported their wellness journey.
          </p>
        </motion.div>
      </div>

      <div className="px-5 pb-12 text-center sm:px-6 md:px-8 md:pb-16">
        <CTA href="https://docs.google.com/forms/d/e/1FAIpQLSdJjPk3kbikdhJ0AQ7svZhUXQOLbB339gbj9HPw9qS-1gjjbA/viewform">
          See If This Is Right For You
          <ArrowRight className="h-5 w-5" />
        </CTA>
      </div>

      <Section title="Your Body Is Electrical. Every Cell Communicates Through Energy.">
        <p>Every organ functions through frequency.</p>
        <p>Every system depends on balance.</p>
        <p>When that balance is disrupted due to stress, aging, environmental exposure or lifestyle, the body gradually weakens.</p>
        <p>The Quantum Energy Machine is designed to support:</p>
        <ListCard
          items={[
            'Energy balance',
            'Physical recovery',
            'Mental clarity',
            'Overall wellness support',
            'Long-term vitality',
          ]}
        />
        <p>It works with your body — not against it.</p>
        <div className="space-y-2 pt-2 text-xl font-semibold leading-8 text-zinc-950 sm:text-2xl sm:leading-9 md:text-[1.65rem]">
          <p>Non-invasive.</p>
          <p>Drug-free.</p>
          <p>Designed to complement your natural healing ability.</p>
        </div>
      </Section>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 md:px-8 md:py-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-5xl"
        >
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 sm:mb-5 sm:text-base">
            Why Our Clients Chose Prevention Over Reaction
          </p>
          <YouTubeEmbed videoId="uKBFi8u1UEM" title="Why Our Clients Chose Prevention Over Reaction" />
        </motion.div>
      </div>

      <Section title="This Is Not an Expense. It Is Infrastructure." soft>
        <p className="text-4xl font-bold leading-tight text-emerald-700 sm:text-5xl md:text-6xl">
          The Quantum Energy Machine is ₦3,000,000.
        </p>
        <p>And I say that openly.</p>
        <p>Because this is not for everyone.</p>
        <p>It is for individuals who understand that:</p>
        <p className="text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl md:text-4xl">Health is the primary asset.</p>
        <p>You insure your properties.</p>
        <p>You protect your investments.</p>
        <p>You build financial security.</p>
        <p>But your body sustains everything.</p>
        <p>If you value longevity, clarity and strength, this becomes a strategic decision.</p>
      </Section>

      <div className="px-5 pb-16 text-center sm:px-6 md:px-8 md:pb-20">
        <CTA href="https://docs.google.com/forms/d/e/1FAIpQLSdJjPk3kbikdhJ0AQ7svZhUXQOLbB339gbj9HPw9qS-1gjjbA/viewform">
          Apply for a Private Consultation
          <ArrowRight className="h-5 w-5" />
        </CTA>
        <p className="mt-4 text-base text-zinc-500 sm:text-lg">Limited consultations available weekly.</p>
      </div>

      <Section title="Who This Is For">
        <p>This is for:</p>
        <ListCard
          items={[
            'Professionals under constant pressure',
            'Individuals 35+ who want to stay ahead of health decline',
            'Leaders carrying responsibility',
            'Families that believe in prevention',
            'Individuals serious about longevity',
          ]}
        />
        <p>This is not for those looking for quick fixes.</p>
        <p className="text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl">It is for those ready to build internal strength.</p>
      </Section>

      <Section title="How It Works" soft>
        <p>Before purchase, we schedule a private consultation.</p>
        <p>During this session, we:</p>
        <ListCard
          items={[
            'Assess your needs',
            'Answer your questions',
            'Ensure suitability',
            'Guide you on proper usage',
          ]}
        />
        <p className="text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl">I believe in integrity over impulse decisions.</p>
      </Section>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 md:px-8 md:py-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-5xl"
        >
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 sm:mb-5 sm:text-base">
            What Changed After They Invested in Their Health
          </p>
          <YouTubeEmbed videoId="sCT4gErdqhA" title="What Changed After They Invested in Their Health" />
        </motion.div>
      </div>

      <Section title="Energy Is Not a Luxury. It Is Life.">
        <p>You cannot lead powerfully from depletion.</p>
        <p>You cannot build legacy from burnout.</p>
        <p>You cannot sustain success without strength.</p>
        <p className="text-2xl font-semibold leading-tight text-zinc-950 sm:text-3xl md:text-4xl">When you strengthen your energy, everything responds.</p>
      </Section>

      <section
        id="consultation"
        className="bg-[linear-gradient(135deg,rgba(5,150,105,0.98),rgba(6,95,70,0.98),rgba(9,9,11,0.98))] px-5 py-20 text-white sm:px-6 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Book Your Private Consultation Today
          </h2>
          <div className="mt-10 flex justify-center">
            <CTA href="https://docs.google.com/forms/d/e/1FAIpQLSdJjPk3kbikdhJ0AQ7svZhUXQOLbB339gbj9HPw9qS-1gjjbA/viewform" primary className="bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 hover:shadow-[0_24px_50px_-18px_rgba(245,158,11,0.85)]">
              Schedule Consultation
              <ArrowRight className="h-5 w-5" />
            </CTA>
          </div>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-emerald-50 sm:text-xl sm:leading-9">
            Or send “QUANTUM” on WhatsApp to begin.
          </p>
        </div>
      </section>

      <a
        href="https://wa.me/2348033320512?text=QUANTUM"
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-18px_rgba(37,211,102,0.95)] transition hover:scale-105 sm:bottom-6 sm:right-6"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}
