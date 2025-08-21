"use client";
import React from "react";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 px-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-amber-100 p-8 md:p-16 max-w-xl w-full flex flex-col items-center animate-fadein">
        <span className="font-logo text-amber-600 text-3xl md:text-4xl mb-2" style={{fontWeight: 400, fontFamily: "'Great Vibes', cursive, var(--font-logo)"}}>Coach Amara</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-amber-700 font-playfair mb-4 text-center">Thank You for Joining!</h1>
        <p className="text-lg text-black/80 mb-6 text-center">
          You’re now part of our healing and wellness community.<br />
          Check your email for a welcome message and next steps.<br />
          You’ll also be added to our exclusive WhatsApp group for members.
        </p>
        <a href="/shop" className="w-full px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white text-center mb-2">Explore Our Webstore</a>
        <div className="text-xs text-black/50 mt-6 text-center">Need help? <a href="https://wa.me/2348012345678" target="_blank" rel="noopener" className="underline text-emerald-700 hover:text-emerald-900">Chat with us on WhatsApp</a></div>
      </div>
      <style jsx>{`
        .animate-fadein {
          animation: fadein 0.7s;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </main>
  );
}
