import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabaseClient';

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
    // Update payment record in Supabase
    const { reference, amount, status, customer, metadata } = data;
    // Find payment by reference
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single();
    if (fetchError || !payment) {
      // Optionally create payment if not found
      await supabase.from('payments').insert({
        reference,
        email: customer.email,
        amount: amount / 100, // Paystack sends kobo
        status: 'success',
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else {
      // Update payment status
      await supabase.from('payments').update({
        status: 'success',
        updated_at: new Date().toISOString(),
      }).eq('reference', reference);
    }
    // Optionally update order status if you store order_id in metadata
    if (metadata && metadata.order_id) {
      await supabase.from('orders').update({
        payment_status: 'completed',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      }).eq('id', metadata.order_id);
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
