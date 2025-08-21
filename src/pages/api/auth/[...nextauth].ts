
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Use Firebase Auth for authentication and check for admin claim
        try {
          const auth = getAuth();
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials?.username || "",
            credentials?.password || ""
          );
          const user = userCredential.user;
          if (user) {
            // Get ID token result to check for custom claims
            const idTokenResult = await user.getIdTokenResult();
            if (idTokenResult.claims && idTokenResult.claims.admin) {
              return {
                id: user.uid,
                name: user.displayName || user.email,
                email: user.email,
              };
            } else {
              // Not an admin
              return null;
            }
          }
          return null;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
