"use client";
import { usePathname } from 'next/navigation';

export default function GlobalDisclaimer() {
  const pathname = usePathname() || '/';

  // Show on marketing + commerce pages; hide on admin/auth/api tools
  const show = shouldShowDisclaimer(pathname);
  if (!show) return null;

  return (
    <div className="w-full bg-black text-gray-400 text-xs border-t border-gray-800">
      <div className="max-w-9xl mx-auto px-6 py-3">
        This site is not a part of Facebook™ or Meta Platforms, Inc. Additionally, this site is NOT endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of Meta Platforms, Inc.
      </div>
    </div>
  );
}

function shouldShowDisclaimer(path: string) {
  // Normalize trailing slash
  const p = path.replace(/\/$/, '') || '/';

  // Hide on admin and auth routes
  if (p.startsWith('/admin') || p.startsWith('/signin') || p.startsWith('/signup')) return false;

  // Pages to include (marketing funnel + commerce)
  const includeExact = new Set<string>([
    '/',
    '/about',
    '/quantum',
    '/order-quantum-machine',
    '/join',
    '/contact',
    '/thank-you',
    '/thank-you-premium',
  ]);
  if (includeExact.has(p)) return true;

  // Include shop listing and product detail pages
  if (p === '/shop' || p.startsWith('/shop/')) return true;

  return false;
}

