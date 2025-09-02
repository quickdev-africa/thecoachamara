import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protect the admin UI routes server-side. This middleware only runs for paths
// matching the matcher below (see config). It will redirect unauthenticated or
// non-admin users to the app's /signin page with a callbackUrl.

export async function middleware(req: NextRequest) {
  try {
    const { pathname, search } = req.nextUrl;

    // Only protect the admin UI pages (not APIs, not static files)
    // e.g. /admin, /admin/*
    if (!pathname.startsWith('/admin')) return NextResponse.next();

    // Use NextAuth's getToken to decode the token from cookies
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Check admin conditions similar to server helpers
    const owner = process.env.OWNER_EMAIL;
    const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const userEmail = token?.email?.toString().toLowerCase();
    const role = (token as any)?.role || (token as any)?.userRole;
    const isAdminClaim = (token as any)?.isAdmin === true || (token as any)?.admin === true;

    const ok = Boolean(
      (userEmail && (userEmail === owner || adminEmails.includes(userEmail))) ||
      (role && String(role).toLowerCase() === 'admin') ||
      isAdminClaim
    );

    if (!ok) {
      const signInUrl = new URL('/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (err) {
    // On error, redirect to sign-in as a safe default
    const signInUrl = new URL('/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: ['/admin/:path*']
};
