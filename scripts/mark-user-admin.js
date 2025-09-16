#!/usr/bin/env node
/**
 * scripts/mark-user-admin.js
 *
 * Find a Supabase user by email and set `raw_user_meta_data.admin = true` using the
 * Supabase Admin REST endpoint. This matches the project's schema (raw_user_meta_data JSONB).
 *
 * Usage (from project root):
 *   SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx ADMIN_EMAIL=admin@example.com node ./scripts/mark-user-admin.js
 *
 * Or pass the email as the first arg:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node ./scripts/mark-user-admin.js admin@example.com
 *
 * WARNING: keep your service-role key secret. Only run locally or in a secure CI.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.argv[2];

if (!SUPABASE_URL || !SERVICE_ROLE || !ADMIN_EMAIL) {
  console.error('Please set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL (or pass email as first arg).');
  process.exit(1);
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

async function findUserByEmail(fetchFn, email) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
  const res = await fetchFn(url, {
    method: 'GET',
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to query users: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  // Supabase admin users endpoint returns either an array (older SDKs) or
  // an object with a `users` array. Normalize both shapes.
  const users = Array.isArray(data) ? data : (data && data.users) || [];
  // Prefer an exact (case-insensitive) email match. Some Supabase project
  // responses may include multiple records; pick the one that matches the
  // requested email precisely.
  const exact = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  return exact || null;
}

async function patchUserRawMeta(fetchFn, id, rawMeta) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${id}`;
  let res = await fetchFn(url, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw_user_meta_data: rawMeta })
  });

  // Some Supabase projects don't allow PATCH on this admin endpoint and return 405.
  // In that case, retry with PUT which is accepted.
  if (res.status === 405) {
    res = await fetchFn(url, {
      method: 'PUT',
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw_user_meta_data: rawMeta })
    });
  }

  if (!res.ok) {
    throw new Error(`Failed to patch user: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

(async () => {
  try {
    const fetchFn = await getFetch();
    console.log('Finding user by email...', ADMIN_EMAIL);
    const user = await findUserByEmail(fetchFn, ADMIN_EMAIL);
    if (!user) {
      console.error('No user found with that email.');
      process.exit(2);
    }
    const id = user.id;
    // Prefer raw_user_meta_data (jsonb). Fall back to user_metadata if present.
    const existingRaw = user.raw_user_meta_data || user.user_metadata || {};
    if (existingRaw.admin === true) {
      console.log('User is already an admin:', user.email, id);
      process.exit(0);
    }
    const newRaw = { ...existingRaw, admin: true };
    console.log('Patching raw_user_meta_data to set admin=true for', user.email);
    const patched = await patchUserRawMeta(fetchFn, id, newRaw);
    console.log('Patched user:', patched.id);
    console.log('Done. Sign out and sign back in to receive an updated session.');
  } catch (err) {
    console.error('Error:', (err && err.message) || err);
    process.exit(3);
  }
})();
