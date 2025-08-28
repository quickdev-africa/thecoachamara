import React from "react";

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-amber-500">Contact Us</h1>
      <p className="text-lg text-gray-800 mb-6">We'd love to hear from you! For questions, support, or partnership inquiries, please use the form below.</p>
      <form className="flex flex-col gap-4 max-w-md mx-auto mt-8">
        <input type="text" placeholder="Your Name" className="border rounded px-4 py-2" required />
        <input type="email" placeholder="Your Email" className="border rounded px-4 py-2" required />
        <textarea placeholder="Your Message" className="border rounded px-4 py-2 min-h-[100px]" required />
        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2 rounded shadow">Send Message</button>
      </form>
      <div className="mt-8 text-sm text-gray-500">Or email us directly: <a href="mailto:support@thecoachamara.com" className="text-amber-600 underline">support@thecoachamara.com</a></div>
    </main>
  );
}
