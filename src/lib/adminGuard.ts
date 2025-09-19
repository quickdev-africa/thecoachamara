import { NextRequest } from 'next/server';

// Minimal, no-impact guard:
// - Always require x-admin-key to match ADMIN_API_KEY (if ADMIN_API_KEY is set).
// - Optionally allow domain restriction for routes that pass an email (recipient) when ADMIN_ALLOWED_DOMAINS is set.
// - If no envs provided: guard passes (no behavior change).
// - Returns { ok: boolean; status?: number } for caller to decide response.
export function checkAdmin(req: NextRequest, opts?: { emailForDomainCheck?: string }) {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (configuredKey) {
    const provided = req.headers.get('x-admin-key') || '';
    if (provided !== configuredKey) {
      return { ok: false, status: 401 };
    }
  }
  const domainsRaw = process.env.ADMIN_ALLOWED_DOMAINS || '';
  if (domainsRaw && opts?.emailForDomainCheck) {
    const allowed = domainsRaw.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
    if (allowed.length) {
      const domain = opts.emailForDomainCheck.split('@')[1]?.toLowerCase();
      if (!domain || !allowed.includes(domain)) {
        return { ok: false, status: 403 };
      }
    }
  }
  return { ok: true };
}

export default checkAdmin;
