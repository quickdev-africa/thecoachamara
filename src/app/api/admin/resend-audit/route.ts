import { NextRequest, NextResponse } from 'next/server';
// Use serverSupabase (service role) when available; fall back to anon client only if needed.
import serverSupabase from '@/lib/serverSupabase';
import { supabase as anonSupabase } from '@/supabaseClient';
import { checkAdmin } from '@/lib/adminGuard';

function getClient() {
  // Prefer server client (will throw lazily if misconfigured); otherwise use anon for read-only.
  try {
    if (serverSupabase) return serverSupabase as any;
  } catch {}
  return anonSupabase as any;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const recipient = url.searchParams.get('recipient');
  const guard = checkAdmin(req, { emailForDomainCheck: recipient || undefined });
  if (!guard.ok) {
    return NextResponse.json({ error: 'unauthorized' }, { status: guard.status || 401 });
  }
  // re-use existing recipient variable assignment (already above)
  if (!recipient) return NextResponse.json({ error: 'missing recipient' }, { status: 400 });

  try {
    const client = getClient();
    const { data, error } = await client.from('resend_audit').select('*').eq('recipient', recipient).order('created_at', { ascending: false }).limit(100);
    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: 'unhandled', detail: e?.message || String(e) }, { status: 500 });
  }
}
