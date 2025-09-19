"use client";

// Captures UTM & fbclid params and stores both first-touch and last-touch cookies.
// Lightweight (no dependencies). Call once at app layout mount.
// Cookies used:
//  - ca_utm_first: JSON of first-touch attribution
//  - ca_utm_last: JSON of most recent attribution
//  - ca_click_ids: JSON of ad click identifiers (fbclid, gclid, etc.)
// Only sets first-touch if not already present. Always refreshes last-touch on new params.

const ATTR_FIRST = 'ca_utm_first';
const ATTR_LAST = 'ca_utm_last';
const ATTR_CLICKS = 'ca_click_ids';

function getSearchParams(): Record<string,string> {
  if (typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  const out: Record<string,string> = {};
  url.searchParams.forEach((v,k) => { out[k.toLowerCase()] = v; });
  return out;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split(';').map(c=>c.trim()).find(c=>c.startsWith(name+'='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function writeCookie(name: string, value: string, days = 180) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

function parseJSON<T>(raw: string | null): T | null {
  if (!raw) return null; try { return JSON.parse(raw) as T; } catch { return null; }
}

export interface AttributionSnapshot {
  source?: string; medium?: string; campaign?: string; term?: string; content?: string;
  fbclid?: string; gclid?: string; utm_id?: string; timestamp: string;
  landing_path?: string; referrer?: string; // limited due to client only
}

export function captureAttributionOnce() {
  if (typeof window === 'undefined') return;
  try {
    const params = getSearchParams();
    const hasUtm = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','fbclid','gclid'].some(k=>params[k]);
    if (!hasUtm) return; // nothing to record this page view

    const snapshot: AttributionSnapshot = {
      source: params['utm_source'],
      medium: params['utm_medium'],
      campaign: params['utm_campaign'],
      term: params['utm_term'],
      content: params['utm_content'],
      utm_id: params['utm_id'],
      fbclid: params['fbclid'],
      gclid: params['gclid'],
      timestamp: new Date().toISOString(),
      landing_path: window.location.pathname + window.location.search,
      referrer: document.referrer || undefined
    };

    // First-touch logic
    const existingFirst = parseJSON<AttributionSnapshot>(readCookie(ATTR_FIRST));
    if (!existingFirst) {
      writeCookie(ATTR_FIRST, JSON.stringify(snapshot));
    }
    // Always update last-touch
    writeCookie(ATTR_LAST, JSON.stringify(snapshot));

    // Maintain click ids separately for quick server propagation
    const clicks = parseJSON<Record<string,string>>(readCookie(ATTR_CLICKS)) || {};
    if (snapshot.fbclid) clicks.fbclid = snapshot.fbclid;
    if (snapshot.gclid) clicks.gclid = snapshot.gclid;
    if (snapshot.utm_id) clicks.utm_id = snapshot.utm_id;
    writeCookie(ATTR_CLICKS, JSON.stringify(clicks));
  } catch {}
}

export function readAttributionCookies() {
  return {
    first: parseJSON<AttributionSnapshot>(readCookie(ATTR_FIRST)),
    last: parseJSON<AttributionSnapshot>(readCookie(ATTR_LAST)),
    clicks: parseJSON<Record<string,string>>(readCookie(ATTR_CLICKS))
  };
}
