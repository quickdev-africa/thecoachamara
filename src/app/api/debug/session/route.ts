import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

async function isAdminToken(token: any) {
  if (!token) return false;
  const userEmail = token.email;
  const userRole = token.role || token.userRole;
  const owner = process.env.OWNER_EMAIL;
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map((s) => s.trim()).filter(Boolean);
  if (userEmail && (userEmail === owner || adminEmails.includes(userEmail))) return true;
  if (userRole && String(userRole).toLowerCase() === 'admin') return true;
  if (token?.isAdmin === true || token?.admin === true) return true;
  return false;
}

export async function GET(req: NextRequest) {
  try {
    // Disallow in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const admin = await isAdminToken(token);
    return NextResponse.json({ ok: true, token: token || null, isAdmin: admin });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

// Use the named export `GET` above; do not default export in App Router route handlers.
