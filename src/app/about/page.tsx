import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-gray-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">

        {/* Section 1 - Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Meet Coach Amara – Inspiring Health, Healing & Prosperity
            </h1>

            <p className="mt-6 text-xl md:text-2xl text-slate-700 max-w-3xl">
              Coach Amara is a visionary leader from Nigeria making an impact locally and globally. Through the power of Quantum Energy and wellness coaching, she helps people restore balance, build resilience, and create financial freedom.
            </p>

            <div className="mt-8">
              <Link href="/join" className="inline-block bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-4 rounded-full shadow-2xl transform hover:-translate-y-0.5 transition">Join Her Zoom Coaching Sessions</Link>
            </div>
          </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200">
                <Image src="/amara___3.jpg" alt="Coach Amara" width={1000} height={1200} className="w-full h-auto object-cover" priority />
              </div>
            </div>
        </section>

        {/* Section 2 - Her Mission */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-1 lg:order-1 flex justify-center">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200">
              <Image src="/amarawithquantum.jpg" alt="Coach Amara speaking" width={900} height={600} className="w-full h-auto object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7 order-2 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold">Her Mission</h2>
            <p className="mt-4 text-xl text-slate-700 leading-relaxed">
              Coach Amara believes true transformation comes from aligning mind, body, and spirit. She blends Quantum Energy, practical wellness practices, and coaching to empower people with tools for healing, resilience, and sustainable prosperity. Her mission: raise a generation of healthier, empowered, financially resilient individuals globally.
            </p>
          </div>
        </section>

        {/* Section 3 - Testimonial Spotlight */}
        <section className="bg-white shadow-lg rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <h3 className="text-2xl md:text-3xl font-bold">Real Stories. Real Impact.</h3>

            <blockquote className="mt-6 border-l-4 border-amber-300 pl-6 text-slate-700 leading-relaxed text-lg relative">
              “My mother was critically ill and could not lift any part of her body. She could barely talk due to severe pain. I immediately took the Ceramic Tableware, Bracelet, and Quantum Scarf to her. After wrapping her in the scarf, putting the bracelet on, and giving her water from the ‘miracle’ cup, she began to recover. Within 30 minutes she stood up by herself. By the next morning, her swollen feet had gone down completely. Today, she is back on her feet — all pains gone. To the glory of God, she can do things for herself again. I’m so grateful to God for using Double Plus products.”
              <div className="mt-4 font-semibold">— Mrs. Esho, Lagos</div>
              {/* Decorative double-quote replacement for testimonial image */}
              <div className="absolute -right-8 -top-8 text-8xl text-amber-100 opacity-20">“”</div>
            </blockquote>
          </div>
          {/* image removed as requested; decorative quote used above */}
        </section>

        {/* Section 4 - Invitation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-1 lg:order-1 flex justify-center">
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200">
              <Image src="/quantum-energy.jpg" alt="Coach Amara coaching" width={920} height={640} className="w-full h-auto object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7 order-2 lg:order-2">
            <h4 className="text-3xl font-bold">Be Part of the Movement</h4>
            <p className="mt-4 text-lg text-slate-700 leading-relaxed max-w-2xl">
              You don’t have to wait for change — step into it now. Coach Amara hosts periodic Zoom coaching sessions you can subscribe to or book individually. These sessions bring clarity, healing, and practical strategies for lasting prosperity.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link href="/join" className="inline-block bg-amber-400 hover:bg-amber-500 text-black font-semibold px-5 py-3 rounded-lg shadow">Subscribe for Ongoing Access</Link>
              <Link href="/contact" className="inline-block border border-slate-300 text-slate-800 bg-white px-5 py-3 rounded-lg hover:shadow">Book a Single Session</Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

