import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/adminGuard';

export async function GET(req: NextRequest) {
  const guard = checkAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: 'unauthorized' }, { status: guard.status || 401 });
  const cookieHeader = req.headers.get('cookie') || '';
  const extract = (name: string) => {
    const parts = cookieHeader.split(/;\s*/).map(p=>p.trim());
    const match = parts.find(p=>p.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  };
  const parse = (raw: string | null) => { if (!raw) return null; try { return JSON.parse(raw); } catch { return null; } };
  const first = parse(extract('ca_utm_first'));
  const last = parse(extract('ca_utm_last'));
  const clicks = parse(extract('ca_click_ids'));
  const consentRaw = extract('cookie_consent');
  let consent: any = null; try { consent = consentRaw ? JSON.parse(consentRaw) : null; } catch {}
  return NextResponse.json({ success: true, attribution: { first, last, clicks }, consent });
}
