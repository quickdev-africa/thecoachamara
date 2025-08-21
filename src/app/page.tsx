

"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn, fadeInUp } from "./fadeMotion";

export default function Home() {
  return (
    <>
      {/* HEADER / NAVIGATION */}
      <motion.header
        className="w-full bg-white border-b border-gray-100 sticky top-0 z-20"
        initial="hidden"
        animate="show"
        variants={fadeInUp}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            {/* Stylized logo text */}
            <span className="font-logo text-amber-600 drop-shadow-sm" style={{fontWeight: 400, fontFamily: "'Great Vibes', cursive, var(--font-logo)"}}>Coach Amara</span>
          </a>
          {/* Menu */}
          <div className="flex items-center gap-4">
            <a href="/shop" className="px-5 py-2 rounded-full font-semibold text-black hover:bg-amber-50 transition">Web Store</a>
            <a href="/join" className="px-6 py-2 rounded-full font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow hover:scale-105 hover:shadow-2xl transition-transform">Join the Community</a>
          </div>
        </nav>
  </motion.header>
  <main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black">
      {/* HERO SECTION */}
      <motion.section
        className="w-full flex flex-col items-center justify-center py-28 px-4 bg-gradient-to-br from-amber-200 via-amber-50 to-white text-center relative overflow-hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        {/* Soft overlay and energy effect */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-amber-300 via-white to-amber-100 opacity-70" />
          {/* Add SVG or animated energy waves/light beams here as needed */}
        </div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight font-playfair text-amber-700 drop-shadow-lg">
            <span className="bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 bg-clip-text text-transparent">Discover the Quantum Energy Breakthrough</span>
            <br className="hidden md:block" />
            <span className="text-black">That's Transforming Lives</span>
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-10 text-black/80 max-w-2xl mx-auto">
            For thousands worldwide, <span className="text-amber-700 font-bold">Quantum Energy</span> has been the turning point — restoring vitality, promoting healing, and empowering people to live healthier, stronger, and more fulfilled lives.
          </p>
          {/* Video Embed */}
          <div id="explainer-video" className="w-full max-w-3xl mx-auto aspect-video bg-black/80 rounded-3xl flex items-center justify-center text-gray-500 text-lg font-semibold mb-8 overflow-hidden shadow-2xl border-4 border-amber-200">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Quantum Energy Explainer Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full rounded-3xl"
            ></iframe>
          </div>
          <a
            href="/join"
            className="inline-block px-10 py-5 rounded-full text-2xl font-extrabold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-2xl hover:scale-105 hover:shadow-amber-400/40 transition-transform duration-200 text-white mb-2 drop-shadow-lg"
          >
            Join the Community
          </a>
        </div>
      </motion.section>

      {/* SECTION 2: WHAT IS QUANTUM ENERGY */}
      <motion.section
        className="w-full py-16 px-4 bg-[#f8f9fa] flex flex-col items-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">What Is Quantum Energy?</h2>
            <p className="text-lg md:text-xl font-bold mb-6 text-black/90">
              Quantum Energy is more than a buzzword — it's a practical tool that has helped people:
            </p>
            <ul className="list-disc list-inside text-left text-lg font-bold mb-8 text-black/90">
              <li>Boost immunity naturally</li>
              <li>Accelerate recovery and healing</li>
              <li>Balance mind, body, and spirit</li>
              <li>Live with sustained energy and clarity</li>
            </ul>
          </div>
          {/* Right: Image */}
          <div className="w-full h-full flex items-stretch">
            <Image
              src="/quantum-energy.jpg"
              alt="Quantum Energy Illustration"
              className="w-full h-full object-cover rounded-none"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              width={800}
              height={600}
              priority
            />
          </div>
        </div>
  {/* Centered CTA below both columns - removed as requested */}
      </motion.section>

      {/* SECTION 3: PROOF OF TRANSFORMATION */}
      <motion.section
        className="w-full py-20 px-4 bg-gradient-to-br from-amber-50 via-white to-amber-100 flex flex-col items-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-amber-700 font-playfair text-center drop-shadow">Proof of Transformation</h2>
        <p className="text-lg md:text-xl font-semibold mb-8 max-w-2xl text-center text-black/80">
          Over 1,000+ people have already embraced Quantum Energy tools and the transformation is undeniable. Here are just a few of their stories:
        </p>
        <ul className="list-disc list-inside text-left text-lg font-bold mb-10 max-w-xl mx-auto text-black/90">
              <li>Reduced hospital visits (&quot;a hospital in the home&quot;)</li>
          <li>Greater focus and productivity</li>
          <li>Enhanced wellness without dependency on drugs</li>
          <li>Improved intimacy & vitality (through Quantum Boxers)</li>
        </ul>
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 mb-12">
          <motion.div
            className="flex-1 bg-gradient-to-br from-amber-50 via-white to-amber-100 rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border border-amber-200 hover:shadow-amber-400/30 transition-shadow duration-200"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h3 className="font-bold text-2xl mb-4 text-amber-700">&quot;A Hospital in the Home&quot;</h3>
            <p className="text-base text-black/90 font-semibold mb-4 italic">&quot;Before discovering Quantum Energy, my family was constantly in and out of hospitals. Since we started using the tools, our home feels like a sanctuary of health. My son&apos;s asthma attacks have reduced dramatically, and my own energy levels are the best they&apos;ve been in years. I truly believe every home should have access to this breakthrough.&quot;</p>
            <div className="mt-auto flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-amber-300 flex items-center justify-center font-bold text-white">J</span>
              <span className="font-bold text-black">Janet O., Lagos</span>
            </div>
          </motion.div>
          <motion.div
            className="flex-1 bg-gradient-to-br from-green-50 via-white to-green-100 rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border border-green-200 hover:shadow-green-400/30 transition-shadow duration-200"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h3 className="font-bold text-2xl mb-4 text-green-700">&quot;Productivity &amp; Wellness Unlocked&quot;</h3>
            <p className="text-base text-black/90 font-semibold mb-4 italic">&quot;Quantum Energy has been a game changer for my focus and productivity. I used to rely on coffee and painkillers to get through my workday, but now I feel clear-headed and energized from morning till night. My migraines are gone, and I&apos;m more present with my family. I recommend this to anyone who wants to break free from dependency and thrive naturally.&quot;</p>
            <div className="mt-auto flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-bold text-white">T</span>
              <span className="font-bold text-black">Tunde A., Abuja</span>
            </div>
          </motion.div>
          <motion.div
            className="flex-1 bg-gradient-to-br from-purple-50 via-white to-purple-100 rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border border-purple-200 hover:shadow-purple-400/30 transition-shadow duration-200"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h3 className="font-bold text-2xl mb-4 text-purple-700">&quot;Intimacy &amp; Vitality Restored&quot;</h3>
            <p className="text-base text-black/90 font-semibold mb-4 italic">&quot;I was skeptical at first, but Quantum Boxers have completely changed my life. My relationship with my partner is stronger, and I feel a renewed sense of vitality and confidence. The best part is that I no longer need to rely on medication for intimacy issues. This is real transformation&mdash;thank you, Coach Amara!&quot;</p>
            <div className="mt-auto flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold text-white">A</span>
              <span className="font-bold text-black">Ada E., Port Harcourt</span>
            </div>
          </motion.div>
        </div>
        <a
          href="/join"
          className="inline-block px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white"
        >
          Be Part of This Movement Today
        </a>
      </motion.section>

      {/* SECTION 4: INTRODUCING COACH AMARA */}
      <motion.section
        className="w-full py-20 px-4 bg-gradient-to-br from-amber-50 via-white to-amber-100 flex flex-col items-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
          {/* Left: Rectangular Image of Coach Amara */}
          <div className="w-full h-full flex items-stretch">
            <Image
              src="/coach-amara.jpg"
              alt="Coach Amara"
              className="w-full h-full object-cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '350px', maxHeight: '500px' }}
              width={800}
              height={500}
              priority
            />
          </div>
          {/* Right: Content */}
          <div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-amber-700 font-playfair text-center md:text-left drop-shadow">Meet Coach Amara</h2>
            <p className="text-lg md:text-xl font-semibold mb-6 text-black/90 text-center md:text-left">
              Behind this movement is <span className="text-amber-700 font-bold">Coach Amara</span> — a consistent coach who has personally achieved 10-figure success while guiding others to transform their lives.<br /><br />
              She&apos;s an unapologetic Quantum Energy advocate, merging business mastery with healing advocacy to build independent, healthy, and empowered communities.
            </p>
            <div className="flex justify-center md:justify-start mt-4">
              <a
                href="/join"
                className="inline-block px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white"
              >
                Join TheCoachAmara Community
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 5: TESTIMONIALS */}
      <motion.section
        className="w-full py-20 px-4 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col items-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white font-playfair text-center drop-shadow">Real People. Real Healing. Real Results.</h2>
        <p className="text-lg md:text-xl font-semibold mb-10 max-w-2xl text-center text-white/80">
          Hear directly from real people whose lives have been transformed by Quantum Energy. These are their stories, in their own words—unfiltered, authentic, and inspiring.
        </p>
        <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {/* 6 YouTube video testimonial cards */}
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-amber-400/30 transition-transform duration-200 border border-amber-900/10">
            <div className="aspect-video w-full bg-black">
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Testimonial 1" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
            <div className="p-6 text-white">
              <div className="font-bold mb-2 text-lg">&quot;Quantum Energy gave me my life back.&quot;</div>
              <div className="text-white/80 text-sm">Janet shares how her chronic fatigue disappeared after joining the community.</div>
            </div>
          </a>
          <a href="https://www.youtube.com/watch?v=V-_O7nl0Ii0" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-amber-400/30 transition-transform duration-200 border border-amber-900/10">
            <div className="aspect-video w-full bg-black">
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/V-_O7nl0Ii0" title="Testimonial 2" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
            <div className="p-6 text-white">
              <div className="font-bold mb-2 text-lg">&quot;No more migraines, no more painkillers.&quot;</div>
              <div className="text-white/80 text-sm">Tunde explains how Quantum Energy tools ended years of headaches.</div>
            </div>
          </a>
          <a href="https://www.youtube.com/watch?v=3JZ_D3ELwOQ" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-amber-400/30 transition-transform duration-200 border border-amber-900/10">
            <div className="aspect-video w-full bg-black">
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/3JZ_D3ELwOQ" title="Testimonial 3" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
            <div className="p-6 text-white">
              <div className="font-bold mb-2 text-lg">“My family is thriving.”</div>
              <div className="text-white/80 text-sm">Ada describes the transformation in her home after using Quantum Boxers.</div>
            </div>
          </a>
          <a href="https://www.youtube.com/watch?v=l9PxOanFjxQ" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-amber-400/30 transition-transform duration-200 border border-amber-900/10">
            <div className="aspect-video w-full bg-black">
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/l9PxOanFjxQ" title="Testimonial 4" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
            <div className="p-6 text-white">
              <div className="font-bold mb-2 text-lg">“I feel younger and stronger.”</div>
              <div className="text-white/80 text-sm">Chidi talks about renewed vitality and energy after joining the movement.</div>
            </div>
          </a>
          <a href="https://www.youtube.com/watch?v=Zi_XLOBDo_Y" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-amber-400/30 transition-transform duration-200 border border-amber-900/10">
            <div className="aspect-video w-full bg-black">
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/Zi_XLOBDo_Y" title="Testimonial 5" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
            <div className="p-6 text-white">
              <div className="font-bold mb-2 text-lg">“From skeptic to believer.”</div>
              <div className="text-white/80 text-sm">Ngozi shares her journey from doubt to real results with Quantum Energy.</div>
            </div>
          </a>
          <a href="https://www.youtube.com/watch?v=ub82Xb1C8os" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-amber-400/30 transition-transform duration-200 border border-amber-900/10">
            <div className="aspect-video w-full bg-black">
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/ub82Xb1C8os" title="Testimonial 6" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
            </div>
            <div className="p-6 text-white">
              <div className="font-bold mb-2 text-lg">“Community, support, and healing.”</div>
              <div className="text-white/80 text-sm">Bola describes the power of community and support in her healing journey.</div>
            </div>
          </a>
        </div>
        <a
          href="/join"
          className="inline-block px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white"
        >
          Start Your Own Quantum Journey
        </a>
      </motion.section>

      {/* SECTION 6: JOIN THE MOVEMENT */}
      <motion.section
        className="w-full py-20 px-4 bg-gradient-to-br from-amber-50 via-white to-amber-100 flex flex-col items-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
      >
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg mb-4">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5.13a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-amber-700 font-playfair text-center drop-shadow">Join the Community Today</h2>
            <p className="text-lg md:text-xl font-semibold mb-2 text-center text-black/80 max-w-xl">Be part of a vibrant, supportive community dedicated to healing, growth, and real transformation. Your journey starts here.</p>
          </div>
          <div className="w-full bg-white/90 rounded-2xl border border-amber-200 shadow-2xl p-8 flex flex-col items-center">
            <form className="w-full flex flex-col gap-4 font-bold">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg"
                required
              />
              <button
                type="submit"
                className="w-full px-8 py-4 rounded-full text-lg font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white"
                onClick={e => { e.preventDefault(); window.location.href = '/join'; }}
              >
                Yes, I'm Ready to Join
              </button>
            </form>
            <ul className="list-disc list-inside text-left text-lg font-bold mt-8 mb-0 text-black/90">
              <li>Access to exclusive insights & healing resources</li>
              <li>Connection with like-minded individuals</li>
              <li>A chance to explore Quantum Energy tools that work</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="w-full py-8 px-4 bg-[#f5f5f5] text-black flex flex-col items-center border-t border-gray-200 mt-8">
        <div className="flex gap-6 mb-4">
          <a href="/about" className="hover:underline font-bold">About Amara</a>
          <a href="/contact" className="hover:underline font-bold">Contact Us</a>
          <a href="/shop" className="hover:underline font-bold">Shop</a>
          <a href="https://maralissolutions.com" className="hover:underline font-bold" target="_blank" rel="noopener noreferrer">Maralis Solutions</a>
        </div>
        <p className="text-black/60 text-sm">&copy; {new Date().getFullYear()} TheCoachAmara.com. All rights reserved.</p>
      </footer>
    </main>
    </>
  );
}
