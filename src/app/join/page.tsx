"use client";
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import Image from 'next/image';
import dynamic from "next/dynamic";

const PaystackButton = dynamic(() => import("react-paystack").then(mod => mod.PaystackButton), { ssr: false });

type FormState = {
  name: string;
  phone: string;
  email: string;
  product: string[];
};
type ErrorState = {
  name?: string;
  phone?: string;
  email?: string;
};

// Product options (with images)
const products = [
  { name: "Quantum Boxers", price: "₦49,000", amount: 49000, img: "/boxers.png" },
  { name: "Quantum Pendant", price: "₦29,000", amount: 29000, img: "/pendant.png" },
  { name: "Quantum Water Bottle", price: "₦39,000", amount: 39000, img: "/bottle.png" },
];

export default function JoinPage() {
  // Form state
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    product: [],
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paying, setPaying] = useState(false);

  // Progress bar logic
  const progress = [form.name, form.phone, form.email].filter(Boolean).length + (form.product.length > 0 ? 1 : 0);
  const progressPercent = (progress / 4) * 100;

  // Autofocus first field
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Animate on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Validation logic (inline, live)
  const validate = (field?: string): ErrorState => {
    const errs: ErrorState = { ...errors };
    if (!field || field === "name") {
      if (!form.name) errs.name = "Name is required";
      else delete errs.name;
    }
    if (!field || field === "phone") {
      if (!form.phone) errs.phone = "Phone is required";
      else if (!/^\+?\d{7,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
      else delete errs.phone;
    }
    if (!field || field === "email") {
      if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Valid email required";
      else delete errs.email;
    }
    return errs;
  };

  // Handle input
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => {
        const updated = { ...f, product: checked ? [...f.product, value] : f.product.filter(p => p !== value) };
        setErrors(validate());
        return updated;
      });
    } else {
      setForm(f => {
        const updated = { ...f, [name]: value };
        setErrors(validate(name));
        return updated;
      });
    }
  };

  // Calculate total price
  const getTotal = () => {
    let total = 0;
    for (const p of form.product) {
      const prod = products.find(pr => pr.name === p);
      if (prod) total += prod?.amount || 0;
    }
    return total;
  };
  const amount = getTotal() * 100; // Paystack expects kobo (Naira)
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  const paystackEmail = form.email || "test@example.com";
  const paystackName = form.name;
  const paystackPhone = form.phone;
  const paystackMetadata = {
    custom_fields: [
      { display_name: "Name", variable_name: "name", value: paystackName },
      { display_name: "Phone", variable_name: "phone", value: paystackPhone },
      { display_name: "Products", variable_name: "products", value: form.product.join(", ") },
    ],
  };

  // Order summary
  const selectedProducts = products.filter(p => form.product.includes(p.name));

  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      if (form.product.length > 0) {
        setPaying(true);
      } else {
        setSubmitting(true);
        await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, paid: false }),
        });
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = "/thank-you.html";
          }
        }, 1200);
      }
    }
  };

  const onPaystackSuccess = async (ref: unknown) => {
    setSubmitting(true);
    const reference = typeof ref === 'object' && ref && 'reference' in ref ? (ref as { reference: string }).reference : undefined;
    await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, paid: true, paymentRef: reference }),
    });
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = "/thank-you-premium";
      }
    }, 1200);
  };
  const onPaystackClose = () => {
    setPaying(false);
  };

  return (
    <main className={`min-h-screen bg-white flex flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'} font-sans`}>
      {/* Top Bar with Logo */}
      <div className="w-full flex items-center justify-center px-6 py-4 bg-white border-b border-amber-100">
        <a href="/" className="flex items-center gap-2">
          {/* Stylized logo text */}
          <span className="font-logo text-amber-600 drop-shadow-sm text-2xl md:text-3xl" style={{fontWeight: 400, fontFamily: "'Great Vibes', cursive, var(--font-logo)"}}>Coach Amara</span>
        </a>
      </div>
      {/* Split Layout */}
      <section className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden my-10">
        {/* Form Left */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center sticky top-8 self-start bg-white z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-amber-700 font-playfair drop-shadow text-left animate-fadein">Join Our Community</h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="off">
            {/* Progress Bar inside form */}
            <div className="w-full bg-amber-50 h-2 rounded mb-4">
              <div className="bg-amber-400 h-2 rounded transition-all duration-500" style={{width: `${progressPercent}%`}} />
            </div>
            <div>
              <label className="block font-bold mb-1 font-playfair">Your Name <span className="text-red-500">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${errors.name ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-base text-black font-sans font-bold placeholder:font-normal placeholder:text-gray-400 animate-fadein`}
                required
                placeholder="Enter your name"
                ref={nameRef}
                autoFocus
              />
              {errors.name && <div className="text-red-500 text-xs mt-1 animate-fadein">{errors.name}</div>}
            </div>
            <div>
              <label className="block font-bold mb-1 font-playfair">Phone Number <span className="text-red-500">*</span></label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${errors.phone ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-base text-black font-sans font-bold placeholder:font-normal placeholder:text-gray-400 animate-fadein`}
                placeholder="e.g. +2348012345678"
                required
              />
              {errors.phone && <div className="text-red-500 text-xs mt-1 animate-fadein">{errors.phone}</div>}
            </div>
            <div>
              <label className="block font-bold mb-1 font-playfair">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded border ${errors.email ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-base text-black font-sans font-bold placeholder:font-normal placeholder:text-gray-400 animate-fadein`}
                type="email"
                required
                placeholder="Enter your email"
              />
              {errors.email && <div className="text-red-500 text-xs mt-1 animate-fadein">{errors.email}</div>}
            </div>
            {/* Product Upsell */}
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 mb-2 animate-fadein">
              <div className="font-bold mb-2 text-amber-700 text-sm">YES! I want join to enjoy health and wellness starting with this Product.</div>
              <div className="flex flex-col gap-1 mb-2">
                {products.map(p => (
                  <label key={p.name} className="flex items-center gap-2 cursor-pointer text-black group hover:bg-amber-100 rounded p-1 transition text-sm">
                    <input type="checkbox" name="product" value={p.name} checked={form.product.includes(p.name)} onChange={handleChange} className="accent-amber-500 scale-110" />
                    <Image src={p.img} alt={p.name} width={32} height={32} className="w-8 h-8 rounded shadow border border-amber-100 bg-white" />
                    <span>{p.name} <span className="text-amber-700 font-bold">{p.price}</span></span>
                  </label>
                ))}
              </div>
              {/* Order Summary */}
              {selectedProducts.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-xl p-3 shadow flex flex-col items-center mb-2 animate-fadein">
                  <span className="font-bold text-amber-700 mb-2 text-sm">Order Summary</span>
                  <ul className="text-black/80 text-xs mb-2 w-full">
                    {selectedProducts.map(p => (
                      <li key={p.name} className="flex justify-between items-center border-b border-amber-50 py-1">
                        <span>{p.name}</span>
                        <span className="font-bold">{p.price}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center w-full mt-2">
                    <span className="font-bold text-black text-sm">Total</span>
                    <span className="font-bold text-emerald-600 text-base">₦{getTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}
              {/* Paystack Payment Card - only show if product is selected */}
              {selectedProducts.length > 0 && (
                <div className={`my-2 sticky bottom-4 z-20`}>
                  <div className="bg-white border border-amber-200 rounded-xl p-3 shadow flex flex-col items-center relative">
                    <span className="font-bold text-amber-700 mb-2 flex items-center gap-2 text-xs">Secure Payment <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">100% Safe</span></span>
                    <span className="text-black/80 text-xs mb-2">Pay securely with Paystack</span>
                    <Image src="/secure-payment.png" alt="Secure" width={48} height={24} className="w-12 h-6 mb-2" />
                    {/* Only show PaystackButton as the only button */}
                    {paying ? (
                      <PaystackButton
                        className="w-full px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white disabled:opacity-60 flex items-center justify-center gap-2"
                        email={paystackEmail}
                        amount={amount}
                        currency="NGN"
                        metadata={paystackMetadata}
                        publicKey={paystackKey}
                        text={submitting ? "Processing..." : "Pay and Join Now"}
                        onSuccess={onPaystackSuccess}
                        onClose={onPaystackClose}
                        disabled={submitting}
                      />
                    ) : (
                      <button
                        type="button"
                        className="w-full px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white disabled:opacity-60 flex items-center justify-center gap-2"
                        onClick={() => setPaying(true)}
                        disabled={!paystackKey || Object.keys(errors).length > 0}
                      >
                        {submitting ? <span className="loader" /> : null}
                        {submitting ? "Processing..." : "Pay and Join Now"}
                      </button>
                    )}
                    <span className="text-xs text-black/50 mt-2">You’ll be redirected to Paystack to complete your purchase.</span>
                    <span className="text-xs text-emerald-700 mt-1">Money-back guarantee. No risk, cancel anytime.</span>
                  </div>
                </div>
              )}
              <div className="text-xs text-black/60 mt-2">No pressure! You can join the community without buying anything.</div>
            </div>
            {/* Show default Join Now button only if no product is selected */}
            {selectedProducts.length === 0 && (
              <button type="submit" className="w-full px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white disabled:opacity-60 flex items-center justify-center gap-2" disabled={submitting || Object.keys(errors).length > 0}>
                {submitting ? <span className="loader" /> : null}
                {submitting ? "Joining..." : "Join Now"}
              </button>
            )}
            {success && <div className="text-green-600 font-bold text-center mt-2 animate-fadein">Success! Redirecting...</div>}
            {/* WhatsApp support */}
            <a href="https://wa.me/2348012345678" target="_blank" rel="noopener" className="text-emerald-700 text-xs text-center mt-2 underline hover:text-emerald-900">Need help? Chat with us on WhatsApp</a>
          </form>
        </div>
        {/* Benefits Right */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-start bg-gradient-to-br from-amber-50 via-white to-amber-100 border-l border-amber-100 animate-fadein">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-black font-playfair text-left" style={{marginTop: 0, alignSelf: 'flex-start'}}>Why Join?</h2>
          <div className="text-base md:text-lg font-semibold text-black mb-4 leading-relaxed">
            <ul className="mb-3 flex flex-col gap-3">
              <li className="flex items-start gap-2"><span className="inline-block text-amber-500 mt-1">🔑</span><span><span className="font-bold text-amber-700">Exclusive Healing Resources:</span> Get access to proven tools and guides for your wellness journey.</span></li>
              <li className="flex items-start gap-2"><span className="inline-block text-amber-500 mt-1">🤝</span><span><span className="font-bold text-amber-700">Supportive Community:</span> Connect with like-minded individuals who uplift and inspire.</span></li>
              <li className="flex items-start gap-2"><span className="inline-block text-amber-500 mt-1">✨</span><span><span className="font-bold text-amber-700">Real Results:</span> Experience the benefits of quantum energy products trusted by hundreds.</span></li>
              <li className="flex items-start gap-2"><span className="inline-block text-amber-500 mt-1">🎯</span><span><span className="font-bold text-amber-700">Direct Access to Coach Amara:</span> Receive guidance and support from a dedicated coach and advocate.</span></li>
              <li className="flex items-start gap-2"><span className="inline-block text-amber-500 mt-1">💸</span><span><span className="font-bold text-amber-700">Special Offers:</span> Enjoy member-only discounts and early access to new products.</span></li>
            </ul>
            <div className="mt-2">Unlock your path to healing, energy, and a thriving community. <span className="text-amber-700 font-bold">Complete the form to get started!</span></div>
          </div>
          {/* Testimonials carousel */}
          <div className="bg-white rounded-xl shadow p-4 mt-4 animate-fadein">
            <div className="font-bold text-black mb-2">What Members Say</div>
            <TestimonialCarousel />
          </div>
        </div>
      </section>
      <style jsx>{`
        .loader {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #f59e42;
          border-radius: 50%;
          width: 1em;
          height: 1em;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
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

// Simple testimonials carousel
function TestimonialCarousel() {
  const testimonials = [
    { quote: "Joining changed my life. I feel healthier and more energized every day!", name: "Janet O." },
    { quote: "The Quantum Pendant is a game changer. I sleep better and feel more balanced.", name: "Chinedu A." },
    { quote: "Coach Amara's community is so supportive. I found my tribe!", name: "Blessing K." },
    { quote: "I was skeptical, but the Quantum Boxers really work!", name: "Tunde F." },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);
  return (
    <div className="flex flex-col items-start min-h-[80px]">
      <div className="text-black/80 italic mb-1">“{testimonials[idx].quote}”</div>
      <div className="text-black/60 text-sm">— {testimonials[idx].name}</div>
      <div className="flex gap-1 mt-2">
        {testimonials.map((_, i) => (
          <button key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-amber-500' : 'bg-amber-200'}`} onClick={() => setIdx(i)} aria-label={`Show testimonial ${i+1}`}/>
        ))}
      </div>
    </div>
  );
}
