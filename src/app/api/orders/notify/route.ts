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

    // If SendGrid is not configured, allow a simulated notify without requiring admin auth.
    // Use serverSupabase (service role) to fetch the order safely.
    if (!SENDGRID_API_KEY || !SENDER_EMAIL || !OWNER_EMAIL) {
      const { orderId } = await req.json();
      if (!orderId) return NextResponse.json({ success: false, error: 'Order ID required' });
      const { data: order, error } = await serverSupabase.from('orders').select('*').eq('id', orderId).maybeSingle();
      if (error || !order) return NextResponse.json({ success: false, error: 'Order not found' });
      console.warn('SendGrid not configured; notify simulated');
      return NextResponse.json({ success: true, message: 'Notification simulated (SendGrid not configured)' });
    }

    // Otherwise, require admin auth to call this endpoint
    const auth = await requireAdminApi(req);
    if (auth) return auth;

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ success: false, error: 'Order ID required' });

    // Fetch order and customer info
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (error || !order) return NextResponse.json({ success: false, error: 'Order not found' });

    const send = async (to: string, subject: string, html: string) => {
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
      if (!res.ok) throw new Error(`SendGrid error: ${res.status}`);
      return res;
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

    try {
      await Promise.all([
        send(order.customerEmail, `Order confirmation — ${order.order_number || order.id}`, customerHtml),
        send(OWNER_EMAIL, `New order received — ${order.order_number || order.id}`, ownerHtml)
      ]);
      return NextResponse.json({ success: true, message: 'Notifications sent' });
    } catch (e: any) {
      console.error('Failed to send notifications via SendGrid, queuing for retry', e?.message || e);
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
