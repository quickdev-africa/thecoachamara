
import type { Metadata } from "next";
import "./globals.css";
import "./logoFont.css";
import "./playfair.css";
import dynamic from "next/dynamic";
const SessionProvider = dynamic(() => import("./SessionProvider"), { ssr: false });
const SiteHeader = dynamic(() => import("./components/ConditionalHeader"), { ssr: false });
import ReactQueryProvider from "./ReactQueryProvider";
<<<<<<< HEAD
import { CartProvider } from "./shop/CartContext";
const CookieBanner = dynamic(() => import("@/components/CookieBanner"), { ssr: false });
=======
import Script from "next/script";
import { CartProvider } from "./shop/CartContext";
import MetaPixelProvider from "./MetaPixelProvider";
import GlobalDisclaimer from "./components/GlobalDisclaimer";
>>>>>>> my-feature-branch

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
<<<<<<< HEAD
        {/* Paystack inline script loader (async) - only injected in browser */}
        <script
=======
        {/* Meta Pixel (Facebook) */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            (function(){
              if (typeof window === 'undefined') return;
              var pid = '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''}'.trim();
              if (!pid) return;
              if (!window.fbq) {
                var n = window.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
                if (!window._fbq) window._fbq = n;
                n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
                var t = document.createElement('script'); t.async = !0;
                t.src = 'https://connect.facebook.net/en_US/fbevents.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(t, s);
              }
              window.fbq('init', pid);
              window.fbq('track', 'PageView');
            })();
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''}&ev=PageView&noscript=1`} />
        </noscript>
        {/* Paystack inline script loader (async) - only injected in browser */}
        <Script id="paystack-inline" strategy="afterInteractive"
>>>>>>> my-feature-branch
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
<<<<<<< HEAD
              <SiteHeader />
              {children}
              <CookieBanner />
=======
              <MetaPixelProvider />
              {children}
              <GlobalDisclaimer />
>>>>>>> my-feature-branch
            </CartProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
