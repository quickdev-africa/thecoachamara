import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';
import { requireAdminApi } from '@/lib/requireAdmin';

// Simple worker endpoint to process pending email_queue items
// POST /api/tasks/process-email-queue
// Processes up to `limit` items (default 10)
export async function POST(req: NextRequest) {
  // Accept either the ADMIN_API_KEY header (worker) or a logged-in admin session
  const adminKey = req.headers.get('x-admin-key') || '';
  if (process.env.ADMIN_API_KEY && adminKey === process.env.ADMIN_API_KEY) {
    // allowed
  } else {
    const auth = await requireAdminApi(req);
    if (auth) return auth;
  }
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Number(body.limit || 10);

    // Find pending items where next_try <= now
    const { data: rows, error: fetchErr } = await serverSupabase
      .from('email_queue')
      .select('*')
      .lte('next_try', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);

    if (fetchErr) {
      console.error('Failed to fetch email_queue rows', fetchErr);
      return NextResponse.json({ success: false, error: 'Failed to fetch queue' }, { status: 500 });
    }

    if (!rows || rows.length === 0) return NextResponse.json({ success: true, processed: 0 });

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
      console.warn('SendGrid not configured; cannot send queued emails');
      return NextResponse.json({ success: false, error: 'SendGrid not configured' }, { status: 400 });
    }

    let processed = 0;
    for (const row of rows) {
      try {
        const htmlContent = typeof row.html === 'object' ? (row.html.html || '') : (row.html || '');
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: row.to_email }] }],
            from: { email: SENDER_EMAIL },
            subject: row.subject,
            content: [{ type: 'text/html', value: htmlContent }]
          })
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`SendGrid ${res.status}: ${text}`);
        }

        // Success -> remove row
        await serverSupabase.from('email_queue').delete().eq('id', row.id);
        processed++;
      } catch (e: any) {
        console.error('Failed to send queued email', row.id, e?.message || e);
        // increment attempts and schedule exponential backoff (attempts^2 minutes)
        try {
          const attempts = (row.attempts || 0) + 1;
          const backoffMinutes = Math.pow(attempts, 2);
          const nextTry = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
          await serverSupabase.from('email_queue').update({ attempts, last_error: String(e?.message || e), next_try: nextTry }).eq('id', row.id);
        } catch (qe) {
          console.error('Failed to update queue row after send failure', qe);
        }
      }
    }

    return NextResponse.json({ success: true, processed });
  } catch (e) {
    console.error('process-email-queue error', e);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
