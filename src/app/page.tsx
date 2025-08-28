"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeIn, fadeInUp } from "./fadeMotion";

export default function Home() {
return (
<>
{/* HEADER / NAVIGATION */}
<header className="bg-black text-white sticky top-0 z-50 shadow">
{/* Top narrow bar with CTA */}
<div className="bg-amber-500 text-black text-xs py-1 px-2 text-center font-semibold tracking-wide">
Discount offer on Quantum Machine – Hospital in the home!
</div>
<nav className="flex items-center justify-between px-4 py-3 md:px-8">
<a href="/" className="text-2xl font-bold tracking-tight text-amber-500">TheCoachAmara</a>
<div className="flex items-center gap-6">
<a href="/about" className="hover:text-amber-400 transition text-sm font-medium">About</a>
<a href="/contact" className="hover:text-amber-400 transition text-sm font-medium">Contact Maralis Solutions</a>
<a href="/shop/cart" className="relative">
<svg className="text-xl hover:text-amber-400 transition" fill="currentColor" viewBox="0 0 20 20" width="24" height="24"><path d="M16 11V7a4 4 0 10-8 0v4a4 4 0 108 0zm-8 0V7a2 2 0 114 0v4a2 2 0 11-4 0z" /></svg>
</a>
</div>
</nav>
</header>

<main className="bg-white min-h-screen w-full flex flex-col items-center font-sans text-black">
{/* HERO SECTION */}
<motion.section
className="w-full flex flex-col items-center justify-center py-16 md:py-28 px-2 md:px-4 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-center relative overflow-hidden"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
{/* Soft overlay and energy effect */}
<div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
<div className="w-full h-full bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-500/10" />
{/* Geometric patterns */}
<div className="absolute top-10 left-10 w-16 h-16 md:w-32 md:h-32 border border-yellow-400/20 rotate-45"></div>
<div className="absolute bottom-20 right-10 w-12 h-12 md:w-24 md:h-24 border border-yellow-400/30 rotate-12"></div>
<div className="absolute top-1/2 left-1/4 w-8 h-8 md:w-16 md:h-16 border border-yellow-400/25 rotate-90"></div>
</div>
<div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight font-playfair drop-shadow-2xl">
<span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent block">Discover the Energy Breakthrough</span>
<span className="text-white block mt-2">That's Transforming Lives</span>
</h1>
<p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-8 md:mb-10 text-gray-200 max-w-2xl mx-auto px-2">
For thousands worldwide, <span className="text-yellow-400 font-bold">Energy</span> has been the turning point — restoring vitality, promoting healing, and empowering people to live healthier, stronger, and more fulfilled lives.
</p>
{/* Video Embed */}
<div id="explainer-video" className="w-full max-w-3xl mx-auto aspect-video bg-black rounded-2xl md:rounded-3xl flex items-center justify-center text-gray-500 text-sm md:text-lg font-semibold mb-6 md:mb-8 overflow-hidden shadow-2xl border-2 md:border-4 border-yellow-400/50">
<iframe
width="100%"
height="100%"
src="https://www.youtube.com/embed/vkG_plov8Ao"
title="Energy Explainer Video"
frameBorder="0"
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
allowFullScreen
className="w-full h-full rounded-2xl md:rounded-3xl"
></iframe>
</div>
<a
href="/join"
className="inline-block px-6 py-3 md:px-10 md:py-5 rounded-full text-base md:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-2xl hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 mb-2 drop-shadow-lg max-w-xs md:max-w-none text-center"
>
Join the Community
</a>
</div>
</motion.section>

{/* SECTION 2: WHAT IS ENERGY */}
<motion.section
className="w-full py-16 px-4 bg-gray-50 flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
{/* Left: Text Content */}
<div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
<h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair text-black">What Is Energy?</h2>
<div className="w-16 h-1 bg-yellow-400 mb-6"></div>
<p className="text-lg md:text-xl font-bold mb-6 text-gray-800">
Energy is more than a buzzword — it's a practical tool that has helped people:
</p>
<ul className="list-none text-left text-lg font-bold mb-8 text-gray-800 space-y-3">
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">⚡</span> Boost immunity naturally</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">🔄</span> Accelerate recovery and healing</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">⚖️</span> Balance mind, body, and spirit</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500 text-xl">✨</span> Live with sustained energy and clarity</li>
</ul>
</div>
{/* Right: Image */}
<div className="w-full h-full flex items-stretch">
<Image
src="/quantum-energy.jpg"
alt="Energy Illustration"
className="w-full h-full object-cover rounded-none border-4 border-yellow-400"
style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
width={800}
height={600}
priority
/>
</div>
</div>
</motion.section>

{/* SECTION 3: PROOF OF TRANSFORMATION */}
<motion.section
className="w-full py-20 px-4 bg-white flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-black font-playfair text-center drop-shadow">Proof of Transformation</h2>
<div className="w-20 h-1 bg-yellow-400 mb-8"></div>
<p className="text-lg md:text-xl font-semibold mb-8 max-w-2xl text-center text-gray-700">
Over 1,000+ people have already embraced Energy tools and the transformation is undeniable. Here are just a few of their stories:
</p>
<ul className="list-none text-left text-lg font-bold mb-10 max-w-xl mx-auto text-gray-800 space-y-2">
<li className="flex items-center"><span className="mr-3 text-yellow-500">🏥</span> Reduced hospital visits (&quot;a hospital in the home&quot;)</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500">🎯</span> Greater focus and productivity</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500">💪</span> Enhanced wellness without dependency on drugs</li>
<li className="flex items-center"><span className="mr-3 text-yellow-500">❤️</span> Improved intimacy &amp; vitality (through Energy Boxers)</li>
</ul>
<div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 mb-12">
<motion.div
className="flex-1 bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border-l-4 border-yellow-400 hover:shadow-yellow-400/30 transition-shadow duration-200"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeInUp}
>
<h3 className="font-bold text-2xl mb-4 text-yellow-400">&quot;A Hospital in the Home&quot;</h3>
<p className="text-base text-gray-300 font-semibold mb-4 italic leading-relaxed">&quot;Before discovering Energy, my family was constantly in and out of hospitals. Since we started using the tools, our home feels like a sanctuary of health. My son&apos;s asthma attacks have reduced dramatically, and my own energy levels are the best they&apos;ve been in years. I truly believe every home should have access to this breakthrough.&quot;</p>
<div className="mt-auto flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">J</span>
<span className="font-bold text-white">Janet O., Lagos</span>
</div>
</motion.div>
<motion.div
className="flex-1 bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border-l-4 border-yellow-400 hover:shadow-yellow-400/30 transition-shadow duration-200"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeInUp}
>
<h3 className="font-bold text-2xl mb-4 text-yellow-400">&quot;Productivity &amp; Wellness Unlocked&quot;</h3>
<p className="text-base text-gray-300 font-semibold mb-4 italic leading-relaxed">&quot;Energy has been a game changer for my focus and productivity. I used to rely on coffee and painkillers to get through my workday, but now I feel clear-headed and energized from morning till night. My migraines are gone, and I&apos;m more present with my family. I recommend this to anyone who wants to break free from dependency and thrive naturally.&quot;</p>
<div className="mt-auto flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">T</span>
<span className="font-bold text-white">Tunde A., Abuja</span>
</div>
</motion.div>
<motion.div
className="flex-1 bg-black rounded-3xl shadow-2xl p-10 flex flex-col items-start justify-between min-h-[320px] border-l-4 border-yellow-400 hover:shadow-yellow-400/30 transition-shadow duration-200"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeInUp}
>
<h3 className="font-bold text-2xl mb-4 text-yellow-400">&quot;Intimacy &amp; Vitality Restored&quot;</h3>
<p className="text-base text-gray-300 font-semibold mb-4 italic leading-relaxed">&quot;I was skeptical at first, but Energy Boxers have completely changed my life. My relationship with my partner is stronger, and I feel a renewed sense of vitality and confidence. The best part is that I no longer need to rely on medication for intimacy issues. This is real transformation&mdash;thank you, Coach Amara!&quot;</p>
<div className="mt-auto flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">A</span>
<span className="font-bold text-white">Ada E., Port Harcourt</span>
</div>
</motion.div>
</div>
<a
href="/join"
className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 max-w-xs md:max-w-none text-center"
>
Be Part of This Movement Today
</a>
</motion.section>

