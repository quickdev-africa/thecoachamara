
import type { Metadata } from "next";
import "./globals.css";
import "./logoFont.css";
import "./playfair.css";
import dynamic from "next/dynamic";
const SessionProvider = dynamic(() => import("./SessionProvider"), { ssr: false });
const SiteHeader = dynamic(() => import("./components/ConditionalHeader"), { ssr: false });
import ReactQueryProvider from "./ReactQueryProvider";
import { CartProvider } from "./shop/CartContext";
const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "Coach Amara — Quantum Energy Coaching",
  description: "Transformative quantum energy and wellness programs by Coach Amara",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
  <body className="antialiased font-playfair">
        {/* Paystack inline script loader (async) - only injected in browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (typeof window === 'undefined') return;
                if (!window.__paystack_loader_added) {
                  var s = document.createElement('script');
                  s.src = 'https://js.paystack.co/v1/inline.js';
                  s.async = true;
                  document.head.appendChild(s);
                  window.__paystack_loader_added = true;
                }
                // expose base url for server-side notify fallback if NEXT_PUBLIC_BASE_URL is provided
                window.__NEXT_PUBLIC_BASE_URL = '${process.env.NEXT_PUBLIC_BASE_URL || ''}';
                // expose Paystack public key at runtime for client code diagnostics/fallback
                window.__NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = '${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''}';
              })();
            `
          }}
        />
        <SessionProvider>
          <ReactQueryProvider>
            <CartProvider>
              <SiteHeader />
              {children}
              <CookieBanner />
            </CartProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
