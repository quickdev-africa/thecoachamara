// Server-side attribution helpers for tests & APIs (CommonJS friendly)
function parseJSON(raw) { if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } }
function extractCookieMap(cookieHeader) {
  const out = {};
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
function parseAttributionFromHeader(cookieHeader) {
  const map = extractCookieMap(cookieHeader);
  return {
    first: parseJSON(map['ca_utm_first'] || null),
    last: parseJSON(map['ca_utm_last'] || null),
    clicks: parseJSON(map['ca_click_ids'] || null)
  };
}
module.exports = { parseAttributionFromHeader, extractCookieMap };
