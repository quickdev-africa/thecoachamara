import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabaseClient';

// POST /api/orders/notify
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ success: false, error: 'Order ID required' });
    // Fetch order and customer info
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (error || !order) return NextResponse.json({ success: false, error: 'Order not found' });
    // TODO: Integrate with email/SMS provider here
    // For now, just simulate success
    return NextResponse.json({ success: true, message: 'Notification sent (simulated)' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to send notification' });
  }
}
