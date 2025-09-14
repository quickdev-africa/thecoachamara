import { NextRequest, NextResponse } from 'next/server';

// Dev-only endpoint to clear NextAuth cookies on localhost.
// Visit: http://localhost:3000/api/debug/clear-auth-cookies
export async function GET(req: NextRequest) {
  // Safety: disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const cookieNames = [
    // Session tokens
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    // CSRF + callback
    'next-auth.csrf-token',
    'next-auth.callback-url',
    // Legacy/state cookies (harmless if not present)
    'next-auth.state',
    'next-auth.pkce.code_verifier',
  ];

  const res = NextResponse.json({ ok: true, cleared: cookieNames }, { status: 200 });

  // Clear with host-only defaults
  for (const name of cookieNames) {
    res.cookies.set({ name, value: '', path: '/', maxAge: 0 });
  }

  // Also attempt clearing with Secure flag for any previously secure cookies.
  // Note: setting twice is okay; browsers will accept the last header for the same name.
  for (const name of cookieNames) {
    res.headers.append('Set-Cookie', `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; HttpOnly; Secure`);
  }

  return res;
}
