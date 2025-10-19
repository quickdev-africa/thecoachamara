"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import AddressForm from '@/components/AddressForm';
import { PICKUP_LOCATIONS } from '@/lib/types';
import { useRouter } from 'next/navigation';
import CrispChat from '@/components/CrispChat';

// Product options (with canonical IDs from the products API)
const products = [
  { id: '0cd6d480-66ca-4e3c-9c8c-63a64f7fbb78', name: "Quantum Energy Grapheme Men's underwear", price: "₦98,600.00", amount: 98600, img: 'https://res.cloudinary.com/djucbsrds/image/upload/v1756012379/quantumboxer_le2bm8.jpg' },
  { id: '2bb424e2-fc60-4598-aefa-975b79f579b7', name: "Quantum Energy Polarised Eyeglasses", price: "₦285,600.00", amount: 285600, img: 'https://res.cloudinary.com/djucbsrds/image/upload/v1756013025/sunglasses_jifzgj.jpg' },
  { id: 'c62a94d2-a5f4-4d40-a65e-3a81550a8a6a', name: "Quantum Energy Bracelets", price: "₦299,880.00", amount: 299880, img: 'https://res.cloudinary.com/djucbsrds/image/upload/v1756012522/bracelets_x1i0rv.jpg' },
];

// Nigerian states
const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
  "Yobe", "Zamfara"
];

// Pickup locations are provided centrally from src/lib/types.ts (PICKUP_LOCATIONS)

// Delivery zones mapping
const deliveryZones = {
  "Lagos Zone": { cost: 3000, states: ["Lagos", "Ogun"] },
  "Abuja Zone": { cost: 4000, states: ["FCT", "Niger", "Kaduna", "Nasarawa", "Kogi"] },
  "Other States": { cost: 5000, states: ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kano", "Katsina", "Kebbi", "Kwara", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"] }
};

// Function to get delivery zone for a state
const getDeliveryZone = (state: string) => {
  for (const [zoneName, zoneData] of Object.entries(deliveryZones)) {
    if (zoneData.states.includes(state)) {
      return { name: zoneName, cost: zoneData.cost };
    }
  }
  return null;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  product: string[];
  state: string;
  deliveryMethod: 'pickup' | 'ship' | '';
  pickupLocation: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
  postalCode: string;
  country?: string;
  };
};
type ErrorState = {
  name?: string;
  phone?: string;
  email?: string;
  product?: string;
  state?: string;
  deliveryMethod?: string;
  pickupLocation?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
  postalCode?: string;
  country?: string;
  };
};