{/* SECTION 4: INTRODUCING COACH AMARA */}
<motion.section
className="w-full py-20 px-4 bg-gray-50 flex flex-col items-center"
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
className="w-full h-full object-cover border-4 border-yellow-400"
style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '350px', maxHeight: '500px' }}
width={800}
height={500}
priority
/>
</div>
{/* Right: Content */}
<div className="flex flex-col justify-center w-full h-full p-8 md:p-12">
<h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-black font-playfair text-center md:text-left drop-shadow">Meet Coach Amara</h2>
<div className="w-20 h-1 bg-yellow-400 mb-6 mx-auto md:mx-0"></div>
<p className="text-lg md:text-xl font-semibold mb-6 text-gray-700 text-center md:text-left leading-relaxed">
Behind this movement is <span className="text-black font-bold">Coach Amara</span> — a consistent coach who has personally achieved 10-figure success while guiding others to transform their lives.<br /><br />
She&apos;s an unapologetic Energy advocate, merging business mastery with healing advocacy to build independent, healthy, and empowered communities.
</p>
<div className="flex justify-center md:justify-start mt-4">
<a
href="/join"
className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 max-w-xs md:max-w-none text-center"
>
Join TheCoachAmara Community
</a>
</div>
</div>
</div>
</motion.section>

