"use client";
import React, { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

  const payload = { name, email, phone, message, source: 'Maralis Solutions - Contact Page' };
  // default to internal API route that uses Resend if no external endpoint configured
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || '/api/contact';

    try {
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        setSuccess('Thanks — your message was sent. We will respond shortly.');
      } else if (process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID && process.env.NEXT_PUBLIC_EMAILJS_USER_ID) {
        // Try EmailJS REST API to send email directly from client (requires EmailJS account and env vars)
        const service_id = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const template_id = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
        const user_id = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;
        const template_params = {
          from_name: name || 'Website Visitor',
          from_email: email || '',
          phone: phone || '',
          message: message || '',
          to_email: 'admin@thecoachamara.com',
        };

        const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service_id, template_id, user_id, template_params }),
        });
        if (!emailRes.ok) throw new Error(`Email service responded ${emailRes.status}`);
        setSuccess('Thanks — your message was sent. We will respond shortly.');
      } else {
        // No backend endpoint or EmailJS config; instruct admin to configure one instead of opening mail client
        setError('Automatic delivery is not configured. Please set NEXT_PUBLIC_CONTACT_ENDPOINT or EmailJS env vars (NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID, NEXT_PUBLIC_EMAILJS_USER_ID) to enable auto-sending to admin@thecoachamara.com.');
      }

      // clear fields after successful POST or fallback
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to submit. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full min-h-screen bg-white text-black">
      {/* HERO: complementary header for the contact page */}
      <section className="w-full bg-black text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Contact Maralis Solutions</h1>
          <p className="text-lg md:text-xl text-yellow-400 font-semibold mb-6">We're here to help — reach out for support, consults, or partnerships.</p>
          <div className="inline-flex items-center gap-3">
            <a href="#contact-form" className="px-6 py-3 rounded-full bg-yellow-400 text-black font-bold shadow hover:scale-105 transition">Go to form</a>
            <a href="https://wa.me/2347000000000" target="_blank" rel="noreferrer" className="px-4 py-3 rounded-full border-2 border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-500/10 transition">WhatsApp</a>
          </div>
        </div>
      </section>

  <div className="w-full max-w-6xl mx-auto py-12 px-4">
  <div className="w-24 h-1 bg-yellow-400 mb-6 mx-auto" />
        <div className="w-24 h-1 bg-yellow-400 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-start gap-6 text-center md:text-left">
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              What to expect
            </p>
            <p className="text-lg text-gray-900 font-semibold">We aim to respond immediately. Provide as much detail as you can so we can route your request to the right team.</p>

            <div className="bg-black text-white rounded-lg p-6 shadow-lg mt-4">
              <h3 className="font-extrabold text-2xl text-yellow-400 mb-3">How we help</h3>
              <ul className="mt-2 space-y-3 text-lg">
                <li>• General inquiries and program questions</li>
                <li>• Booking consults and assessments</li>
                <li>• Partnership or media requests</li>
              </ul>
            </div>

            <div className="mt-6 text-base md:text-lg text-gray-900">
              <p className="font-bold text-lg">Address</p>
              <address className="not-italic block text-lg">Maralis Solutions, 120 Freedom Way, Lagos, Nigeria</address>
              <p className="mt-2 font-bold text-lg">Phone</p>
              <a href="tel:+2347000000000" className="block text-lg text-yellow-500 font-semibold">+234 700 000 0000</a>

              <div className="mt-4">
                <p className="font-bold text-lg">Follow us</p>
                <div className="flex items-center gap-4 mt-2">
                  <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-yellow-400 hover:opacity-80">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a2.997 2.997 0 00-2.108-2.12C19.666 3.5 12 3.5 12 3.5s-7.666 0-9.39.566A2.997 2.997 0 00.502 6.186C0 8.01 0 12 0 12s0 3.99.502 5.814a2.997 2.997 0 002.108 2.12C4.334 20.5 12 20.5 12 20.5s7.666 0 9.39-.566a2.997 2.997 0 002.108-2.12C24 15.99 24 12 24 12s0-3.99-.502-5.814zM9.75 15.02V8.98L15.75 12l-6 3.02z"/></svg>
                  </a>
                  <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-yellow-400 hover:opacity-80">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 4.9 3.6 9 8.2 9.9v-7H7.9v-2.9h2.3V9.4c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .1 2 .1v2.2h-1.1c-1.1 0-1.4.7-1.4 1.4v1.8h2.4l-.4 2.9h-2v7C18.4 21 22 16.9 22 12z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-yellow-400 hover:opacity-80">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.4-3.9a1.1 1.1 0 11-1.1 1.1 1.1 1.1 0 011.1-1.1z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <form id="contact-form" onSubmit={handleSubmit} className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow mx-auto">
              <label className="block mb-2 text-sm font-bold">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400" />

              <label className="block mb-2 text-sm font-bold">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400" />

              <label className="block mb-2 text-sm font-bold">Phone (optional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400" />

              <label className="block mb-2 text-sm font-bold">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} placeholder="How can we help you?" className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400" />

              {success && <div className="mb-4 text-sm text-green-600">{success}</div>}
              {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

              <button type="submit" disabled={loading} className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold shadow hover:scale-105 transition-transform">
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
