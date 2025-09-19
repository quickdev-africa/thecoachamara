import { NextRequest, NextResponse } from 'next/server';
import { getAnonSupabase } from '@/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Try a simple query to test Supabase connectivity
    const supabase = getAnonSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase anon env vars not configured' }, { status: 503 });
    }
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', details: error }, { status: 500 });
  }
}
