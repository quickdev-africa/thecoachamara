import { NextRequest, NextResponse } from 'next/server';
import { getAnonSupabase } from '@/supabaseClient';
import { Order } from '@/lib/types';

// GET orders for a specific customer
export async function GET(req: NextRequest) {
  try {
    // Debug environment variables
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const url = req.nextUrl;
    const customerId = url.searchParams.get('customerId');
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customerId is required' }, { status: 400 });
    }
    const supabase = getAnonSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase anon env vars not configured' }, { status: 503 });
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
