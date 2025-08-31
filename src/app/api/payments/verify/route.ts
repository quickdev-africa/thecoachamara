import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

async function verifyWithPaystack(reference: string) {
  if (!PAYSTACK_SECRET_KEY) throw new Error('Missing PAYSTACK_SECRET_KEY');
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
  });
  if (!res.ok) throw new Error('Paystack verify failed');
  return res.json();
}

async function sendOrderEmails(order: any) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL;
  const OWNER_EMAIL = process.env.OWNER_EMAIL;

  if (!SENDGRID_API_KEY || !SENDER_EMAIL || !OWNER_EMAIL) {
    // Fallback: call an internal notify endpoint if configured
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/orders/notify`;
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id }) });
    } catch (e) {
      console.warn('Fallback notify failed', e);
    }
    return;
  }

  const send = async (to: string, subject: string, html: string) => {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDER_EMAIL },
        subject,
        content: [{ type: 'text/html', value: html }]
      })
    });
  };

  try {
    const customerHtml = `
      <p>Hi ${order.customerName || 'Customer'},</p>
      <p>Thank you for your order <strong>${order.order_number}</strong>. We received your payment of ${order.total} and are processing your order.</p>
      <p>— Coach Amara</p>
    `;

    const ownerHtml = `
      <p>New order received: <strong>${order.order_number}</strong></p>
      <p>Customer: ${order.customerName} &lt;${order.customerEmail}&gt;</p>
      <p>Total: ${order.total}</p>
      <p>Order ID: ${order.id}</p>
    `;

    await Promise.all([
      send(order.customerEmail, `Order confirmation — ${order.order_number}`, customerHtml),
      send(OWNER_EMAIL, `New order received — ${order.order_number}`, ownerHtml)
    ]);
  } catch (e) {
    console.error('Failed to send emails via SendGrid', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentReference, paystackReference, status } = body || {};

    if (!paymentReference) {
      return NextResponse.json({ success: false, error: 'paymentReference required' }, { status: 400 });
    }

    // Load payment_attempt with order relation if available
    const { data: attempt, error: fetchErr } = await supabase
      .from('payment_attempts')
      .select(`*, orders(*)`)
      .eq('payment_reference', paymentReference)
      .maybeSingle();

    if (fetchErr) console.warn('Failed to fetch payment_attempt', fetchErr);

    // If already marked success, return early (idempotent)
    if (attempt?.status === 'success') {
      return NextResponse.json({ success: true, message: 'Already processed', paymentAttempt: attempt });
    }

    // Determine which reference to verify on Paystack
    const refToVerify = paystackReference || paymentReference;
    let verification: any = null;
    try {
      verification = await verifyWithPaystack(refToVerify);
    } catch (e) {
      console.warn('Paystack verify error', e);
      // If verification fails, mark attempt failed and return
      await supabase.from('payment_attempts').update({ status: 'failed', completed_at: new Date().toISOString() }).eq('payment_reference', paymentReference);
      return NextResponse.json({ success: false, error: 'Failed to verify with Paystack' }, { status: 502 });
    }

    if (!verification || verification.status !== true || !verification.data) {
      await supabase.from('payment_attempts').update({ status: 'failed', completed_at: new Date().toISOString(), paystack_data: verification || null }).eq('payment_reference', paymentReference);
      return NextResponse.json({ success: false, error: 'Payment not successful', verification }, { status: 400 });
    }

    const verifiedData = verification.data;
    const paidAmount = Number(verifiedData.amount || 0);
    const expectedAmount = Math.round((attempt?.amount || (verifiedData.amount || 0) / 100) * 100); // best-effort

    // Paystack returns amount in kobo (integer). attempt.amount is expected in currency units.
    const expectedKobo = attempt ? Math.round((attempt.amount || 0) * 100) : (verifiedData.amount || 0);

    if (paidAmount !== expectedKobo) {
      console.error('Amount mismatch', { paidAmount, expectedKobo });
      await supabase.from('payment_attempts').update({ status: 'failed', completed_at: new Date().toISOString(), paystack_data: verifiedData }).eq('payment_reference', paymentReference);
      return NextResponse.json({ success: false, error: 'Amount mismatch', verification }, { status: 400 });
    }

    // Mark attempt as success
    await supabase.from('payment_attempts').update({ status: 'success', completed_at: new Date().toISOString(), paystack_data: verifiedData }).eq('payment_reference', paymentReference);

    const orderId = attempt?.order_id || verifiedData.metadata?.orderId || null;

    // Ensure payment record exists (idempotent)
    const { data: existingPayment } = await supabase.from('payments').select('*').eq('reference', refToVerify).maybeSingle();
    if (!existingPayment) {
      try {
        await supabase.from('payments').insert({
          order_id: orderId,
          amount: (paidAmount || 0) / 100,
          status: 'completed',
          payment_method: 'paystack',
          reference: refToVerify,
          raw_response: verifiedData,
          created_at: new Date().toISOString()
        });
      } catch (e: any) {
        console.warn('Failed to insert payment row', e);
      }
    }

    // Update order and history
    if (orderId) {
      try {
        await supabase.from('orders').update({ paymentStatus: 'paid', status: 'processing', payment_reference: refToVerify, updated_at: new Date().toISOString() }).eq('id', orderId);
      } catch (e: any) {
        console.warn('Failed to update order', e);
      }

      try {
        await supabase.from('order_status_history').insert({ order_id: orderId, status: 'paid', changed_at: new Date().toISOString() });
      } catch (e: any) {
        // ignore
      }

      // Notify admin webhook (fire-and-forget)
      (async () => {
        try {
          const webhook = process.env.ADMIN_PAYMENT_WEBHOOK_URL;
          if (webhook) await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'payment_success', reference: refToVerify, orderId, verifiedData }) });
        } catch (e) {
          console.warn('Failed to notify admin webhook', e);
        }
      })();

      // Send emails
      try {
        const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
        if (orderData) await sendOrderEmails(orderData);
      } catch (e) {
        console.warn('Failed to fetch order for email', e);
      }
    }

    return NextResponse.json({ success: true, verification: verifiedData, orderId });
  } catch (e: any) {
    console.error('payments.verify POST error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    if (!reference) return NextResponse.json({ success: false, error: 'reference required' }, { status: 400 });
    const verification = await verifyWithPaystack(reference);
    return NextResponse.json({ success: true, verification });
  } catch (e: any) {
    console.error('payments.verify GET error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}