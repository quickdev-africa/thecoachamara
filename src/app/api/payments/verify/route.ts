import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensurePaymentExists } from '@/lib/paymentUtils';
import { requireAdminApi } from '@/lib/requireAdmin';

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

// helper to generate friendly order numbers (QM-YYYYMMDD-XXXX)
function makeOrderNumber() {
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QM-${datePart}-${suffix}`;
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
  const auth = await requireAdminApi(request);
  if (auth) return auth;
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

    // If already marked success, attempt to ensure a payments row exists and order is updated (idempotent)
    if (attempt?.status === 'success') {
      try {
        console.log('Handling already-successful payment_attempt', { id: attempt.id, payment_reference: attempt.payment_reference, order_id: attempt.order_id });
        // Try to determine the paystack reference from stored paystack_data or provided paystackReference
        const storedRef = attempt?.paystack_data?.reference || attempt?.paystack_reference || null;
        const refToCheck = paystackReference || storedRef || paymentReference;

        try {
          await ensurePaymentExists(supabase, {
            reference: refToCheck,
            order_id: attempt.order_id,
            amount: attempt.amount || 0,
            status: 'completed',
            payment_method: attempt.payment_provider || 'paystack',
            email: attempt.email || null,
            metadata: attempt.paystack_data || null
          });
          console.log('Ensured payment exists for already-successful attempt', refToCheck);
        } catch (e: any) {
          console.warn('ensurePaymentExists failed for already-successful attempt', e?.message || e);
        }

        // Ensure order is updated
        if (attempt.order_id) {
          try {
            await supabase.from('orders').update({ paymentStatus: 'paid', status: 'processing', payment_reference: refToCheck, updated_at: new Date().toISOString() }).eq('id', attempt.order_id);
          } catch (e: any) {
            console.warn('Failed to update order for already-successful attempt', e);
          }

          try {
            await supabase.from('order_status_history').insert({ order_id: attempt.order_id, status: 'paid', changed_at: new Date().toISOString() });
          } catch (e: any) {
            // ignore
          }
        }
      } catch (e: any) {
        console.warn('Error handling already-successful attempt', e);
      }

      return NextResponse.json({ success: true, message: 'Already processed', paymentAttempt: attempt });
    }

    // Determine which reference to verify on Paystack
    const refToVerify = paystackReference || paymentReference;
    let verification: any = null;
    try {
      // Development-only simulation: allow skipping Paystack call when testing locally.
      const requestBody = body as any;
      if (process.env.NODE_ENV === 'development' && requestBody?.simulate === true) {
        console.log('Simulating Paystack verification (development mode)');
        verification = {
          status: true,
          data: {
            domain: 'test.paystack.co',
            amount: (attempt?.amount || 1000) * 100,
            currency: 'NGN',
            status: 'success',
            reference: refToVerify,
            customer: {
              email: attempt?.email || requestBody?.customerEmail || 'test@example.com',
              first_name: (requestBody?.customerName || 'Test').split(' ')[0],
              last_name: ((requestBody?.customerName || 'Test User').split(' ').slice(1).join(' ')) || '' ,
              phone: attempt?.phone || requestBody?.customerPhone || null
            },
            metadata: requestBody?.metadata || { source: 'simulated' }
          }
        } as any;
      } else {
        verification = await verifyWithPaystack(refToVerify);
      }
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

    // If there is no orderId, attempt to auto-create a minimal order from Paystack metadata (idempotent guard)
    let createdOrderId = orderId;
    if (!createdOrderId) {
      try {
        const custEmail = verifiedData.customer?.email || verifiedData.customer_email || verifiedData.metadata?.customerEmail || null;
        const custNameParts = [verifiedData.customer?.first_name, verifiedData.customer?.last_name].filter(Boolean);
        const custName = custNameParts.length ? custNameParts.join(' ') : (verifiedData.metadata?.customerName || null);
        const amountDecimal = (paidAmount || 0) / 100;

        // Pull delivery info from Paystack metadata if provided
        const verifiedDelivery = verifiedData.metadata?.delivery || {};

        const orderPayload: any = {
          order_number: makeOrderNumber(),
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: verifiedData.customer?.phone || verifiedData.metadata?.customerPhone || null,
          subtotal: amountDecimal,
          deliveryFee: 0,
          total: amountDecimal,
          status: 'processing',
          paymentStatus: 'paid',
          // Map delivery fields from Paystack metadata to DB columns as available
          delivery: verifiedDelivery || {},
          delivery_method: verifiedDelivery?.delivery_method || null,
          shipping_address: verifiedDelivery?.shipping_address || null,
          pickup_location: verifiedDelivery?.pickup_location || null,
          shipping_state: verifiedDelivery?.shipping_state || null,
          metadata: {
            source: 'created-from-paystack-verify',
            paystack_reference: refToVerify,
            paystack_raw: verifiedData,
            original_metadata: verifiedData.metadata || {}
          },
          items: verifiedData.metadata?.items ? verifiedData.metadata.items : []
        };

        const insertRes: any = await supabase.from('orders').insert(orderPayload).select().maybeSingle();
        const newOrder = insertRes?.data ?? insertRes;
        const newOrderErr = insertRes?.error ?? null;
        if (!newOrderErr && newOrder) {
          createdOrderId = newOrder.id;
        } else {
          console.warn('Failed to auto-create order from verify:', newOrderErr);
        }
      } catch (e) {
        console.warn('Exception creating order from verify:', e);
      }
    }

    // Ensure payment record exists (idempotent)
    try {
      const payment = await ensurePaymentExists(supabase, {
        reference: refToVerify,
        order_id: createdOrderId,
        amount: (paidAmount || 0) / 100,
        status: 'completed',
        payment_method: 'paystack',
        email: verifiedData.customer?.email || null,
        metadata: verifiedData
      });
      console.log('Ensured payment exists after verify', { reference: refToVerify, paymentId: payment?.id });
      // Log event for observability (best-effort)
      try {
        await supabase.from('payment_events').insert({
          reference: refToVerify,
          event_type: 'verify_success',
          payload: verifiedData,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        // ignore if table doesn't exist or insert fails
      }
    } catch (e: any) {
      console.warn('ensurePaymentExists failed after verify', e?.message || e);
    }

  // Update order and history
  if (createdOrderId) {
      try {
    await supabase.from('orders').update({ paymentStatus: 'paid', status: 'processing', payment_reference: refToVerify, updated_at: new Date().toISOString() }).eq('id', createdOrderId);
      } catch (e: any) {
        console.warn('Failed to update order', e);
      }

      try {
        // Use the createdOrderId (which may be the existing order or a newly-created one)
        await supabase.from('order_status_history').insert({ order_id: createdOrderId || orderId, status: 'paid', changed_at: new Date().toISOString() });
      } catch (e: any) {
        console.warn('Failed to insert order_status_history', e);
      }

      // Notify admin webhook (fire-and-forget)
      (async () => {
        try {
            const webhook = process.env.ADMIN_PAYMENT_WEBHOOK_URL;
            if (webhook) await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'payment_success', reference: refToVerify, orderId: createdOrderId || orderId, verifiedData }) });
        } catch (e) {
          console.warn('Failed to notify admin webhook', e);
        }
      })();

      // Send emails
      try {
        const { data: orderData } = await supabase.from('orders').select('*').eq('id', createdOrderId).maybeSingle();
        if (orderData) await sendOrderEmails(orderData);
      } catch (e) {
        console.warn('Failed to fetch order for email', e);
      }
    }

    return NextResponse.json({ success: true, verification: verifiedData, orderId: createdOrderId });
  } catch (e: any) {
    console.error('payments.verify POST error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (auth) return auth;
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