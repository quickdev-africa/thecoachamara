

import NextAuth from "next-auth";
import fs from 'fs';
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

  // Optionally allow admin emails listed in ADMIN_EMAILS to be treated as admin
  const adminEmailsRaw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  const adminEmails = adminEmailsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
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
