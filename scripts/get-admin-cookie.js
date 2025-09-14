#!/usr/bin/env node
/*
 * Simple Node script to authenticate via NextAuth Credentials provider,
 * capture the session cookies, and call a protected API endpoint.
 *
 * Usage (from project root):
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node ./scripts/get-admin-cookie.js
 * Optional env:
 *   BASE_URL (default http://localhost:3000)
 *   PROTECTED_PATH (default /api/orders)
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PROTECTED_PATH = process.env.PROTECTED_PATH || '/api/debug/session';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD env vars and try again.');
  process.exit(1);
}

async function getCsrf(fetchFn) {
  const res = await fetchFn(`${BASE_URL.replace(/\/$/, '')}/api/auth/csrf`);
  if (!res.ok) throw new Error('Failed to fetch CSRF token');
  const data = await res.json();
  return data.csrfToken;
}

function extractCookieString(setCookieHeaders) {
  if (!setCookieHeaders || !Array.isArray(setCookieHeaders)) return '';
  // each header looks like: 'next-auth.session-token=...; Path=/; HttpOnly; Secure; SameSite=...'
  return setCookieHeaders.map(h => h.split(';')[0]).join('; ');
}

async function loginAndGetCookies(fetchFn) {
  const csrfToken = await getCsrf(fetchFn);
  const params = new URLSearchParams();
  params.set('csrfToken', csrfToken);
  params.set('email', ADMIN_EMAIL);
  params.set('password', ADMIN_PASSWORD);
  // Ask NextAuth for a JSON response where supported
  params.set('json', 'true');

  const res = await fetchFn(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    redirect: 'manual'
  });

  // Collect Set-Cookie headers
  // node-fetch exposes headers.raw(), fetch in newer Node exposes headers.get/set
  const raw = res.headers && typeof res.headers.raw === 'function' ? res.headers.raw() : {};
  const setCookie = raw['set-cookie'] || raw['Set-Cookie'] || [];
  const cookieString = extractCookieString(setCookie);
  return { cookieString, res, body: await safeJson(res) };
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    try {
      return await res.text();
    } catch (e2) {
      return null;
    }
  }
}

async function callProtected(fetchFn, cookie) {
  const res = await fetchFn(`${BASE_URL}${PROTECTED_PATH}`, {
    method: 'GET',
    headers: {
      Cookie: cookie
    }
  });
  const body = await safeJson(res);
  return { status: res.status, ok: res.ok, body };
}

async function getFetch() {
  if (typeof fetch === 'function') return fetch;
  try {
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (e) {
    throw new Error('No fetch available. Install node-fetch or use Node 18+.');
  }
}

(async () => {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD env vars and try again.');
      process.exit(1);
    }
    const fetchFn = await getFetch();
    console.log('Logging in...');
      const { cookieString, res: loginRes, body: loginBody } = await loginAndGetCookies(fetchFn);
    if (!cookieString) {
        console.error('No Set-Cookie headers received. Login response:', loginRes.status, loginBody);
      process.exit(2);
    }
    console.log('\nCookie header to use:');
    console.log(cookieString);

    console.log('\nCalling protected endpoint', PROTECTED_PATH);
    const result = await callProtected(fetchFn, cookieString);
    console.log('Response status:', result.status);
    console.log('Response body:');
    console.log(JSON.stringify(result.body, null, 2));
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(3);
  }
})();
