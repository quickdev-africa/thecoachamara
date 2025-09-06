import { NextResponse } from 'next/server';
import { addSubmission } from './store';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, phone, message } = data || {};

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@thecoachamara.com';
    const CONTACT_DEBUG = process.env.CONTACT_DEBUG === 'true';

    // If no API key is configured allow a debug mode so you can test from the browser
    if (!RESEND_API_KEY) {
      if (CONTACT_DEBUG) {
        // Store the submission in-memory for debug inspection and return success
        try {
          addSubmission({ name, email, phone, message });
        } catch (e) {
          console.warn('failed to add debug submission', e);
        }
        console.log('CONTACT_DEBUG active — contact payload saved for debug:', { name, email, phone, message });
        return NextResponse.json({ ok: true, debug: true, note: 'CONTACT_DEBUG active — email not sent' });
      }

      return NextResponse.json({ error: 'RESEND_API_KEY not configured on server' }, { status: 500 });
    }

    const subject = `Website contact from ${name || 'visitor'}`;
    const html = `
      <h2>New contact submission</h2>
      <p><strong>Name:</strong> ${name || '(not provided)'}</p>
      <p><strong>Email:</strong> ${email || '(not provided)'}</p>
      <p><strong>Phone:</strong> ${phone || '(not provided)'}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${(message || '').replace(/\n/g, '<br/>')}</p>
      <hr />
      <p style="font-size:12px;color:#666">Source: Maralis Solutions - Contact Page</p>
    `;

    const payload = {
      from: 'no-reply@thecoachamara.com',
      to: ADMIN_EMAIL,
      subject,
      html,
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Resend error: ${res.status} ${text}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('contact POST error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
