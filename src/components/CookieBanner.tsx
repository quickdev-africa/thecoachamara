"use client";
import { useEffect, useMemo, useState } from 'react';
import { CONSENT_COOKIE, defaultConsent, isAllowedPath, isBannerEnabled } from '@/lib/consent';
import { usePathname, useSearchParams } from 'next/navigation';

function getClientConsent() {
  try {
    const fromStorage = localStorage.getItem(CONSENT_COOKIE);
    if (fromStorage) return JSON.parse(fromStorage);
    const match = document.cookie.match(new RegExp('(^| )' + CONSENT_COOKIE + '=([^;]+)'));
    if (match) return JSON.parse(decodeURIComponent(match[2]));
  } catch {}
  return null;
}

function setClientConsent(consent: any) {
  try {
    localStorage.setItem(CONSENT_COOKIE, JSON.stringify(consent));
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {}
}

export default function CookieBanner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const enabled = isBannerEnabled();
  const allowed = useMemo(() => (pathname ? isAllowedPath(pathname) : true), [pathname]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !allowed) {
      setVisible(false);
      return;
    }

    const reset = searchParams?.get('reset_consent');
    if (process.env.NODE_ENV !== 'production' && reset === '1') {
      localStorage.removeItem(CONSENT_COOKIE);
      document.cookie = `${CONSENT_COOKIE}=; Path=/; Max-Age=0;`;
    }

    const existing = getClientConsent();
    setVisible(!existing);
  }, [enabled, allowed, searchParams]);

  const accept = () => {
    const consent = { ...defaultConsent(), analytics: true };
    setClientConsent(consent);
    setVisible(false);
  };

  const reject = () => {
    const consent = { ...defaultConsent(), analytics: false };
    setClientConsent(consent);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed z-40 bottom-2 left-2 right-2 sm:right-auto sm:bottom-4 sm:left-4">
      <div className="w-full sm:w-[22rem] rounded-2xl shadow-xl border border-gray-200 bg-white p-3 sm:p-4 text-gray-900">
        <h3 className="hidden sm:block text-xl font-semibold mb-2 text-gray-900">Cookie Settings</h3>
        <p className="mb-3 text-gray-800 text-sm sm:text-base">This site uses cookies to offer a smoother experience and show relevant content.</p>
        <div className="flex items-center gap-2">
          <button onClick={reject} className="flex-1 h-9 sm:h-10 rounded-full bg-[#EDE9E4] text-gray-800 font-medium hover:opacity-90 transition">Reject</button>
          <button onClick={accept} className="flex-1 h-9 sm:h-10 rounded-full bg-black text-white font-medium hover:opacity-90 transition">Accept</button>
        </div>
      </div>
    </div>
  );
}
