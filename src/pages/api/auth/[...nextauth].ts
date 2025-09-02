

import NextAuth from "next-auth";
import fs from 'fs';
import { ensureNoDevBypassInProduction } from '@/lib/requireAdmin';

// Enforce runtime safety: abort startup if the dev bypass is accidentally enabled in production
try {
  ensureNoDevBypassInProduction();
} catch (e) {
  // Rethrow to ensure server fails fast in misconfigured production environments
  throw e;
}
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/supabaseClient";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Use Supabase Auth for authentication and check for admin role
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials?.email || "",
          password: credentials?.password || ""
        });
        if (error || !data.user) {
          // eslint-disable-next-line no-console
          console.error("[NextAuth][authorize] Supabase error:", error, "data:", data);
          return null;
        }
        // Check for admin role in user metadata (you must set this in Supabase dashboard or via SQL)
  // Normalize metadata: prefer raw_user_meta_data (Supabase JSONB), fall back to user_metadata.
  const meta: any = (data.user as any).raw_user_meta_data || (data.user as any).user_metadata || {};
  let isAdmin = meta && meta.admin === true;

  // Minimal logging: record that authorize() ran and whether the user is an admin.
  // Avoid spamming logs or writing to disk in production.
  // eslint-disable-next-line no-console
  console.info('[NextAuth][authorize] user=', { id: data.user.id, email: data.user.email, isAdmin: meta && meta.admin === true });

        // Development/testing fallback: allow specified emails to be treated as admin
        // without modifying Supabase. To enable, set DEV_ADMIN_BYPASS=true and
        // ADMIN_EMAILS="a@x.com,b@y.com" in your local env. This is ONLY meant
        // for local development.
        try {
          const devBypass = process.env.DEV_ADMIN_BYPASS === 'true';
          const isDev = process.env.NODE_ENV !== 'production';
          if (devBypass && !isDev) {
            // Prevent accidental enabling in production
            // eslint-disable-next-line no-console
            console.warn('[NextAuth][authorize] DEV_ADMIN_BYPASS is set but NODE_ENV=production — bypass ignored');
          }
          const adminEmailsRaw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
          const adminEmails = adminEmailsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          if (!isAdmin && devBypass && isDev && credentials?.email) {
            if (adminEmails.includes(credentials.email.toLowerCase())) {
              // eslint-disable-next-line no-console
              console.info('[NextAuth][authorize] DEV_ADMIN_BYPASS used for', credentials.email);
              isAdmin = true;
            }
          }
          // Extra safety: if DEV_ADMIN_BYPASS is enabled and the email matches,
          // short-circuit and return a minimal user object so NextAuth will create a session.
          if (devBypass && isDev && credentials?.email && adminEmails.includes((credentials.email || '').toLowerCase())) {
            // eslint-disable-next-line no-console
            console.info('[NextAuth][authorize] DEV_ADMIN_BYPASS short-circuit returning user for', credentials.email);
            return {
              id: `dev-${(credentials.email || '').toLowerCase()}`,
              name: credentials.email,
              email: credentials.email,
              isAdmin: true
            };
          }
        } catch (e) {
          // ignore errors in fallback parsing
        }
  // eslint-disable-next-line no-console
  console.info('[NextAuth][authorize] final isAdmin=', isAdmin);
  if (isAdmin) {
          return {
            id: data.user.id,
            name: meta.name || data.user.email,
            email: data.user.email,
            isAdmin: true
          };
        }
  // Not an admin — return null so sign-in fails for non-admin users.
  return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  // Use JWT-based sessions in production to keep auth stateless and allow
  // server-side middleware / edge functions to read the token without DB calls.
  session: {
    strategy: 'jwt',
    // 30 days
    maxAge: 30 * 24 * 60 * 60,
  },
  // Ensure cookies are secure in production. NextAuth uses strong defaults,
  // but we explicitly configure cookie options to avoid accidental insecure cookies.
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    // Log jwt and session lifecycle to help diagnose missing session cookie
    async jwt({ token, user }: any) {
      try {
        // When a user object is present (first sign-in), copy over the isAdmin flag
        // so it persists on the token. Also copy basic identifying fields.
        if (user) {
          // user returned from authorize() may already contain custom flags (isAdmin)
          token.id = user.id || token.id;
          token.email = user.email || token.email;
          if ((user as any).isAdmin === true || (user as any).admin === true) {
            token.isAdmin = true;
          }
        }
  // Minimal logging removed for production.
      } catch (e) {}
      return token;
    },
    async session({ session, token }: any) {
      try {
        // Attach isAdmin to the session for client-side checks and for the requireAdmin helpers
        (session as any).user = (session as any).user || {};
        (session as any).user.email = (session as any).user.email || token.email;
        (session as any).user.id = (session as any).user.id || token.id;
        if ((token as any).isAdmin) {
          (session as any).user.isAdmin = true;
        }
  // Minimal logging removed for production.
      } catch (e) {}
      return session;
    },
    async signIn({ user, account, profile }: any) {
      try {
  // Minimal logging removed for production.
      } catch (e) {}
      return true;
    }
  }
};

export default NextAuth(authOptions as any);
