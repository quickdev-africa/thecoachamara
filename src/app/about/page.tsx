import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-gray-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">

        {/* Section 1 - Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight" style={{ color: '#FFD700', textShadow: '0 2px 3px rgba(0,0,0,0.55), 0 0 12px rgba(255,215,0,0.35)' }}>
              Meet Coach Amara – Inspiring Health, Healing & Prosperity
            </h1>

            <p className="mt-6 text-xl md:text-2xl text-slate-700 max-w-3xl">
              Coach Amara is a visionary leader from Nigeria making an impact locally and globally. Through the power of Quantum Energy and wellness coaching, she helps people restore balance, build resilience, and create financial freedom.
            </p>

            <div className="mt-8">
              <Link href="/join" className="inline-block bg-amber-400 hover:bg-amber-500 text-black font-extrabold px-8 py-4 md:px-10 md:py-5 rounded-full shadow-2xl transform hover:-translate-y-0.5 transition text-base md:text-xl lg:text-2xl md:text-center">Join Her Zoom Coaching Sessions</Link>
            </div>
          </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200">
                <Image src="/coachamaradp1.jpg" alt="Coach Amara" width={1000} height={1200} className="w-full h-auto object-cover" priority />
              </div>
            </div>
        </section>

        {/* Section 2 - Her Mission */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-1 lg:order-1 flex justify-center">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200">
              <Image src="/coachamaradp2.jpg" alt="Coach Amara speaking" width={900} height={600} className="w-full h-auto object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7 order-2 lg:order-2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold" style={{ color: '#FFD700', textShadow: '0 3px 4px rgba(0,0,0,0.55), 0 0 12px rgba(255,215,0,0.35)' }}>Her Mission</h2>
            <p className="mt-4 text-xl text-slate-700 leading-relaxed">
              Coach Amara believes true transformation comes from aligning mind, body, and spirit. She blends Quantum Energy, practical wellness practices, and coaching to empower people with tools for healing, resilience, and sustainable prosperity. Her mission: raise a generation of healthier, empowered, financially resilient individuals globally.
            </p>
          </div>
        </section>

        {/* Section 3 - Testimonial Spotlight */}
        <section className="bg-white shadow-lg rounded-2xl p-8">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center" style={{ color: '#FFD700', textShadow: '0 2px 3px rgba(0,0,0,0.5), 0 0 10px rgba(255,215,0,0.3)' }}>Real Stories. Real Impact.</h3>

            {/* Original left-border testimonial */}
            <blockquote className="mt-6 w-full border-l-4 border-amber-300 pl-6 text-slate-700 leading-relaxed text-lg relative">
              “My mother was critically ill and could not lift any part of her body. She could barely talk due to severe pain. I immediately took the Ceramic Tableware, Bracelet, and Quantum Scarf to her. After wrapping her in the scarf, putting the bracelet on, and giving her water from the ‘miracle’ cup, she began to recover. Within 30 minutes she stood up by herself. By the next morning, her swollen feet had gone down completely. Today, she is back on her feet — all pains gone. To the glory of God, she can do things for herself again. I’m so grateful to God for using Double Plus products.”
              <div className="mt-4 font-semibold">— Mrs. Esho, Lagos</div>
              {/* Decorative double-quote replacement for testimonial image */}
              <div className="absolute -right-8 -top-8 text-8xl text-amber-100 opacity-20">“”</div>
            </blockquote>

            {/* Second testimonial with right-side border for variety */}
            <blockquote
              className="mt-8 w-full mr-0 border-r-4 pl-6 pr-0 text-slate-700 leading-relaxed text-lg relative text-right"
              style={{ borderRightColor: '#FFD700' }}
            >
              “After months of sleepless nights and persistent back pain, I joined one of Coach Amara’s sessions out of curiosity. Within two weeks of applying the simple Energy practices and using the recommended tools, my sleep returned and the pain eased dramatically. I feel calmer, clearer, and far more productive — and my family has noticed the change too.”
              <div className="mt-4 font-semibold">— Chiamaka U., Enugu</div>
              <div className="absolute -right-8 -top-8 text-8xl text-amber-100 opacity-20">“”</div>
            </blockquote>
          </div>
        </section>

        {/* Section 4 - Invitation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 order-1 lg:order-1 flex justify-center">
            <div className="w-full max-w-none rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200 bg-white">
              <Image src="/coachamaraontraining.jpg" alt="Coach Amara coaching" width={920} height={640} className="w-full h-auto object-contain" />
            </div>
          </div>

          <div className="lg:col-span-6 order-2 lg:order-2">
            <h4 className="text-4xl md:text-5xl lg:text-6xl font-extrabold" style={{ color: '#FFD700', textShadow: '0 3px 4px rgba(0,0,0,0.55), 0 0 12px rgba(255,215,0,0.35)' }}>Be Part of the Movement</h4>
            <p className="mt-4 text-lg text-slate-700 leading-relaxed max-w-2xl">
              You don’t have to wait for change — step into it now. Coach Amara hosts periodic Zoom coaching sessions you can subscribe to or book individually. These sessions bring clarity, healing, and practical strategies for lasting prosperity.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row sm:flex-nowrap gap-4">
              <Link href="/join" className="inline-flex items-center justify-center whitespace-nowrap bg-amber-400 hover:bg-amber-500 text-black font-bold px-6 py-3 md:px-10 md:py-5 rounded-lg shadow text-base md:text-xl lg:text-2xl">Subscribe for Ongoing Access</Link>
              <Link href="/contact" className="inline-flex items-center justify-center whitespace-nowrap border border-slate-300 text-slate-800 bg-white px-6 py-3 md:px-10 md:py-5 rounded-lg hover:shadow text-base md:text-xl lg:text-2xl">Book a Single Session</Link>
            </div>
          </div>
        </section>

      </div>

      {/* Footer (copied from homepage) */}
      <footer className="bg-black text-white pt-10 pb-6 mt-16 w-full">
        <div className="w-full px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-9xl mx-auto">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">C</div>
                <div>
                  <div className="text-xl font-extrabold text-yellow-400">CoachAmara</div>
                  <div className="text-sm text-gray-300">Quantum energy coaching & wellness</div>
                </div>
              </div>
              <p className="text-base text-gray-400">Join our community for tools, trainings and real transformation — delivered with care.</p>
              <div className="mt-3 text-sm text-gray-300">
                <div>Phone: +2349127768471</div>
                <div>10 Ajibodu Street Karaole Estate College Road Ogba, Lagos</div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://www.youtube.com/@amaranwairu2446/featured" aria-label="YouTube" className="p-2 rounded bg-gray-900 hover:bg-gray-800">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23 7s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-1C17.6 3 12 3 12 3s-5.6 0-8.2.1c-.4 0-1.3 0-2 .9C1.2 5.6 1 7 1 7S1 8.7 1 10.5v3C1 17.3 1.2 19 1.2 19s.2 1.4.8 2c.7.8 1.6.8 2 1 2.6.1 8.2.1 8.2.1s5.6 0 8.2-.1c.4 0 1.3 0 2-.9.6-.6.8-2 .8-2s.2-1.7.2-3.5v-3C23 8.7 23 7 23 7zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z"/></svg>
                </a>
                <a href="https://www.facebook.com/amarachinedum" aria-label="Facebook" className="p-2 rounded bg-gray-900 hover:bg-gray-800">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 4.9 3.6 9 8.2 9.9v-7H7.9v-2.9h2.3V9.4c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .1 2 .1v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4v1.8h2.4l-.4 2.9h-2v7C18.4 21 22 16.9 22 12z"/></svg>
                </a>
                <a href="https://www.instagram.com/maralissolutions_ltd/" aria-label="Instagram" className="p-2 rounded bg-gray-900 hover:bg-gray-800">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.4-3.9a1.1 1.1 0 11-1.1 1.1 1.1 1.1 0 011.1-1.1z"/></svg>
                </a>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <h4 className="text-base font-bold text-gray-200 mb-2">Explore</h4>
                <ul className="space-y-2 text-base text-gray-400">
                  <li><a href="/about" className="hover:text-yellow-400">About</a></li>
                  <li><a href="/quantum" className="hover:text-yellow-400">Quantum Machine</a></li>
                  <li><a href="/shop" className="hover:text-yellow-400">Maralis Solutions</a></li>
                  <li><a href="/join" className="hover:text-yellow-400">Join</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-200 mb-2">Support</h4>
                <ul className="space-y-2 text-base text-gray-400">
                  <li><a href="/contact" className="hover:text-yellow-400">Contact Maralis</a></li>
                  <li><a href="/privacy" className="hover:text-yellow-400">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-yellow-400">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-base text-gray-400">&copy; {new Date().getFullYear()} TheCoachAmara. All rights reserved.</div>
            <div className="flex gap-4 text-base text-gray-400">
              <a href="/contact" className="hover:text-yellow-400">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

