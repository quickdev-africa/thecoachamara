import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from "next/server";

async function isAdminSession(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return false;
    const userEmail = (token as any).email;
    const userRole = (token as any).role || (token as any).userRole;
    const owner = process.env.OWNER_EMAIL;
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(s => s.trim()).filter(Boolean);
    if (userEmail && (userEmail === owner || adminEmails.includes(userEmail))) return true;
    if (userRole && String(userRole).toLowerCase() === 'admin') return true;
    if ((token as any)?.isAdmin === true || (token as any)?.admin === true) return true;
    return false;
  } catch (e) {
    return false;
  }
}

export async function requireAdminApi(req: NextRequest) {
  try {
    // Allow server-to-server admin key for internal calls (e.g. payments.confirm -> orders/notify)
    const adminKeyHeader = req.headers.get('x-admin-key');
    const expected = process.env.ADMIN_API_KEY || '';
    if (adminKeyHeader && expected && adminKeyHeader === expected) return null;
  } catch (e) {
    // fallthrough to session check
  }

  const ok = await isAdminSession(req);
  if (!ok) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function requireAdminPage(req: NextRequest) {
  const ok = await isAdminSession(req);
  if (!ok) {
  // Redirect to the app's custom sign-in page so the UI flow remains intact.
  const signInUrl = '/signin?callbackUrl=' + encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(signInUrl);
  }
  return null;
}

export default isAdminSession;

/**
 * Runtime guard: throw when a dev-only bypass is enabled in production.
 * Call this at app startup or in a central auth module to avoid accidental production backdoors.
 */
export function ensureNoDevBypassInProduction() {
  try {
    const devBypass = process.env.DEV_ADMIN_BYPASS === 'true';
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd && devBypass) {
      throw new Error('DEV_ADMIN_BYPASS is enabled in production — aborting startup for safety');
    }
  } catch (e) {
    // rethrow
    throw e;
  }
}
