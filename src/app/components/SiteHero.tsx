"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../fadeMotion";

function Typewriter({ text, speed = 40 }: { text: string; speed?: number }) {
  const [display, setDisplay] = useState("");
  const i = useRef(0);

  useEffect(() => {
    setDisplay("");
    i.current = 0;
    let cancelled = false;
    function tick() {
      if (cancelled) return;
      if (i.current <= text.length) {
        setDisplay(text.slice(0, i.current));
        i.current += 1;
        setTimeout(tick, speed);
      }
    }
    tick();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return <span>{display}</span>;
}

const HERO_ITEMS = [
  {
    heading:
      "Discover the Quantum Energy Breakthrough That’s Transforming Lives",
    subtext:
      "✨ Step into a world of energy alignment and experience the shift toward healing, balance, and inner renewal.",
  },
  {
    heading:
      "Unlock the Power of Quantum Energy – A New Path to Healing and Transformation",
    subtext:
      "🌿 Restore vitality, elevate your spirit, and embrace a holistic approach to living your best life.",
  },
  {
    heading: "Get Quantum Coaching to Transform Your Health and Prosperity",
    subtext:
      "💡 Learn how quantum principles can guide you to vibrant wellness and create lasting financial freedom.",
  },
];

export default function SiteHero(props?: { heading?: React.ReactNode; subtext?: React.ReactNode; disableTypewriter?: boolean; compact?: boolean; hideCTA?: boolean }) {
  const { heading, subtext, disableTypewriter, compact, hideCTA } = props || {};
  const isCustom = Boolean(heading || subtext);

  const [index, setIndex] = useState(0);
  const current = useMemo(() => HERO_ITEMS[index], [index]);

  useEffect(() => {
    if (isCustom) return; // don't rotate when custom content supplied
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_ITEMS.length);
    }, 6000);
    return () => clearInterval(id);
  }, [isCustom]);

  const sectionPadding = compact ? 'py-6 md:py-12' : 'py-12 md:py-20';

  return (
    <motion.section
      className={`w-full flex flex-col items-center justify-center ${sectionPadding} px-4 bg-black text-center relative overflow-hidden`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeIn}
    >
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center px-4">
        <div className={`${compact ? 'min-h-[4.5rem] md:min-h-[6rem]' : 'min-h-[6rem]'} flex items-center justify-center`}>
          <AnimatePresence mode="wait" initial={false}>
            {isCustom ? (
              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight font-playfair ${compact ? 'mb-2' : ''}`}
              >
                {heading}
              </motion.h1>
            ) : (
              <motion.h1
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight font-playfair"
              >
                {disableTypewriter ? current.heading : <Typewriter text={current.heading} speed={30} />}
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={isCustom ? 'sub-custom' : `sub-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-base sm:text-lg md:text-xl font-semibold mb-6 text-white max-w-3xl mx-auto px-2 ${compact ? 'mb-3' : ''}`}
          >
            {isCustom ? subtext : current.subtext}
          </motion.p>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
            {!hideCTA && (
              <a
                href="/join"
                className="inline-block mt-2 px-6 py-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-lg"
              >
                Get Started
              </a>
            )}
        </motion.div>
      </div>
    </motion.section>
  );
}
