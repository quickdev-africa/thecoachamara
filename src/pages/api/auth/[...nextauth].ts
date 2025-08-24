

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/supabaseClient";

export default NextAuth({
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
        const isAdmin = data.user.user_metadata?.admin === true;
        if (isAdmin) {
          return {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email,
            email: data.user.email
          };
        }
        // Not an admin
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET
});
