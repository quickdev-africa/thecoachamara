import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY not configured' }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { amount, email, metadata } = body;
  if (!amount || !email) {
    return NextResponse.json({ error: 'amount and email are required' }, { status: 400 });
  }

  const payload = {
    email,
    amount: Math.round(Number(amount)), // amount expected in kobo/ng- smallest unit
    metadata: metadata || {},
    callback_url: `${BASE_URL}/api/paystack/hosted/callback`
  };

  try {
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.message || 'Paystack error', details: data }, { status: res.status });

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'request failed' }, { status: 500 });
  }
}
