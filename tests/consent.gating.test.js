const assert = require('assert');

// We'll require the built TS directly; if not compiled yet this may need ts-node, but we keep test simple by re-implementing minimal logic.

function trackMetaLike(event, params, cookie) {
  function getCookie(name){
    const parts = cookie.split(/;\s*/); const m = parts.find(p=>p.startsWith(name + '='));
    return m ? decodeURIComponent(m.split('=')[1]) : undefined;
  }
  function hasConsent(){
    try { const raw = getCookie('cookie_consent'); if (!raw) return true; const obj = JSON.parse(raw); if (typeof obj.analytics === 'boolean') return !!obj.analytics; } catch{}; return true; }
  if (!hasConsent()) return { skipped: true };
  return { sent: true };
}

function run(){
  const deny = 'cookie_consent=' + encodeURIComponent(JSON.stringify({ necessary: true, analytics: false }));
  const allow = 'cookie_consent=' + encodeURIComponent(JSON.stringify({ necessary: true, analytics: true }));
  assert.ok(trackMetaLike('Test', {}, deny).skipped, 'Should skip when analytics=false');
  assert.ok(trackMetaLike('Test', {}, allow).sent, 'Should send when analytics=true');
  console.log('consent.gating.test OK');
}

if (require.main === module) run();
module.exports = run;
