import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';
import { ensurePaymentExists } from '@/lib/paymentUtils';

const supabase = serverSupabase;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

async function verifyWithPaystack(reference: string) {
  if (!PAYSTACK_SECRET_KEY) throw new Error('Missing PAYSTACK_SECRET_KEY');
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
  });
  if (!res.ok) throw new Error('Paystack verify failed');
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { paymentReference, paystackReference } = body as any;
    const refToVerify = paystackReference || paymentReference;
    if (!refToVerify) return NextResponse.json({ success: false, error: 'payment reference required' }, { status: 400 });

    // Development-only: allow simulated verification when simulate=true and a valid smoke token is provided.
    const requestBody = body as any;
    const isDevSimulateRequested = process.env.NODE_ENV === 'development' && requestBody?.simulate === true;
    if (isDevSimulateRequested) {
      const providedToken = req.headers.get('x-smoke-test-token') || '';
      const expectedToken = process.env.SMOKE_TEST_TOKEN || '';
      if (!expectedToken || providedToken !== expectedToken) {
        return NextResponse.json({ success: false, error: 'Invalid or missing smoke test token' }, { status: 401 });
      }
    }

    // Load payment_attempt with order relation if available
    const { data: attempt } = await supabase.from('payment_attempts').select(`*, orders(*)`).eq('payment_reference', paymentReference).maybeSingle();

    // Verify with Paystack (or simulate in development)
    let verification: any = null;
    try {
      if (isDevSimulateRequested) {
        console.log('Simulating Paystack verification (confirm) for', refToVerify);
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
              last_name: ((requestBody?.customerName || 'Test User').split(' ').slice(1).join(' ')) || '',
              phone: attempt?.phone || requestBody?.customerPhone || null
            },
            metadata: requestBody?.metadata || { source: 'simulated' }
          }
        } as any;
      } else {
        verification = await verifyWithPaystack(refToVerify);
      }
    } catch (e) {
      console.warn('Paystack verify error (confirm)', e);
      await supabase.from('payment_attempts').update({ status: 'failed', completed_at: new Date().toISOString() }).eq('payment_reference', paymentReference);
      return NextResponse.json({ success: false, error: 'Failed to verify with Paystack' }, { status: 502 });
    }

    if (!verification || verification.status !== true || !verification.data) {
      await supabase.from('payment_attempts').update({ status: 'failed', completed_at: new Date().toISOString(), paystack_data: verification || null }).eq('payment_reference', paymentReference);
      return NextResponse.json({ success: false, error: 'Payment not successful', verification }, { status: 400 });
    }

    const verifiedData = verification.data;
    const paidAmount = Number(verifiedData.amount || 0);
    const expectedKobo = attempt ? Math.round((attempt.amount || 0) * 100) : (verifiedData.amount || 0);

    if (paidAmount !== expectedKobo) {
      console.error('Amount mismatch (confirm)', { paidAmount, expectedKobo });
      await supabase.from('payment_attempts').update({ status: 'failed', completed_at: new Date().toISOString(), paystack_data: verifiedData }).eq('payment_reference', paymentReference);
      return NextResponse.json({ success: false, error: 'Amount mismatch', verification }, { status: 400 });
    }

    // Mark attempt as success
    await supabase.from('payment_attempts').update({ status: 'success', completed_at: new Date().toISOString(), paystack_data: verifiedData }).eq('payment_reference', paymentReference);

    let createdOrderId = attempt?.order_id || verifiedData.metadata?.orderId || null;

    // Auto-create minimal order if missing (best-effort)
    if (!createdOrderId) {
      try {
        const custEmail = verifiedData.customer?.email || verifiedData.customer_email || verifiedData.metadata?.customerEmail || null;
        const custNameParts = [verifiedData.customer?.first_name, verifiedData.customer?.last_name].filter(Boolean);
        const custName = custNameParts.length ? custNameParts.join(' ') : (verifiedData.metadata?.customerName || null);
        const amountDecimal = (paidAmount || 0) / 100;
        const orderPayload: any = {
          order_number: `QM-${Date.now()}`,
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: verifiedData.customer?.phone || verifiedData.metadata?.customerPhone || null,
          subtotal: amountDecimal,
          deliveryFee: 0,
          total: amountDecimal,
          status: 'processing',
          paymentStatus: 'paid',
          delivery: verifiedData.metadata?.delivery || {},
          metadata: { source: 'created-from-paystack-confirm', paystack_reference: refToVerify, paystack_raw: verifiedData }
        };
        const insertRes: any = await supabase.from('orders').insert(orderPayload).select().maybeSingle();
        const newOrder = insertRes?.data ?? insertRes;
        if (newOrder && !insertRes?.error) createdOrderId = newOrder.id;
      } catch (e) { console.warn('Exception creating order (confirm)', e); }
    }

    // Ensure payment record exists
    try {
      await ensurePaymentExists(supabase, {
        reference: refToVerify,
        order_id: createdOrderId,
        amount: (paidAmount || 0) / 100,
        status: 'completed',
        payment_method: 'paystack',
        email: verifiedData.customer?.email || null,
        metadata: verifiedData
      });
    } catch (e: any) {
      console.warn('ensurePaymentExists failed (confirm)', e?.message || e);
    }

    // Update order rows and history
    if (createdOrderId) {
      try { await supabase.from('orders').update({ paymentStatus: 'paid', status: 'processing', payment_reference: refToVerify, updated_at: new Date().toISOString() }).eq('id', createdOrderId); } catch (e) { console.warn('Failed to update order (confirm)', e); }
      try { await supabase.from('order_status_history').insert({ order_id: createdOrderId, status: 'paid', changed_at: new Date().toISOString() }); } catch (e) {}

      // Trigger notify endpoint (server-to-server) to send emails; include ADMIN_API_KEY if present
      (async () => {
        try {
          const notifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/orders/notify`;
          const headers: any = { 'Content-Type': 'application/json' };
          if (process.env.ADMIN_API_KEY) headers['x-admin-key'] = process.env.ADMIN_API_KEY;
          await fetch(notifyUrl, { method: 'POST', headers, body: JSON.stringify({ orderId: createdOrderId }) });
        } catch (e) { console.warn('Failed to call orders/notify (confirm)', e); }
      })();
    }

    return NextResponse.json({ success: true, verification: verifiedData, orderId: createdOrderId });
  } catch (e: any) {
    console.error('payments.confirm POST error', e);
    return NextResponse.json({ success: false, error: e?.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'payments.confirm ready' });
}