{/* SECTION 5: TESTIMONIALS */}
<motion.section
className="w-full py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white font-playfair text-center drop-shadow">Real People. Real Healing. Real Results.</h2>
<div className="w-20 h-1 bg-yellow-400 mb-10"></div>
<p className="text-lg md:text-xl font-semibold mb-10 max-w-2xl text-center text-gray-300">
Hear directly from real people whose lives have been transformed by Energy. These are their stories, in their own words—unfiltered, authentic, and inspiring.
</p>
<div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
{/* 6 YouTube video testimonial cards */}
<a href="https://www.youtube.com/watch?v=JxXILs3aLtk" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
<iframe className="w-full h-full" src="https://www.youtube.com/embed/JxXILs3aLtk" title="Testimonial 1" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">&quot;Energy gave me my life back.&quot;</div>
<div className="text-gray-300 text-sm">Janet shares how her chronic fatigue disappeared after joining the community.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=odLxfeAuSZQ" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
<iframe className="w-full h-full" src="https://www.youtube.com/embed/odLxfeAuSZQ" title="Testimonial 2" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">&quot;No more migraines, no more painkillers.&quot;</div>
<div className="text-gray-300 text-sm">Tunde explains how Energy tools ended years of headaches.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=oQdZ99ePHvY" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
<iframe className="w-full h-full" src="https://www.youtube.com/embed/oQdZ99ePHvY" title="Testimonial 3" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"My family is thriving."</div>
<div className="text-gray-300 text-sm">Ada describes the transformation in her home after using Energy Boxers.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=TMiIrmDqOYw " target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
<iframe className="w-full h-full" src="https://www.youtube.com/embed/TMiIrmDqOYw" title="Testimonial 4" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"I feel younger and stronger."</div>
<div className="text-gray-300 text-sm">Chidi talks about renewed vitality and energy after joining the movement.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=Q5XVS5oPtyk" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
<iframe className="w-full h-full" src="https://www.youtube.com/embed/Q5XVS5oPtyk" title="Testimonial 5" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"From skeptic to believer."</div>
<div className="text-gray-300 text-sm">Ngozi shares her journey from doubt to real results with Energy.</div>
</div>
</a>
<a href="https://www.youtube.com/watch?v=MrvAmnpnO7w" target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-3xl shadow-2xl p-0 flex flex-col overflow-hidden group hover:scale-[1.03] hover:shadow-yellow-400/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400">
<div className="aspect-video w-full bg-black">
<iframe className="w-full h-full" src="https://www.youtube.com/embed/MrvAmnpnO7w" title="Testimonial 6" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
</div>
<div className="p-6 text-white">
<div className="font-bold mb-2 text-lg text-yellow-400">"Community, support, and healing."</div>
<div className="text-gray-300 text-sm">Bola describes the power of community and support in her healing journey.</div>
</div>
</a>
</div>
<a
href="/join"
className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200 max-w-xs md:max-w-none text-center"
>
Start Your Own Energy Journey
</a>
</motion.section>

