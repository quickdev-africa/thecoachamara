import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabaseClient';
import serverSupabase from '@/lib/serverSupabase';
import { requireAdminApi } from '@/lib/requireAdmin';

// POST /api/orders/notify
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

    // If neither SendGrid nor Resend is configured, allow a simulated notify without requiring admin auth.
    // Use serverSupabase (service role) to fetch the order safely.
    if ((!SENDGRID_API_KEY || !SENDER_EMAIL || !OWNER_EMAIL) && (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !OWNER_EMAIL)) {
      const { orderId } = await req.json();
      if (!orderId) return NextResponse.json({ success: false, error: 'Order ID required' });
      const { data: order, error } = await serverSupabase.from('orders').select('*').eq('id', orderId).maybeSingle();
      if (error || !order) return NextResponse.json({ success: false, error: 'Order not found' });
      console.warn('SendGrid/Resend not configured; notify simulated');
      return NextResponse.json({ success: true, message: 'Notification simulated (no email provider configured)' });
    }

    // Otherwise, require admin auth to call this endpoint
    const auth = await requireAdminApi(req);
    if (auth) return auth;

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ success: false, error: 'Order ID required' });

    // Fetch order and customer info
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (error || !order) return NextResponse.json({ success: false, error: 'Order not found' });

    // Resend (preferred) and SendGrid senders
    const sendWithResend = async (to: string, subject: string, html: string) => {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: [to],
          subject,
          html
        })
      });
      const bodyText = await resp.text().catch(() => null);
      if (!resp.ok) throw new Error(`Resend error: ${resp.status} ${bodyText}`);
      try { return { status: resp.status, ok: resp.ok, body: JSON.parse(bodyText || 'null') }; } catch { return { status: resp.status, ok: resp.ok, body: bodyText }; }
    };

    const sendWithSendGrid = async (to: string, subject: string, html: string) => {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
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
      const text = await res.text().catch(() => null);
      if (!res.ok) throw new Error(`SendGrid error: ${res.status} ${text}`);
      return { status: res.status, ok: res.ok, body: text };
    };

    // Prepare email content
    const customerHtml = `
      <p>Hi ${order.customerName || 'Customer'},</p>
      <p>Thanks for your order <strong>${order.order_number || order.id}</strong>. We received your payment of ₦${Number(order.total).toLocaleString()} and are processing your order.</p>
      <p>If you have questions reply to this email.</p>
      <p>— Coach Amara</p>
    `;

    const ownerHtml = `
      <p>New order received: <strong>${order.order_number || order.id}</strong></p>
      <p>Customer: ${order.customerName} &lt;${order.customerEmail}&gt;</p>
      <p>Total: ₦${Number(order.total).toLocaleString()}</p>
      <p>Order ID: ${order.id}</p>
    `;

    // Attempt to send via Resend first (if configured), otherwise SendGrid. Always attempt owner email too.
    const auditRows: any[] = [];
    try {
      const results = await Promise.all([
        (async () => {
          if (RESEND_API_KEY && RESEND_FROM_EMAIL) {
            const r = await sendWithResend(order.customerEmail, `Order confirmation — ${order.order_number || order.id}`, customerHtml);
            auditRows.push({ recipient: order.customerEmail, provider: 'resend', provider_response: r.body, created_at: new Date().toISOString() });
            return r;
          }
          const r = await sendWithSendGrid(order.customerEmail, `Order confirmation — ${order.order_number || order.id}`, customerHtml);
          auditRows.push({ recipient: order.customerEmail, provider: 'sendgrid', provider_response: r.body, created_at: new Date().toISOString() });
          return r;
        })(),
        (async () => {
          if (RESEND_API_KEY && RESEND_FROM_EMAIL) {
            const r = await sendWithResend(OWNER_EMAIL, `New order received — ${order.order_number || order.id}`, ownerHtml);
            auditRows.push({ recipient: OWNER_EMAIL, provider: 'resend', provider_response: r.body, created_at: new Date().toISOString() });
            return r;
          }
          const r = await sendWithSendGrid(OWNER_EMAIL, `New order received — ${order.order_number || order.id}`, ownerHtml);
          auditRows.push({ recipient: OWNER_EMAIL, provider: 'sendgrid', provider_response: r.body, created_at: new Date().toISOString() });
          return r;
        })()
      ]);

      // Best-effort: persist audit rows into resend_audit table if available
      try {
        if (auditRows.length > 0) {
          await serverSupabase.from('resend_audit').insert(auditRows.map(r => ({ recipient: r.recipient, provider: r.provider, provider_response: r.provider_response, created_at: r.created_at })));
        }
      } catch (ae) {
        console.warn('Failed to persist resend_audit rows', ae);
      }

      return NextResponse.json({ success: true, message: 'Notifications sent' });
    } catch (e: any) {
      console.error('Failed to send notifications, queuing for retry', e?.message || e);
      // enqueue to email_queue for retry
      try {
        await serverSupabase.from('email_queue').insert([
          { to_email: order.customerEmail, subject: `Order confirmation — ${order.order_number || order.id}`, html: { html: customerHtml }, created_at: new Date().toISOString() },
          { to_email: OWNER_EMAIL, subject: `New order received — ${order.order_number || order.id}`, html: { html: ownerHtml }, created_at: new Date().toISOString() }
        ]);
      } catch (qe) {
        console.error('Failed to enqueue email jobs', qe);
      }
      return NextResponse.json({ success: false, error: 'Failed to send notifications; queued for retry' }, { status: 202 });
    }
  } catch (e) {
    console.error('orders.notify error', e);
    return NextResponse.json({ success: false, error: 'Failed to send notification' });
  }
}
