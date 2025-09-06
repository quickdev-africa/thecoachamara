"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // minimal client-side lead/signups create; server will enrich
      await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, source: 'customer_signup' }),
      });
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Thanks — you're almost done</h1>
        <p className="mb-4">We've received your information. Check your email for next steps.</p>
        <p className="text-sm text-gray-500">If you meant to sign in instead, go to <Link href="/signin" className="text-yellow-400">Sign in</Link>.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sign up</h1>
      <p className="mb-4 text-gray-600">This signup is for customers and visitors. If you already have an account, use the sign in page.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="text-sm font-medium">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 p-2 border rounded bg-black/5" />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 p-2 border rounded bg-black/5" />
        </label>
        <label className="flex flex-col">
          <span className="text-sm font-medium">Phone (optional)</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 p-2 border rounded bg-black/5" />
        </label>
        <button type="submit" disabled={submitting} className="bg-yellow-400 text-black font-semibold py-2 px-4 rounded">
          {submitting ? 'Submitting…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
