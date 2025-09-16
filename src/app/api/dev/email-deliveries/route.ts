import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';

// GET /api/dev/email-deliveries?limit=10&dev=true
// Dev-only helper to inspect recent email_deliveries rows.
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const dev = url.searchParams.get('dev') === 'true' || process.env.NODE_ENV !== 'production';
  if (!dev) return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 });

  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
  try {
    const { data, error } = await serverSupabase
      .from('email_deliveries')
      .select('*')
      .order('sent_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'failed to fetch' }, { status: 500 });
  }
}
