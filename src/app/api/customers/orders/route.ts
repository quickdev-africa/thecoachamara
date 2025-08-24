import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';
import { Order } from '@/lib/types';

// GET orders for a specific customer
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const customerId = url.searchParams.get('customerId');
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customerId is required' }, { status: 400 });
    }
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customerId', customerId)
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch orders' }, { status: 500 });
  }
}
