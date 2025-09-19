const assert = require('assert');
const { parseAttributionFromHeader } = require('../src/lib/attributionServer.js');

function run() {
  const cookieHeader = [
    'ca_utm_first=' + encodeURIComponent(JSON.stringify({ source: 'google', medium: 'cpc', timestamp: '2025-09-19T00:00:00Z' })),
    'ca_utm_last=' + encodeURIComponent(JSON.stringify({ source: 'facebook', medium: 'paid_social', timestamp: '2025-09-19T01:00:00Z' })),
    'ca_click_ids=' + encodeURIComponent(JSON.stringify({ fbclid: 'FB123', gclid: 'G987' }))
  ].join('; ');
  const parsed = parseAttributionFromHeader(cookieHeader);
  assert.ok(parsed.first.source === 'google');
  assert.ok(parsed.last.source === 'facebook');
  assert.ok(parsed.clicks.fbclid === 'FB123');
  console.log('attribution.server.test OK');
}

if (require.main === module) run();
module.exports = run;
