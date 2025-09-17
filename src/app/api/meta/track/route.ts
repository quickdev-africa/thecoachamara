import { NextRequest, NextResponse } from 'next/server';
import nodeCrypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, event_time, event_source_url, user_data = {}, custom_data = {}, event_id } = body || {};

    const pixelId = process.env.FB_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const accessToken = process.env.FB_CONVERSIONS_API_TOKEN || process.env.META_CAPI_TOKEN;
    if (!pixelId || !accessToken) {
      return NextResponse.json({ success: false, error: 'Meta CAPI not configured' }, { status: 400 });
    }

    // Hash PII for CAPI
    const hash = (v?: string) => (v ? nodeCrypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : undefined);
    const digits = (v?: string) => (v ? v.replace(/\D+/g, '') : undefined);
    const clientUserAgent = req.headers.get('user-agent') || undefined;
    const clientIp = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || undefined;

    const normalizedUserData: any = {
      em: user_data.em || (user_data.email ? [hash(user_data.email)] : undefined),
      ph: user_data.ph || (user_data.phone ? [hash(digits(user_data.phone))] : undefined),
      fn: user_data.fn || (user_data.first_name ? [hash(user_data.first_name)] : undefined),
      ln: user_data.ln || (user_data.last_name ? [hash(user_data.last_name)] : undefined),
      client_user_agent: user_data.client_user_agent || clientUserAgent,
      client_ip_address: user_data.client_ip_address || clientIp,
      fbp: user_data.fbp,
      fbc: user_data.fbc,
    };

    const payload = {
      data: [
        {
          event_name: event_name || 'CustomEvent',
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_source_url: event_source_url,
          action_source: 'website',
          event_id,
          user_data: normalizedUserData,
          custom_data,
        },
      ],
    };

    const res = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ success: false, error: data }, { status: res.status });
    }
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
