"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn, fadeInUp } from "../fadeMotion";

export default function About() {
  return (
    <>
      {/* HEADER / NAVIGATION */}
      <motion.header
        className="w-full bg-white border-b border-gray-200 sticky top-0 z-20"
        initial="hidden"
        animate="show"
        variants={fadeInUp}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-2 md:px-4 py-4 md:py-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Coach Amara"
              width={100}
              height={40}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </a>
          {/* Menu */}
          <div className="flex items-center gap-1 md:gap-4">
            <a href="/shop" className="px-2 md:px-5 py-1 md:py-2 rounded-full font-semibold text-black hover:bg-gray-100 transition text-xs md:text-base whitespace-nowrap">Web Store</a>
            <a href="/join" className="px-2 md:px-6 py-1 md:py-2 rounded-full font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all text-xs md:text-base whitespace-nowrap">Join the Community</a>
          </div>
        </nav>
      </motion.header>

      <main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black">
        {/* HERO SECTION */}
        <motion.section
          className="w-full flex flex-col items-center justify-center py-16 md:py-28 px-2 md:px-4 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-500/10" />
            <div className="absolute top-10 left-10 w-16 h-16 md:w-32 md:h-32 border border-yellow-400/20 rotate-45"></div>
            <div className="absolute bottom-20 right-10 w-12 h-12 md:w-24 md:h-24 border border-yellow-400/30 rotate-12"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 md:w-16 md:h-16 border border-yellow-400/25 rotate-90"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight font-playfair drop-shadow-2xl">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent block">About Coach Amara</span>
              <span className="text-white block mt-2">Change Catalyst & Quantum Energy Advocate</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-8 md:mb-10 text-gray-200 max-w-3xl mx-auto px-2">
              Transforming lives through the power of <span className="text-yellow-400 font-bold">Quantum Energy</span>, business mastery, and authentic leadership — because true success includes holistic wellness.
            </p>
          </div>
        </motion.section>

        {/* PERSONAL STORY SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-gray-50 flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
            {/* Left: Image */}
            <div className="w-full h-full flex items-stretch">
              <Image
                src="/amarawithquantum.jpg"
                alt="Coach Amara with Quantum Energy"
                className="w-full h-full object-cover border-4 border-yellow-400"
                style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }}
                width={800}
                height={600}
                priority
              />
            </div>
            {/* Right: Content */}
            <div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair text-black">My Journey to Quantum Wellness</h2>
              <div className="w-16 h-1 bg-yellow-400 mb-6"></div>
              <p className="text-lg md:text-xl font-semibold mb-6 text-gray-700 leading-relaxed">
                I'm <span className="text-black font-bold">Coach Amara</span>, and my story began long before I discovered the transformative power of Quantum Energy. Like many successful entrepreneurs, I achieved what others might call "everything" — building businesses that generated 10-figure success and helping countless individuals reach their potential.
              </p>
              <p className="text-lg md:text-xl font-semibold mb-6 text-gray-700 leading-relaxed">
                But success felt incomplete when I realized that true wealth includes vibrant health, authentic relationships, and spiritual alignment. That's when I discovered Quantum Energy — and everything changed.
              </p>
            </div>
          </div>
        </motion.section>

        {/* MISSION & VISION SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-white flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-6xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair text-center drop-shadow">My Mission & Vision</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-12 mx-auto"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              {/* Mission */}
              <motion.div
                className="bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-center border-2 border-yellow-400"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mb-6">
                  <svg width="36" height="36" fill="currentColor" viewBox="0 0 20 20" className="text-black">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400">My Mission</h3>
                <p className="text-lg text-gray-300 font-semibold leading-relaxed text-center">
                  To merge business mastery with healing advocacy, creating independent, healthy, and empowered communities where people don't just survive — they thrive through authentic transformation and Quantum Energy wellness.
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                className="bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-center border-2 border-yellow-400"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mb-6">
                  <svg width="36" height="36" fill="currentColor" viewBox="0 0 20 20" className="text-black">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400">My Vision</h3>
                <p className="text-lg text-gray-300 font-semibold leading-relaxed text-center">
                  A world where every individual has access to the tools, knowledge, and community support needed to achieve holistic success — where financial prosperity walks hand-in-hand with vibrant health and spiritual fulfillment.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* EXPERTISE & CREDENTIALS SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-gray-50 flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair text-center drop-shadow">Why People Trust Me</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-12 mx-auto"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Business Success */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-400"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-4">10-Figure</div>
                <h3 className="text-xl font-bold mb-4 text-black">Business Success</h3>
                <p className="text-gray-700 font-semibold">
                  Proven track record of building and scaling businesses to unprecedented levels of success, with results that speak for themselves.
                </p>
              </motion.div>

              {/* Community Impact */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-400"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-4">1000+</div>
                <h3 className="text-xl font-bold mb-4 text-black">Lives Transformed</h3>
                <p className="text-gray-700 font-semibold">
                  Over a thousand individuals have experienced real, measurable improvements in their health, energy, and overall well-being.
                </p>
              </motion.div>

              {/* Authentic Leadership */}
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8 text-center border-l-4 border-yellow-400"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInUp}
              >
                <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-4">100%</div>
                <h3 className="text-xl font-bold mb-4 text-black">Authentic Approach</h3>
                <p className="text-gray-700 font-semibold">
                  Uncompromising commitment to authentic leadership, real results, and transparent communication with every community member.
                </p>
              </motion.div>
            </div>

            {/* Core Values */}
            <div className="bg-black rounded-3xl shadow-2xl p-10 border-2 border-yellow-400">
              <h3 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-400 text-center">My Core Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold mr-4">1</span>
                    <div>
                      <h4 className="font-bold text-lg text-yellow-400">Authentic Transformation</h4>
                      <p className="text-gray-300">Real change that lasts, not quick fixes or empty promises.</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold mr-4">2</span>
                    <div>
                      <h4 className="font-bold text-lg text-yellow-400">Holistic Success</h4>
                      <p className="text-gray-300">Wealth means nothing without health, relationships, and purpose.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold mr-4">3</span>
                    <div>
                      <h4 className="font-bold text-lg text-yellow-400">Community Empowerment</h4>
                      <p className="text-gray-300">Building networks of support where everyone rises together.</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold mr-4">4</span>
                    <div>
                      <h4 className="font-bold text-lg text-yellow-400">Evidence-Based Wellness</h4>
                      <p className="text-gray-300">Every tool and technique I recommend is backed by real results.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* QUANTUM ENERGY APPROACH SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-white flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair text-center drop-shadow">My Approach to Quantum Energy</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-12 mx-auto"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
              {/* Left: Content */}
              <div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-black">Beyond Traditional Coaching</h3>
                <p className="text-lg md:text-xl font-semibold mb-6 text-gray-700 leading-relaxed">
                  While many coaches focus solely on mindset or business strategy, I recognized that lasting transformation requires addressing the whole person — mind, body, and spirit.
                </p>
                <p className="text-lg md:text-xl font-semibold mb-6 text-gray-700 leading-relaxed">
                  <span className="text-black font-bold">Quantum Energy</span> became the bridge between traditional success coaching and holistic wellness. It's not about choosing between financial prosperity and vibrant health — it's about having both.
                </p>
                <ul className="list-none text-left text-lg font-bold mb-8 text-gray-800 space-y-3">
                  <li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">🎯</span> Practical, results-driven approach</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">🔬</span> Evidence-based wellness tools</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">🤝</span> Community-centered transformation</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">💫</span> Sustainable, long-term results</li>
                </ul>
              </div>
              {/* Right: Image */}
              <div className="w-full h-full flex items-stretch">
                <Image
                  src="/coach-amara.jpg"
                  alt="Coach Amara Professional"
                  className="w-full h-full object-cover border-4 border-yellow-400"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }}
                  width={800}
                  height={600}
                  priority
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* PERSONAL TOUCH SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-white font-playfair drop-shadow">A Personal Message</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-12 mx-auto"></div>
            
            <div className="bg-gray-900 rounded-3xl shadow-2xl p-10 border-2 border-yellow-400">
              <p className="text-lg md:text-xl font-semibold mb-6 text-gray-300 leading-relaxed italic">
                "I've walked the path of traditional success — the late nights, the relentless hustle, the belief that 'more' always equals 'better.' But I've also discovered something profound: true success isn't just about what you achieve; it's about how you feel while achieving it and how sustainable that success is for your whole life."
              </p>
              <p className="text-lg md:text-xl font-semibold mb-8 text-gray-300 leading-relaxed italic">
                "Quantum Energy changed not just how I coach, but how I live. It gave me the missing piece — the understanding that our bodies, minds, and spirits are interconnected systems that thrive when we honor all parts of ourselves."
              </p>
              <p className="text-xl md:text-2xl font-bold text-yellow-400 leading-relaxed">
                "I'm not here to just help you succeed. I'm here to help you thrive — completely, authentically, and sustainably."
              </p>
              <div className="mt-8 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black text-2xl mr-4">A</div>
                <div className="text-left">
                  <div className="font-bold text-white text-xl">Coach Amara</div>
                  <div className="text-gray-400">Founder & CEO, TheCoachAmara Community</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CALL TO ACTION SECTION */}
        <motion.section
          className="w-full py-20 px-4 bg-gray-50 flex flex-col items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <div className="w-full max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair drop-shadow">Ready to Transform Your Life?</h2>
            <div className="w-20 h-1 bg-yellow-400 mb-8 mx-auto"></div>
            <p className="text-lg md:text-xl font-semibold mb-8 text-gray-700 max-w-2xl mx-auto">
              Join over 1,000 individuals who have discovered the power of Quantum Energy to create lasting transformation in every area of their lives.
            </p>
            
            <div className="bg-black rounded-3xl shadow-2xl p-10 border-2 border-yellow-400 mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400">What You'll Get in Our Community:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <ul className="space-y-3 text-white">
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">✨</span> Exclusive access to Quantum Energy tools and techniques</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">🎯</span> Personal guidance from Coach Amara</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">🤝</span> Supportive community of like-minded individuals</li>
                </ul>
                <ul className="space-y-3 text-white">
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">📚</span> Evidence-based wellness resources</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">💪</span> Tools for sustainable health and vitality</li>
                  <li className="flex items-center"><span className="mr-3 text-yellow-400">🚀</span> Strategies for holistic success</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/join"
                className="inline-block px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200"
              >
                Join the Community Today
              </a>
              <a
                href="/shop"
                className="inline-block px-8 py-4 rounded-full text-lg font-bold border-2 border-yellow-400 text-black hover:bg-yellow-400 hover:text-black transition-all duration-200"
              >
                Explore Quantum Tools
              </a>
            </div>
          </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="w-full py-8 px-4 bg-black text-white flex flex-col items-center border-t-2 border-yellow-400 mt-8">
          <div className="flex gap-6 mb-4 flex-wrap justify-center">
            <a href="/about" className="hover:text-yellow-400 transition-colors font-bold">About Amara</a>
            <a href="/contact" className="hover:text-yellow-400 transition-colors font-bold">Contact Us</a>
            <a href="/shop" className="hover:text-yellow-400 transition-colors font-bold">Shop</a>
            <a href="https://maralissolutions.com" className="hover:text-yellow-400 transition-colors font-bold" target="_blank" rel="noopener noreferrer">Maralis Solutions</a>
          </div>
          <p className="text-gray-400 text-sm text-center">&copy; {new Date().getFullYear()} TheCoachAmara.com. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
}