export default function JoinPage() {
  // Form state
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    product: [],
    state: "",
    deliveryMethod: "",
    pickupLocation: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
  postalCode: "",
  country: "Nigeria"
    }
  });
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paying, setPaying] = useState(false);

  // Check if delivery information is complete
  const isDeliveryComplete = () => {
    // If no products selected, delivery is not required
    if (form.product.length === 0) return true;
    
    // If products selected but no delivery method chosen, incomplete
    if (!form.deliveryMethod) return false;
    
    if (form.deliveryMethod === 'pickup') {
      return !!form.pickupLocation;
    } else if (form.deliveryMethod === 'ship') {
      return !!(form.shippingAddress.street && form.shippingAddress.city && form.shippingAddress.state);
    }
    return false;
  };

  // Progress bar logic - 5 steps: Name → Phone → Email → Products → Delivery
  const progress = [form.name, form.phone, form.email].filter(Boolean).length + 
    (form.product.length > 0 ? 1 : 0) + 
    (form.product.length > 0 && form.deliveryMethod && isDeliveryComplete() ? 1 : 0);
  const progressPercent = (progress / 5) * 100;

  // Autofocus first field
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nameRef.current?.focus(); }, []);

  // If a name is passed via query param, prefill the form.name
  const searchParams = useSearchParams();
  useEffect(() => {
    const n = searchParams?.get('name');
    if (n) setForm(f => ({ ...f, name: n }));
  }, [searchParams]);

  // Animate on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const router = useRouter();

  // Auto-select pickup location when pickup is chosen and there's only one location
  useEffect(() => {
    if (form.deliveryMethod === 'pickup' && PICKUP_LOCATIONS.length === 1) {
      setForm(f => ({ ...f, pickupLocation: PICKUP_LOCATIONS[0] }));
    }
  }, [form.deliveryMethod]);

  // Phone number validation function
  const isValidPhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters except + at the beginning
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Basic validation rules:
    // - Must be at least 7 digits (local numbers)
    // - Can start with + for international
    // - Can be up to 15 digits total (ITU-T E.164 standard)
    
    // Check for international format (+country code + number)
    if (cleaned.startsWith('+')) {
      const digits = cleaned.slice(1); // Remove the +
      return /^\d{7,14}$/.test(digits); // 7-14 digits after country code
    }
    
    // Check for local/national formats
    return /^\d{7,15}$/.test(cleaned); // 7-15 digits total
  };

  // Validation logic (inline, live)
  const validate = (field?: string): ErrorState => {
    const errs: ErrorState = { ...errors };
    if (!field || field === "name") {
      if (!form.name || form.name.length < 2) errs.name = "Name must be at least 2 characters";
      else delete errs.name;
    }
    if (!field || field === "phone") {
      if (!form.phone) errs.phone = "Phone is required";
      else if (!isValidPhoneNumber(form.phone)) errs.phone = "Enter a valid phone number";
      else delete errs.phone;
    }
    if (!field || field === "email") {
      if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = "Valid email required";
      else delete errs.email;
    }
    if (!field || field === "product") {
      // Don't require products - allow users to join without buying
      delete errs.product;
    }
    if (!field || field === "state") {
      if (form.product.length > 0 && form.deliveryMethod === 'ship' && !form.state) {
        errs.state = "Please select your state for delivery calculation";
      } else {
        delete errs.state;
      }
    }
    if (!field || field === "deliveryMethod") {
      if (form.product.length > 0 && !form.deliveryMethod) errs.deliveryMethod = "Please select pickup or shipping";
      else delete errs.deliveryMethod;
    }
    if (!field || field === "pickupLocation") {
      if (form.product.length > 0 && form.deliveryMethod === 'pickup' && !form.pickupLocation) errs.pickupLocation = "Please select a pickup location";
      else delete errs.pickupLocation;
    }
    if (!field || field === "shippingAddress") {
      if (form.product.length > 0 && form.deliveryMethod === 'ship') {
        const shippingErrors: any = {};
        if (!form.shippingAddress.street) shippingErrors.street = "Street address is required";
        if (!form.shippingAddress.city) shippingErrors.city = "City is required";
        if (!form.shippingAddress.state) shippingErrors.state = "State is required";
  if (!form.shippingAddress.country) shippingErrors.country = "Country is required";
        if (Object.keys(shippingErrors).length > 0) {
          errs.shippingAddress = shippingErrors;
        } else {
          delete errs.shippingAddress;
        }
      } else {
        delete errs.shippingAddress;
      }
    }
    // Clear delivery-related errors when no products selected
    if (form.product.length === 0) {
      delete errs.deliveryMethod;
      delete errs.pickupLocation;
      delete errs.shippingAddress;
      delete errs.state;
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
        // Reset delivery fields if no products selected
        if (updated.product.length === 0) {
          updated.state = "";
          updated.deliveryMethod = "";
          updated.pickupLocation = "";
          updated.shippingAddress = { street: "", city: "", state: "", postalCode: "" };
        }
        return updated;
      });
      // Update errors after state change
      setTimeout(() => setErrors(validate()), 0);
    } else if (name.startsWith('shippingAddress.')) {
      // Handle nested shipping address fields
      const field = name.split('.')[1];
      setForm(f => {
        const updated = { 
          ...f, 
          shippingAddress: { 
            ...f.shippingAddress, 
            [field]: value 
          }
        };
        // Update state field for delivery calculation if state is changed in shipping address
        if (field === 'state') {
          updated.state = value;
        }
        return updated;
      });
      
      // Clear shipping address field errors immediately when values are entered
      if (field && value) {
        setErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors.shippingAddress) {
            const newShippingErrors = { ...newErrors.shippingAddress };
            if (field in newShippingErrors) {
              delete (newShippingErrors as any)[field];
            }
            if (Object.keys(newShippingErrors).length === 0) {
              delete newErrors.shippingAddress;
            } else {
              newErrors.shippingAddress = newShippingErrors;
            }
          }
          return newErrors;
        });
      }
      
      // Update errors after state change
      setTimeout(() => setErrors(validate()), 0);
    } else {
      setForm(f => {
        const updated = { ...f, [name]: value };
        // Reset related fields when delivery method changes
        if (name === 'deliveryMethod') {
          if (value === 'pickup') {
            updated.shippingAddress = { street: "", city: "", state: "", postalCode: "" };
            updated.state = "";
            // Auto-select pickup location if there's only one option
            if (PICKUP_LOCATIONS.length === 1) {
              updated.pickupLocation = PICKUP_LOCATIONS[0];
            }
          } else if (value === 'ship') {
            updated.pickupLocation = "";
          }
        }
        return updated;
      });
      
      // Clear specific field errors immediately when values are selected
      if (name === 'deliveryMethod' && value) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.deliveryMethod;
          return newErrors;
        });
      }
      if (name === 'pickupLocation' && value) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.pickupLocation;
          delete newErrors.state; // Clear state error for pickup
          return newErrors;
        });
      }
      
      // Update errors after state change - especially important for pickupLocation
      setTimeout(() => setErrors(validate()), 0);
    }
  };

  // Calculate total price
  const getProductTotal = () => {
    let total = 0;
    for (const p of form.product) {
      const prod = products.find(pr => pr.name === p);
      if (prod) total += prod?.amount || 0;
    }
    return total;
  };

  // Get delivery cost based on state and method
  const getDeliveryFee = () => {
    if (form.product.length === 0 || form.deliveryMethod === 'pickup') return 0;
    if (form.deliveryMethod === 'ship') {
      const state = form.shippingAddress.state || form.state;
      if (!state) return 0;
      const zone = getDeliveryZone(state);
      return zone ? zone.cost : 0;
    }
    return 0;
  };

  // Calculate total (products + delivery)
  const getTotal = () => {
    return getProductTotal() + getDeliveryFee();
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
      { display_name: "Delivery Method", variable_name: "delivery_method", value: form.deliveryMethod },
      ...(form.deliveryMethod === 'pickup' ? [
        { display_name: "Pickup Location", variable_name: "pickup_location", value: form.pickupLocation }
      ] : []),
      ...(form.deliveryMethod === 'ship' ? [
        { display_name: "Shipping Address", variable_name: "shipping_address", value: `${form.shippingAddress.street}, ${form.shippingAddress.city}, ${form.shippingAddress.state}${form.shippingAddress.postalCode ? ', ' + form.shippingAddress.postalCode : ''}` },
        { display_name: "Delivery Zone", variable_name: "delivery_zone", value: form.shippingAddress.state ? getDeliveryZone(form.shippingAddress.state)?.name || "" : "" },
        { display_name: "Delivery Fee", variable_name: "delivery_fee", value: `₦${getDeliveryFee().toLocaleString()}` }
      ] : []),
      { display_name: "Total Amount", variable_name: "total_amount", value: `₦${getTotal().toLocaleString()}` },
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
        // Capture as a lead so it appears in admin customer lists (user_profiles)
        try {
          await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
          });
        } catch (e) {
          // fallback to original signup endpoint if leads endpoint fails
          try {
            await fetch('/api/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...form, paid: false }),
            });
          } catch (e) {
            // ignore - we'll still redirect
          }
        }
        setSubmitting(false);
        setSuccess(true);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/thank-you';
          }
        }, 1200);
      }
    }
  };

  // Initialize payment via server funnel (creates order + payment_attempt) then open Paystack inline or redirect
  const initFunnelPayment = async () => {
    try {
      setSubmitting(true);
      // Build items array from selectedProducts. Use productName as fallback productId so funnel can create placeholders.
      const items = selectedProducts.map(p => ({
        productId: p.name, // external id / name - funnel/create will create placeholder products when needed
        productName: p.name,
        quantity: 1,
        unitPrice: p.amount,
        total: p.amount,
        price: p.amount,
        images: [p.img]
      }));

      const payload = {
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        items,
        subtotal: items.reduce((s, it) => s + Number(it.total || 0), 0),
        deliveryFee: getDeliveryFee(),
        total: getTotal(),
        delivery: {
          method: form.deliveryMethod,
          shippingAddress: form.shippingAddress,
          pickupLocation: form.pickupLocation,
          state: form.shippingAddress?.state || form.state
        },
        metadata: {
          source: 'join_page'
        }
      };

      const resp = await fetch('/api/funnel/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await resp.json();
      if (!json || !json.success) {
        throw new Error(json?.error || 'Failed to initialize payment');
      }

      const { paystackAuthorizationUrl, paystackReference, orderId } = json;
      // If server returned an authorization url, redirect the user there
      if (paystackAuthorizationUrl) {
        // ensure we mark submitting false after navigation
        window.location.assign(paystackAuthorizationUrl);
        return;
      }

      // Otherwise use Paystack inline with returned reference
      // Ensure Paystack script is loaded
      const ensurePaystackLoaded = async () => {
        if (typeof (window as any).PaystackPop === 'object' && typeof (window as any).PaystackPop.setup === 'function') return (window as any).PaystackPop;
        if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
          const s = document.createElement('script');
          s.src = 'https://js.paystack.co/v1/inline.js';
          s.async = true;
          document.head.appendChild(s);
        }
        let attempts = 0;
        while (attempts < 50) {
          if (typeof (window as any).PaystackPop === 'object' && typeof (window as any).PaystackPop.setup === 'function') {
            return (window as any).PaystackPop;
          }
          await new Promise(resolve => setTimeout(resolve, 150));
          attempts++;
        }
        return null;
      };

      const paystackPop = await ensurePaystackLoaded();
      if (!paystackPop) throw new Error('Payment system not available.');

      const refToUse = paystackReference || json.paymentReference;
      const handler = paystackPop.setup({
        key: paystackKey,
        email: form.email,
        amount: Math.round(getTotal() * 100),
        currency: 'NGN',
        ref: refToUse,
        firstname: form.name.split(' ')[0] || form.name,
        lastname: form.name.split(' ').slice(1).join(' ') || '',
        phone: form.phone,
        metadata: {
          orderId,
          source: 'join_page'
        },
        callback: async (response: any) => {
          try {
            // Let server verify and reconcile payment via public confirm endpoint
            await fetch('/api/payments/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ paymentReference: response.reference, paystackReference: response.reference, status: 'success' })
            });
          } catch (e) {
            // ignore - verification endpoint will be retried via webhook if needed
          }
                  // Call the new public confirm endpoint which performs server-side verify + emails
                  try {
                    await fetch('/api/payments/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentReference: response.reference, paystackReference: response.reference }) });
                  } catch (err) {
                    console.warn('payments.confirm call failed (client)', err);
                  }
                  setSubmitting(false);
                  setSuccess(true);
                  // navigate to thank you with order
                  try { router.push(`/thank-you-premium?order=${orderId}&ref=${response.reference}&amount=${getTotal()}`); } catch (e) { window.location.assign(`/thank-you-premium?order=${orderId}&ref=${response.reference}&amount=${getTotal()}`); }
        },
        onClose: function() {
          setSubmitting(false);
          setPaying(false);
          alert('Payment was cancelled. Your order has been saved and you can complete it later.');
        }
      });
      if (handler) {
        // Prefer the newer open() method (popup/inline). If unavailable try openIframe().
        try {
          if (typeof handler.open === 'function') {
            handler.open();
            return;
          }
          if (typeof handler.openIframe === 'function') {
            try { handler.openIframe(); return; } catch (e) { /* continue to fallback */ }
          }
        } catch (err) {
          // ignore and fallback to hosted
        }

        // Final fallback: ask the server to initialize a hosted Paystack checkout and redirect.
        try {
          const hostedResp = await fetch('/api/paystack/hosted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: Math.round(getTotal() * 100), email: form.email, metadata: { orderId, source: 'join_page' } })
          });
          const hostedJson = await hostedResp.json();
          if (hostedJson && hostedJson.url) {
            window.location.assign(hostedJson.url);
            return;
          }
        } catch (e) {
          // ignore - last resort will show error below
        }
      }

    } catch (e: any) {
      console.error('Payment init error', e);
      setSubmitting(false);
      alert(e?.message || 'Failed to start payment. Please try again.');
    }
  };

  return (
    <>
    <main className={`min-h-screen bg-white flex flex-col transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'} font-sans`}>
  {/* top bar removed — use global SiteHeader in root layout */}
      {/* Split Layout */}
      <section className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto bg-white rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border border-amber-100 overflow-hidden my-0 sm:my-10">
        {/* Form Left */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center sticky top-0 sm:top-8 self-start bg-white z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4 text-amber-700 font-playfair drop-shadow text-left animate-fadein">Join Our Community</h1>
          <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit} autoComplete="off">
            {/* Progress Bar inside form */}
            <div className="w-full bg-amber-50 h-2 sm:h-3 rounded mb-4 sm:mb-5">
              <div className="bg-amber-400 h-2 sm:h-3 rounded transition-all duration-500" style={{width: `${progressPercent}%`}} />
            </div>
            <div>
              <label className="block font-bold mb-2 font-playfair text-sm sm:text-base">Your Name <span className="text-red-500">*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 sm:py-3.5 rounded-lg border ${errors.name ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-sans font-bold placeholder:font-normal placeholder:text-gray-400 animate-fadein`}
                required
                placeholder="Enter your name"
                ref={nameRef}
                autoFocus
              />
              {errors.name && <div className="text-red-500 text-xs mt-1 animate-fadein">{errors.name}</div>}
            </div>
            <div>
              <label className="block font-bold mb-2 font-playfair text-sm sm:text-base">Phone Number <span className="text-red-500">*</span></label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 sm:py-3.5 rounded-lg border ${errors.phone ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-sans font-bold placeholder:font-normal placeholder:text-gray-400 animate-fadein`}
                placeholder="Enter your phone number"
                required
              />
              {errors.phone && <div className="text-red-500 text-xs mt-1 animate-fadein">{errors.phone}</div>}
            </div>
            <div>
              <label className="block font-bold mb-2 font-playfair text-sm sm:text-base">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 sm:py-3.5 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-sans font-bold placeholder:font-normal placeholder:text-gray-400 animate-fadein`}
                type="email"
                required
                placeholder="Enter your email"
              />
              {errors.email && <div className="text-red-500 text-xs mt-1 animate-fadein">{errors.email}</div>}
            </div>
            {/* Product Upsell */}
            <div className="bg-amber-50 rounded-xl p-4 sm:p-5 border border-amber-200 mb-3 animate-fadein">
              {/* Exception: make this banner text white on gold per design */}
              <div className="font-bold mb-3 text-white join-allow-white text-sm sm:text-base">YES! I want join to enjoy health and wellness starting with this Product.</div>
              <div className="flex flex-col gap-2 mb-3">
                {products.map(p => (
                  <label key={p.name} className="flex items-center gap-3 cursor-pointer text-black group hover:bg-amber-100 rounded-lg p-2 transition text-sm sm:text-base">
                    <input type="checkbox" name="product" value={p.name} checked={form.product.includes(p.name)} onChange={handleChange} className="accent-amber-500 scale-110" />
                    <Image src={p.img} alt={p.name} width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9 rounded shadow border border-amber-100 bg-white" />
                    <span className="flex-1">{p.name} <span className="text-black font-bold">{p.price}</span></span>
                  </label>
                ))}
              </div>
              
              {/* Delivery Section - Progressive Disclosure */}
              {form.product.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-xl p-4 sm:p-5 shadow mb-3 animate-fadein">
                  <div className="font-bold text-amber-700 mb-4 text-sm sm:text-base">Delivery</div>
                  
                  {/* Delivery Method Selection */}
                  <div className="mb-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm sm:text-base">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                          checked={form.deliveryMethod === 'pickup'}
                          onChange={handleChange}
                          className="accent-amber-500"
                        />
                        <span className="font-bold text-black">Pick up</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm sm:text-base">
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="ship"
                          checked={form.deliveryMethod === 'ship'}
                          onChange={handleChange}
                          className="accent-amber-500"
                        />
                        <span className="font-bold text-black">Ship it</span>
                      </label>
                    </div>
                    {errors.deliveryMethod && <div className="text-red-500 text-xs mt-1">{errors.deliveryMethod}</div>}
                  </div>

                  {/* State Selection - Only show when shipping */}
                  {form.deliveryMethod === 'ship' && (
                    <AddressForm title="Shipping Address" values={form.shippingAddress} errors={errors.shippingAddress || {}} onChange={(name: string, value: string) => {
                      // name will be like 'shippingAddress.street' so we map into form.shippingAddress
                      const parts = name.split('.');
                      if (parts.length === 2 && parts[0] === 'shippingAddress') {
                        const key = parts[1];
                        setForm(f => ({ ...f, shippingAddress: { ...f.shippingAddress, [key]: value } , state: key === 'state' ? value : f.state }));
                      }
                      setErrors(validate());
                    }} />
                  )}

                  {/* Delivery Zone Info - Only show when shipping and state selected */}
                  {form.deliveryMethod === 'ship' && form.shippingAddress.state && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <span className="font-bold text-green-700">
                        Delivery Zone: {getDeliveryZone(form.shippingAddress.state)?.name} - ₦{getDeliveryZone(form.shippingAddress.state)?.cost.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Pickup Location - always rendered but disabled until 'Pick up' is chosen */}
                  <div className="mb-4">
                    <label className="block font-bold mb-2 text-sm text-black">Select Pickup Location <span className="text-red-500">*</span></label>
                    <select
                      name="pickupLocation"
                      value={form.pickupLocation || (PICKUP_LOCATIONS.length === 1 ? PICKUP_LOCATIONS[0] : '')}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.pickupLocation ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base text-black font-bold`}
                      required={form.deliveryMethod === 'pickup'}
                      disabled={form.deliveryMethod !== 'pickup'}
                    >
                      {PICKUP_LOCATIONS.length > 1 ? (
                        <option value="">Choose pickup location</option>
                      ) : null}
                      {PICKUP_LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    {errors.pickupLocation && <div className="text-red-500 text-xs mt-1">{errors.pickupLocation}</div>}
                    {form.deliveryMethod !== 'pickup' && <div className="text-xs text-gray-500 mt-1">Select "Pick up" above to choose a pickup location.</div>}
                  </div>

                  {/* Pickup Confirmation - Only show when pickup location is selected */}
                  {form.deliveryMethod === 'pickup' && form.pickupLocation && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <span className="font-bold text-green-700">
                        ✓ Pickup Location: {form.pickupLocation} - Free Pickup
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Order Summary */}
              {selectedProducts.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-xl p-4 sm:p-5 shadow flex flex-col items-center mb-3 animate-fadein">
                  <span className="font-bold text-amber-700 mb-3 text-sm sm:text-base">Order Summary</span>
                  <ul className="text-black/80 text-sm mb-3 w-full">
                    {selectedProducts.map(p => (
                      <li key={p.name} className="flex justify-between items-center border-b border-amber-50 py-2">
                        <span className="text-sm sm:text-base">{p.name}</span>
                        <span className="font-bold text-sm sm:text-base">{p.price}</span>
                      </li>
                    ))}
                    {getDeliveryFee() > 0 && (
                      <li className="flex justify-between items-center border-b border-amber-50 py-2">
                        <span className="text-blue-600 text-sm">Delivery Fee ({getDeliveryZone(form.shippingAddress.state || form.state)?.name})</span>
                        <span className="font-bold text-blue-600 text-sm sm:text-base">₦{getDeliveryFee().toLocaleString()}</span>
                      </li>
                    )}
                  </ul>
                  <div className="flex justify-between items-center w-full mt-3">
                    <span className="font-bold text-black text-sm sm:text-base">Total</span>
                    <span className="font-bold text-emerald-600 text-base sm:text-lg">₦{getTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}
              {/* Paystack Payment Card - only show if product is selected */}
              {selectedProducts.length > 0 && (
                <div className={`my-3 sticky bottom-3 sm:bottom-4 z-20`}>
                  <div className="bg-white border border-amber-200 rounded-xl p-4 sm:p-5 shadow flex flex-col items-center relative">
                    <span className="font-bold text-amber-700 mb-3 flex items-center gap-2 text-sm sm:text-base">Secure Payment <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full">100% Safe</span></span>
                    <span className="text-black/80 text-sm mb-3">Pay securely with Paystack</span>
                    <Image src="/secure-payment.png" alt="Secure" width={48} height={24} className="w-12 h-6 sm:w-14 sm:h-7 mb-3" />
                    {/* Use server-side funnel create then Paystack inline/redirect */}
                    <button
                      type="button"
                      className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white disabled:opacity-60 flex items-center justify-center gap-2"
                      onClick={async () => { setPaying(true); await initFunnelPayment(); setPaying(false); }}
                      disabled={submitting || !paystackKey || Object.keys(errors).length > 0 || !isDeliveryComplete()}
                    >
                      {submitting ? <span className="loader" /> : null}
                      {submitting ? "Processing..." : "Pay and Join Now"}
                    </button>
                    <span className="text-xs text-black/50 mt-2">You’ll be redirected to Paystack to complete your purchase.</span>
                    <span className="text-xs text-emerald-700 mt-1">Money-back guarantee. No risk, cancel anytime.</span>
                  </div>
                </div>
              )}
              <div className="text-xs text-black/60 mt-2">No pressure! You can join the community without buying anything.</div>
            </div>
            {/* Show default Join Now button only if no product is selected */}
            {selectedProducts.length === 0 && (
              <button type="submit" className="w-full px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200 text-white disabled:opacity-60 flex items-center justify-center gap-2" disabled={submitting || !form.name || !form.phone || !form.email || !isValidPhoneNumber(form.phone) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)}>
                {submitting ? <span className="loader" /> : null}
                {submitting ? "Joining..." : "Join Now"}
              </button>
            )}
            {success && <div className="text-green-600 font-bold text-center mt-2 animate-fadein">Success! Redirecting...</div>}
            {/* WhatsApp support */}
            <a href="https://wa.me/2349127768471" target="_blank" rel="noopener" className="text-emerald-700 text-xs text-center mt-2 underline hover:text-emerald-900">Need help? Chat with us on WhatsApp</a>
          </form>
        </div>
        {/* Benefits Right */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-start bg-gradient-to-br from-amber-50 via-white to-amber-100 border-l border-amber-100 animate-fadein">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-black font-playfair text-left" style={{marginTop: 0, alignSelf: 'flex-start'}}>Why Join?</h2>
          <div className="text-base md:text-lg font-semibold text-black mb-4 leading-relaxed join-yellow-shadow">
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
    <CrispChat positionRight={true} themeColor="#25D366" />
    </>
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
