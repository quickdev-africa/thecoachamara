import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const reference = url.searchParams.get('reference') || url.searchParams.get('trxref') || url.searchParams.get('ref');

  if (!reference) {
    // Redirect to a generic thank-you with error
    return NextResponse.redirect(`${BASE_URL}/thank-you?status=missing_ref`);
  }

  if (!PAYSTACK_SECRET) {
    return NextResponse.redirect(`${BASE_URL}/thank-you?status=missing_secret`);
  }

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    const data = await res.json();
    if (res.ok && data && data.data && (data.data.status === 'success' || data.data.status === 'paid')) {
      // Successful payment - attempt to auto-reconcile via internal verify endpoint
      try {
        // Call internal verify to create/ensure payment/order rows
        await fetch(`${BASE_URL}/api/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentReference: reference, paystackReference: reference, status: 'success' })
        });
      } catch (e) {
        // ignore - proceed to send emails and redirect anyway
      }

      // Send emails via Resend (customer + owner) if RESEND_API_KEY present
      try {
        const RESEND_KEY = process.env.RESEND_API_KEY;
        if (RESEND_KEY) {
          const customerEmail = data.data.customer && data.data.customer.email ? data.data.customer.email : url.searchParams.get('email') || '';
          const amount = data.data.amount ? (Number(data.data.amount) / 100).toFixed(2) : '';
          const emailHtml = `<p>Hi,</p><p>Thank you for your payment. Reference: <strong>${reference}</strong></p><p>Amount: ₦${amount}</p><p>We have received your payment and your order is being processed.</p>`;
          const ownerHtml = `<p>New payment received.</p><p>Reference: <strong>${reference}</strong></p><p>Amount: ₦${amount}</p><pre>${JSON.stringify(data.data, null, 2)}</pre>`;

          const send = async (to: string, subject: string, html: string) => {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${RESEND_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || 'no-reply@yourdomain.com',
                to: [to],
                subject,
                html
              })
            });
          };

          if (customerEmail) {
            send(customerEmail, 'Your payment was successful', emailHtml).catch(() => {});
          }
          const owner = process.env.STORE_OWNER_EMAIL;
          if (owner) {
            send(owner, `New payment received: ${reference}`, ownerHtml).catch(() => {});
          }
        }
      } catch (e) {
        // ignore email errors
      }

      // Redirect to premium thank you and include ref
      return NextResponse.redirect(`${BASE_URL}/thank-you-premium?ref=${encodeURIComponent(reference)}`);
    }
    // verification failed or not successful
    return NextResponse.redirect(`${BASE_URL}/thank-you?status=failed&ref=${encodeURIComponent(reference)}`);
  } catch (e: any) {
    return NextResponse.redirect(`${BASE_URL}/thank-you?status=error&msg=${encodeURIComponent(e?.message || 'unknown')}`);
  }
}
