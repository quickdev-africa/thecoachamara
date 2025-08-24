import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
import { Order, ApiResponse } from '@/lib/types';



// ============================================================================
// GET ALL ORDERS
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Order[]>>> {
  try {
    // Extract search params more efficiently
    const url = req.nextUrl;
    const pageLimit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');

    // Build Supabase query
    let queryBuilder = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }

    const { data: orders, error } = await queryBuilder;
    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
      meta: {
        total: orders ? orders.length : 0
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { status: 500 });
  }
}

// ============================================================================
// UPDATE ORDER (status, payment, etc.)
// ============================================================================
export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse<{ id?: string, updated?: number }>>> {
  try {
    const body = await req.json();
    const { id, ids, status, paymentStatus, ...rest } = body;
    // Bulk update
    if (Array.isArray(ids) && ids.length > 0 && status) {
      // Fetch current orders
      const { data: orders, error: fetchError } = await supabase.from('orders').select('id, status').in('id', ids);
      if (fetchError) return NextResponse.json({ success: false, error: fetchError.message });
      // Update all
      const { error: updateError } = await supabase.from('orders').update({ status }).in('id', ids);
      if (updateError) return NextResponse.json({ success: false, error: updateError.message });
      // Log status changes
      const changed = (orders || []).filter((o: any) => o.status !== status);
      if (changed.length > 0) {
        await supabase.from('order_status_history').insert(
          changed.map((o: any) => ({ order_id: o.id, status, changed_by: body.changedBy || null }))
        );
      }
      return NextResponse.json({ success: true, updated: ids.length });
    }
    // Single update
    if (!id) return NextResponse.json({ success: false, error: 'Order ID required' });
    // Fetch current order
    const { data: order, error: fetchError } = await supabase.from('orders').select('*').eq('id', id).single();
    if (fetchError || !order) return NextResponse.json({ success: false, error: 'Order not found' });
    // Prepare update fields
    const updateFields: any = { ...rest };
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.payment_status = paymentStatus;
    // Update order
    const { error: updateError } = await supabase.from('orders').update(updateFields).eq('id', id);
    if (updateError) return NextResponse.json({ success: false, error: updateError.message });
    // Log status change if status changed
    if (status && status !== order.status) {
      await supabase.from('order_status_history').insert({
        order_id: id,
        status,
        changed_by: body.changedBy || null,
      });
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
