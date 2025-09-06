import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not allowed in production' }, { status: 403 });
  }
  try {
    const { data } = await serverSupabase.from('payments').select('id,reference,order_id,payment_method,email,amount,status,created_at,metadata').order('created_at', { ascending: false }).limit(20);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to fetch payments' }, { status: 500 });
  }
}
