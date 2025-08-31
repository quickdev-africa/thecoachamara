import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabaseClient';
import { ensurePaymentExists } from '@/lib/paymentUtils';

// Paystack webhook secret (set in your environment variables)
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Helper to verify Paystack signature
function verifyPaystackSignature(req: NextRequest, rawBody: Buffer): boolean {
  const crypto = require('crypto');
  const signature = req.headers.get('x-paystack-signature');
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex');
  return signature === hash;
}

export async function POST(req: NextRequest) {
  // Get raw body for signature verification
  const rawBody = await req.arrayBuffer();
  const body = JSON.parse(Buffer.from(rawBody).toString('utf8'));

  // Optionally verify signature (for production)
  // if (!verifyPaystackSignature(req, Buffer.from(rawBody))) {
  //   return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
  // }

  // Handle Paystack event
  const event = body.event;
  const data = body.data;

  if (event === 'charge.success') {
    const { reference, amount, status, customer, metadata } = data;
    try {
      const payment = await ensurePaymentExists(supabase, {
        reference,
        amount: amount / 100,
        status: 'success',
        payment_method: 'paystack',
        email: customer?.email || null,
        metadata
      });
      console.log('Webhook ensured payment', reference, payment?.id);
    } catch (e: any) {
      console.warn('Webhook ensurePaymentExists failed', e?.message || e);
    }

    if (metadata && metadata.order_id) {
      try {
        await supabase.from('orders').update({ payment_status: 'completed', status: 'confirmed', updated_at: new Date().toISOString() }).eq('id', metadata.order_id);
      } catch (e: any) {
        console.warn('Webhook failed to update order', e);
      }
    }
  }
  // Handle other events (e.g., charge.failed, refund, etc.)
  if (event === 'charge.failed') {
    const { reference, customer, metadata } = data;
    await supabase.from('payments').update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    }).eq('reference', reference);
    if (metadata && metadata.order_id) {
      await supabase.from('orders').update({
        payment_status: 'failed',
        status: 'pending',
        updated_at: new Date().toISOString(),
      }).eq('id', metadata.order_id);
    }
  }
  // Respond quickly to Paystack
  return NextResponse.json({ success: true });
}
