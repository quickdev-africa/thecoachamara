import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '../../../../supabaseClient';
import serverSupabase from '@/lib/serverSupabase';
import { ensurePaymentExists } from '@/lib/paymentUtils';

// Paystack webhook secret (set in your environment variables)
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Helper to verify Paystack signature
function verifyPaystackSignature(req: NextRequest, rawBody: Buffer): boolean {
  if (!PAYSTACK_SECRET) {
    console.warn('PAYSTACK_SECRET_KEY not set; cannot verify webhook signature');
    return false;
  }
  const signature = req.headers.get('x-paystack-signature') || '';
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex');
  return signature === hash;
}

export async function POST(req: NextRequest) {
  // Get raw body for signature verification
  const rawBody = await req.arrayBuffer();
  const body = JSON.parse(Buffer.from(rawBody).toString('utf8'));

  // Verify signature in production (requires PAYSTACK_SECRET_KEY set)
  if (process.env.NODE_ENV === 'production') {
    if (!verifyPaystackSignature(req, Buffer.from(rawBody))) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }
  }

  // Handle Paystack event
  const event = body.event;
  const data = body.data;

  if (event === 'charge.success') {
    const { reference, amount, status, customer, metadata } = data;
    try {
      const payment = await ensurePaymentExists(serverSupabase, {
        reference,
        amount: amount / 100,
        status: 'success',
        payment_method: 'paystack',
        email: customer?.email || null,
        metadata
      });
      console.log('Webhook ensured payment', reference, payment?.id);
      // Log event
      try {
        await serverSupabase.from('payment_events').insert({ reference, event_type: 'webhook_charge_success', payload: data, created_at: new Date().toISOString() });
      } catch (e) {}
    } catch (e: any) {
      console.warn('Webhook ensurePaymentExists failed', e?.message || e);
    }

    if (metadata && metadata.order_id) {
      try {
        await serverSupabase.from('orders').update({ paymentStatus: 'paid', status: 'processing', payment_reference: reference, updated_at: new Date().toISOString() }).eq('id', metadata.order_id);
      } catch (e: any) {
        console.warn('Webhook failed to update order', e);
      }
      // Fire admin webhook and trigger notification endpoint for emails (best-effort)
      (async () => {
        try {
          const adminWebhook = process.env.ADMIN_PAYMENT_WEBHOOK_URL;
          if (adminWebhook) await fetch(adminWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'payment_success', reference, orderId: metadata.order_id, data }) });
        } catch (e) {}
        try {
          const notifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/orders/notify`;
          await fetch(notifyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: metadata.order_id }) });
        } catch (e) {}
      })();
    }

    // Fire Meta CAPI Purchase server-side with dedup using reference as event_id
    try {
      const pixelId = process.env.FB_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;
      const token = process.env.FB_CONVERSIONS_API_TOKEN || process.env.META_CAPI_TOKEN;
      if (pixelId && token) {
        const capiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/meta/track`;
        const currency = (data?.currency || 'NGN').toUpperCase();
        const items = Array.isArray(metadata?.items) ? metadata.items : [];
        const content_ids = items.map((it: any) => it.productId || it.product_id).filter(Boolean);
        const contents = items.map((it: any) => ({ id: it.productId || it.product_id, quantity: Number(it.quantity || 1), item_price: Number(it.unitPrice || it.price || 0) })).filter((c: any) => c.id);
        const fbp = metadata?.fbp;
        const fbc = metadata?.fbc;
        const user_data = {
          email: customer?.email,
          phone: metadata?.customerPhone,
          fbp,
          fbc,
        };
        const custom_data = {
          value: amount / 100,
          currency,
          content_ids,
          content_type: 'product',
          contents,
          order_id: metadata?.order_id,
        };
        await fetch(capiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_name: 'Purchase',
            event_source_url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/thank-you-premium?ref=${encodeURIComponent(reference)}`,
            user_data,
            custom_data,
            event_id: reference,
          }),
          cache: 'no-store',
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to send Meta CAPI Purchase from webhook', e);
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
