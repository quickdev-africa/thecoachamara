import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabaseClient';

// GET /api/orders/history?orderId=...
export async function GET(req: NextRequest): Promise<NextResponse> {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ success: false, error: 'Order ID required' });
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('changed_at', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: error.message });
  return NextResponse.json({ success: true, data });
}
