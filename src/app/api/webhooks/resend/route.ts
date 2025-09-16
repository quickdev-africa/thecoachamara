import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET || '';
    const signature = req.headers.get('x-resend-signature') || '';

    // Read raw body for HMAC verification
    const raw = await req.arrayBuffer();
    const rawBuf = Buffer.from(raw);

    // Verify HMAC (Resend uses HMAC-SHA256 with the webhook secret)
    const validSig = (() => {
      if (!secret) return true; // no secret configured => accept (dev)
      try {
        const h = crypto.createHmac('sha256', secret).update(rawBuf);
        const hex = h.digest('hex');
        // Some providers send base64; compute again for base64
        const h2 = crypto.createHmac('sha256', secret).update(rawBuf);
        const b64 = h2.digest('base64');
        // Also accept prefixed formats like "sha256=<sig>"
        const prefixed = `sha256=${hex}`;
        const prefixedB64 = `sha256=${b64}`;
        return (
          signature === hex ||
          signature === b64 ||
          signature === prefixed ||
          signature === prefixedB64 ||
          // Back-compat for manual curl tests that passed the secret directly
          signature === secret
        );
      } catch {
        return false;
      }
    })();

    if (!validSig) {
      return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
    }

    // Parse JSON from raw
    let event: any = {};
    try {
      event = JSON.parse(rawBuf.toString('utf8'));
    } catch {
      event = {};
    }
    // Resend event format example: { type: 'email.sent'|'email.delivered'|'email.bounced'|'email.failed', data: { to: ['x@y.com'], subject, ... } }
    const type = event?.type || 'email.sent';
    const data = event?.data || {};
    const to = Array.isArray(data?.to) ? data.to[0] : (data?.to || '');
    const subject = data?.subject || '';

    const status = type.replace('email.', '');
    await serverSupabase.from('email_deliveries').insert({
      to_email: to,
      subject,
      status,
      provider: 'resend',
      payload: event,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Resend webhook error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
