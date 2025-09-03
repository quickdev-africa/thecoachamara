"use client";
import { motion } from "framer-motion";
import { fadeIn } from "../fadeMotion";

export default function SiteHero() {
  return (
    <motion.section
      className="w-full flex flex-col items-center justify-center py-12 md:py-20 px-2 md:px-4 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeIn}
    >
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight font-playfair">
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent block">Discover the Energy Breakthrough</span>
          <span className="text-white block mt-1">Products that transform lives</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-semibold mb-6 text-gray-200 max-w-2xl mx-auto px-2">
          Curated quantum energy tools and accessories designed to support healing, vitality and wellbeing.
        </p>
      </div>
    </motion.section>
  );
}
