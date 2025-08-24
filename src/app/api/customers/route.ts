import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

// GET all customers (members and buyers)
export async function GET(req: NextRequest) {
  try {
    // Fetch all users who have joined or ordered
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, name, email, phone, joined_at, is_active');
    if (error) throw error;

    // Fetch order counts and last order date for each user
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('user_id, created_at');
    if (orderError) throw orderError;

    type User = { id: string; name: string; email: string; phone?: string; joined_at?: string; is_active?: boolean };
    type Order = { user_id: string; created_at: string };

    // Map orders to user
    const orderMap = new Map<string, string[]>();
    (orders as Order[] || []).forEach(order => {
      if (!orderMap.has(order.user_id)) orderMap.set(order.user_id, []);
      orderMap.get(order.user_id)!.push(order.created_at);
    });

    const customers = (users as User[] || []).map(user => {
      const userOrders = orderMap.get(user.id) || [];
      return {
        ...user,
        orders_count: userOrders.length,
        last_order_at: userOrders.length > 0 ? userOrders.sort().reverse()[0] : null,
      };
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to fetch customers' }, { status: 500 });
  }
}