{/* SECTION 6: JOIN THE MOVEMENT */}
<motion.section
className="w-full py-20 px-4 bg-white flex flex-col items-center"
initial="hidden"
whileInView="show"
viewport={{ once: true, amount: 0.3 }}
variants={fadeIn}
>
<div className="w-full max-w-2xl mx-auto flex flex-col items-center">
<div className="flex flex-col items-center mb-6">
<div className="w-16 h-16 rounded-full bg-black border-2 border-yellow-400 flex items-center justify-center shadow-xl mb-4">
<svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-yellow-400"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5.13a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
</div>
<h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-black font-playfair text-center drop-shadow">Join the Community Today</h2>
<div className="w-20 h-1 bg-yellow-400 mb-4"></div>
<p className="text-lg md:text-xl font-semibold mb-2 text-center text-gray-700 max-w-xl">Be part of a vibrant, supportive community dedicated to healing, growth, and real transformation. Your journey starts here.</p>
</div>
<div className="w-full bg-black rounded-2xl border-2 border-yellow-400 shadow-2xl p-8 flex flex-col items-center">
<div className="w-full flex flex-col gap-4 font-bold">
<input
type="text"
name="name"
placeholder="Your Name"
className="px-4 py-3 rounded border-2 border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-lg"
/>
<button
type="button"
className="w-full px-6 py-3 md:px-8 md:py-4 rounded-full text-base md:text-lg font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg hover:scale-105 hover:shadow-yellow-400/50 transition-all duration-200"
onClick={e => { e.preventDefault(); window.location.href = '/join'; }}
>
Yes, I'm Ready to Join
</button>
</div>
<ul className="list-none text-left text-lg font-bold mt-8 mb-0 text-gray-300 space-y-2">
<li className="flex items-center"><span className="mr-3 text-yellow-400">✨</span> Access to exclusive insights &amp; healing resources</li>
<li className="flex items-center"><span className="mr-3 text-yellow-400">🤝</span> Connection with like-minded individuals</li>
<li className="flex items-center"><span className="mr-3 text-yellow-400">⚡</span> A chance to explore Energy tools that work</li>
</ul>
</div>
</div>
</motion.section>

{/* FOOTER */}
<footer className="bg-black text-white py-8 mt-16">
<div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
<div className="text-amber-500 font-bold text-lg">TheCoachAmara</div>
<div className="flex gap-6 text-sm">
<a href="/about" className="hover:text-amber-400 transition">About</a>
<a href="/contact" className="hover:text-amber-400 transition">Contact Maralis Solutions</a>
<a href="/shop" className="hover:text-amber-400 transition">Shop</a>
</div>
<div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} TheCoachAmara. All rights reserved.</div>
</div>
</footer>
</main>
</>
);
}
