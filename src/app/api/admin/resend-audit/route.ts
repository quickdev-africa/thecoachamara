import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabaseClient';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-admin-key') || process.env.ADMIN_API_KEY || '';
  const allowed = !!apiKey && apiKey === process.env.ADMIN_API_KEY;
  if (!allowed) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const recipient = url.searchParams.get('recipient');
  if (!recipient) return NextResponse.json({ error: 'missing recipient' }, { status: 400 });

  try {
    const { data, error } = await supabase.from('resend_audit').select('*').eq('recipient', recipient).order('created_at', { ascending: false }).limit(100);
    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || e }, { status: 500 });
  }
}
