export type Consent = {
  necessary: boolean;
  analytics: boolean;
  // extend with marketing if needed later
};

export const CONSENT_COOKIE = 'cookie_consent';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function parseConsent(raw?: string | null): Consent | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return {
      necessary: !!obj.necessary,
      analytics: !!obj.analytics,
    } as Consent;
  } catch {
    return null;
  }
}

export function defaultConsent(): Consent {
  return { necessary: true, analytics: false };
}

export function isBannerEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_COOKIE_BANNER_ENABLED === 'false') return false;
  return true;
}

export function isAllowedPath(pathname: string): boolean {
  const raw = process.env.NEXT_PUBLIC_COOKIE_BANNER_PATHS || '';
  if (!raw) return true; // default to all public pages
  const patterns = raw.split(',').map(s => s.trim()).filter(Boolean);
  // simple prefix matching for now
  return patterns.some(p => pathname === p || pathname.startsWith(p.replace(/\*$|\*$/g, '')));
}

export function buildCookie(consent: Consent) {
  return `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}
