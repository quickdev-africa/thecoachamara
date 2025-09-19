const assert = require('assert');

// Deterministic in-memory cookie store to emulate browser behaviour relevant to our capture logic.
const cookieStore = {};
function setCookie(k, v) { cookieStore[k] = v; }
function hasCookie(k) { return Object.prototype.hasOwnProperty.call(cookieStore, k); }
function getCookie(k) { return cookieStore[k]; }

function simulateCapture(url, referrer) {
  const u = new URL(url);
  const params = u.searchParams;
  const hasUtm = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','fbclid','gclid'].some(k=>params.get(k));
  if (!hasUtm) return;
  const snapshot = {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    fbclid: params.get('fbclid') || undefined,
    gclid: params.get('gclid') || undefined,
    timestamp: 'X',
    landing_path: u.pathname + u.search,
    referrer
  };
  if (!hasCookie('ca_utm_first')) setCookie('ca_utm_first', encodeURIComponent(JSON.stringify(snapshot)));
  setCookie('ca_utm_last', encodeURIComponent(JSON.stringify(snapshot)));
}

function readCookieDecoded(name) {
  const raw = getCookie(name);
  return raw ? JSON.parse(decodeURIComponent(raw)) : null;
}

function run() {
  simulateCapture('https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=launch&fbclid=FB1', '');
  const first = readCookieDecoded('ca_utm_first');
  assert.equal(first.source, 'google');
  simulateCapture('https://example.com/?utm_source=facebook&utm_medium=paid&utm_campaign=retarget', 'https://example.com/prev');
  const firstAfter = readCookieDecoded('ca_utm_first');
  const lastAfter = readCookieDecoded('ca_utm_last');
  assert.equal(firstAfter.source, 'google');
  assert.equal(lastAfter.source, 'facebook');
  console.log('attribution.client.test OK');
}

if (require.main === module) run();
module.exports = run;
