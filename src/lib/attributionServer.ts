// Server-side attribution helpers for tests & APIs.
// Mirrors logic used inline in funnel create for extracting attribution cookies.

export interface ParsedAttributionCookies {
  first: any | null;
  last: any | null;
  clicks: Record<string,string> | null;
}

function parseJSON<T>(raw: string | null): T | null { if (!raw) return null; try { return JSON.parse(raw) as T; } catch { return null; } }

export function extractCookieMap(cookieHeader: string): Record<string,string> {
  const out: Record<string,string> = {};
  if (!cookieHeader) return out;
  cookieHeader.split(/;\s*/).forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx);
    const v = pair.slice(idx + 1);
    if (!out[k]) out[k] = decodeURIComponent(v);
  });
  return out;
}

export function parseAttributionFromHeader(cookieHeader: string): ParsedAttributionCookies {
  const map = extractCookieMap(cookieHeader);
  return {
    first: parseJSON(map['ca_utm_first'] || null),
    last: parseJSON(map['ca_utm_last'] || null),
    clicks: parseJSON<Record<string,string>>(map['ca_click_ids'] || null)
  };
}
