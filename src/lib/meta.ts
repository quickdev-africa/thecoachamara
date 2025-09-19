"use client";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
}

function getQueryParam(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const url = new URL(window.location.href);
  return url.searchParams.get(name) || undefined;
}

function deriveFbc(): string | undefined {
  const existing = getCookie('_fbc');
  if (existing) return existing;
  const fbclid = getQueryParam('fbclid');
  if (!fbclid) return undefined;
  const ts = Math.floor(Date.now() / 1000);
  return `fb.1.${ts}.${fbclid}`;
}

function uuid(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return 'evt_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Basic consent check (analytics flag) using existing cookie schema from consent.ts.
function hasConsent(): boolean {
  try {
    const raw = getCookie('cookie_consent');
    if (!raw) return true; // default allow if banner not used
    const obj = JSON.parse(raw);
    if (obj && typeof obj.analytics === 'boolean') return !!obj.analytics;
  } catch {}
  return true;
}

// Normalize custom_data across events.
function buildCustomData(event: string, params: Record<string, any>, base: { value?: any; currency?: any; content_ids?: any; content_type?: any; contents?: any; order_id?: any }) {
  const cd: any = { ...base };
  if (!cd.currency) cd.currency = 'NGN';
  // Ensure arrays where required
  if (cd.content_ids && !Array.isArray(cd.content_ids)) cd.content_ids = [cd.content_ids];
  if (!cd.content_type && cd.content_ids) cd.content_type = 'product';
  // Map some funnel-specific aliases
  if (params.orderId && !cd.order_id) cd.order_id = params.orderId;
  if (params.order_id && !cd.order_id) cd.order_id = params.order_id;
  return cd;
}

export function trackMeta(event: string, params: Record<string, any> = {}) {
  // Respect consent (only blocks client pixel + client->CAPI; server events still go through)
  if (!hasConsent()) return;
  const fbp = getCookie('_fbp');
  const fbc = deriveFbc();
  const event_id = (params as any).event_id || (params as any).eventId || uuid();
  const enableCapi = (process.env.NEXT_PUBLIC_ENABLE_CAPI || '').toLowerCase() === 'true';

  // Fire Pixel (browser)
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      const pixelParams = { ...params };
      // For deduplication, pass eventID in fbq options
      // @ts-ignore
      if (event_id) window.fbq('track', event, pixelParams, { eventID: event_id });
      else window.fbq('track', event, pixelParams);
    }
  } catch {}

  if (enableCapi) {
    try {
      const { email, phone, first_name, last_name, value, currency, content_ids, content_type, contents, order_id, external_id, state, country, zip } = params || {};
      const url = typeof window !== 'undefined' ? window.location.href : undefined;
      const user_data: any = { email, phone, first_name, last_name, fbp, fbc };
      if (external_id) user_data.external_id = external_id; // hashed server-side
      if (state) user_data.st = state;
      if (country) user_data.country = country;
      if (zip) user_data.zp = zip;
      const custom_data = buildCustomData(event, params, { value, currency, content_ids, content_type, contents, order_id });
      fetch('/api/meta/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: event,
          event_source_url: url,
          user_data,
          custom_data,
          event_id,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
}
