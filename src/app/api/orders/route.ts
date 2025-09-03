// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/requireAdmin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `QM-${timestamp.slice(-6)}-${random}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (auth) return auth;
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail, 
      customerPhone,
      items,
      subtotal,
      deliveryFee = 0,
      total,
      delivery,
      metadata = {}
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: customerName, customerEmail, customerPhone, items'
      }, { status: 400 });
    }

    // Validate delivery payload: ensure shipping has full address and pickup has location
    const incomingDelivery = delivery || {};
    const inferredMethod = incomingDelivery.method || (incomingDelivery.shippingAddress ? 'shipping' : (incomingDelivery.pickupLocation ? 'pickup' : null));
    if (inferredMethod === 'shipping') {
      const addr = incomingDelivery.shippingAddress || incomingDelivery;
      if (!addr || !addr.street || !addr.city || !addr.state) {
        return NextResponse.json({ success: false, error: 'Missing shipping address fields: street, city, state' }, { status: 400 });
      }
    }
    if (inferredMethod === 'pickup') {
      if (!incomingDelivery.pickupLocation) {
        return NextResponse.json({ success: false, error: 'Missing pickupLocation for pickup delivery' }, { status: 400 });
      }
    }

    const orderNumber = generateOrderNumber();

    // Start transaction
  // Normalize delivery fields for DB
  const deliveryMethod = (delivery && delivery.method) ? delivery.method : inferredMethod;
  const shippingAddress = delivery?.shippingAddress || (deliveryMethod === 'shipping' ? delivery : null);
  const pickupLocation = delivery?.pickupLocation || null;
  const shippingState = shippingAddress?.state || delivery?.state || null;
    const customerState = body.customerState || null;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        total: Number(total),
        status: 'pending',
        paymentStatus: 'pending',
  delivery_method: deliveryMethod,
        shipping_address: shippingAddress,
        pickup_location: pickupLocation,
        shipping_state: shippingState,
        customer_state: customerState,
        delivery: delivery || {},
        metadata: {
          ...metadata,
          source: 'quantum-funnel',
          createdAt: new Date().toISOString()
        },
        items: items // Store items as JSONB for now
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create order',
        details: orderError.message
      }, { status: 500 });
    }

    // Insert order items
      // Lookup which product IDs actually exist to avoid FK constraint failures
      const productIds = items
        .map((it: any) => it.productId)
        .filter(Boolean);

      let existingProductIds = new Set<string>();
      if (productIds.length > 0) {
        try {
          const { data: productsList } = await supabase
            .from('products')
            .select('id')
            .in('id', productIds);
          if (Array.isArray(productsList)) {
            existingProductIds = new Set(productsList.map((p: any) => p.id));
          }
        } catch (e) {
          console.warn('Failed to lookup product ids to validate order items', e);
        }
      }

      const orderItems = items.map((item: any) => {
        const hasProduct = item.productId && existingProductIds.has(item.productId);
        const row: any = {
          order_id: order.id,
          product_name: item.productName,
          product_price: Number(item.unitPrice || item.price),
          quantity: Number(item.quantity),
          total_price: Number(item.totalPrice || item.total),
          product_snapshot: {
            ...item,
            capturedAt: new Date().toISOString()
          }
        };

        // Only include product_id if the product exists in products table
        if (hasProduct) {
          row.product_id = item.productId;
        } else {
          console.info('Product id not found in products table, storing snapshot without FK:', item.productId);
        }

        return row;
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        // Don't fail the order, just log the error
        console.warn('Order created but items insertion failed:', itemsError.message);
      }

    // Update inventory (if products exist in database)
    for (const item of items) {
      if (item.productId && !item.productId.startsWith('quantum-')) {
        await supabase.rpc('update_product_stock', {
          product_id: item.productId,
          quantity_change: -Number(item.quantity)
        });
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (auth) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const customerEmail = searchParams.get('email');
    const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (orderId) {
      // Get specific order
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, price, images)
          ),
          payments (
            id,
            amount,
            status,
            payment_method,
            reference,
            created_at
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Order not found'
        }, { status: 404 });
      }

      // Return single order using unified ApiResponse shape
      return NextResponse.json({
        success: true,
        data: order
      });
    }

    // Get orders list with filters and pagination
    // include order_items(product_name) so the admin list can show purchased product names
    let base = supabase.from('orders');

    const selectCols = `
      id,
      order_number,
      customerName,
      customerEmail,
      total,
      status,
      paymentStatus,
      created_at,
      shipping_address,
      shipping_state,
      pickup_location,
      delivery_method,
      delivery,
      order_items ( product_name )
    `;

    let query = base.select(selectCols, { count: 'exact' }).order('created_at', { ascending: false }).range(offset, Math.max(0, offset + limit - 1));

    if (customerEmail) {
      query = query.eq('customerEmail', customerEmail);
    }

    if (status) {
      query = query.eq('status', status);
    }

    let orders: any = null;
    let error: any = null;
    let count: number | null = null;
    try {
      const res: any = await query;
      orders = res.data || res;
      error = res.error || null;
      count = res.count ?? null;
      if (error) throw error;
    } catch (err: any) {
      // If the DB complains about a missing column (historical schema differences),
      // fall back to a safer, smaller select that avoids optional/renamed columns.
      console.error('Orders fetch error:', err);
      if (err && (err.code === '42703' || (err.message || '').includes('delivery_info'))) {
        try {
          const safeSelect = `
            id,
            order_number,
            customerName,
            customerEmail,
            total,
            status,
            paymentStatus,
            created_at,
            shipping_address,
            shipping_state,
            pickup_location,
            delivery_method
          `;
          const safeRes: any = await base.select(safeSelect, { count: 'exact' }).order('created_at', { ascending: false }).range(offset, Math.max(0, offset + limit - 1));
          orders = safeRes.data || safeRes;
          error = safeRes.error || null;
          count = safeRes.count ?? null;
          if (error) throw error;
        } catch (safeErr: any) {
          console.error('Safe fallback orders fetch failed:', safeErr);
          return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
      }
    }

    // Normalize DB rows (snake_case) to camelCase expected by frontend
    const normalized = (orders || []).map((r: any) => ({
      id: r.id,
      orderNumber: r.order_number || r.orderNumber,
      customerName: r.customerName || r.customer_name || r.customer_name,
      customerEmail: r.customerEmail || r.customer_email,
      total: r.total,
      status: r.status,
      paymentStatus: r.paymentStatus || r.payment_status,
      createdAt: r.created_at || r.createdAt,
      // delivery fields
      shippingAddress: r.shipping_address || r.shippingAddress || null,
      shippingState: r.shipping_state || r.shippingState || null,
      pickupLocation: r.pickup_location || r.pickupLocation || null,
      deliveryMethod: r.delivery_method || r.deliveryMethod || null,
      // product names aggregated from order_items or items JSON
      productNames: Array.isArray(r.order_items) && r.order_items.length > 0
        ? r.order_items.map((i: any) => i.product_name).filter(Boolean).join(', ')
        : (Array.isArray(r.items) ? r.items.map((it: any) => it.productName || it.product_name).filter(Boolean).join(', ') : null)
    }));

    // Return list using unified ApiResponse shape (data + meta.total)
    return NextResponse.json({
      success: true,
      data: normalized,
      meta: {
        total: typeof count === 'number' ? count : (normalized.length || 0)
      }
    });

  } catch (error) {
    console.error('Orders fetch API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (auth) return auth;
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus, metadata } = body;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (metadata) updates.metadata = metadata;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Order update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update order'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Order update API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Support PUT from admin UI for compatibility (bulk updates or single id)
export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (auth) return auth;
  try {
    const body = await request.json();
    // bulk update: ids + status
    if (Array.isArray(body.ids) && body.ids.length > 0 && body.status) {
  const { data, error } = await supabase.from('orders').update({ status: body.status, updated_at: new Date().toISOString() }).in('id', body.ids);
  if (error) throw error;
  const arr = data as any[] | null;
  return NextResponse.json({ success: true, updated: arr?.length || 0 });
    }

    // single update: id + status/paymentStatus
    const { id, status, paymentStatus } = body;
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    const updates: any = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, order: data });
  } catch (error: any) {
    console.error('Order PUT error', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to update orders' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if (auth) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    // support multiple ids via comma-separated list
    const idsParam = searchParams.get('ids');
    if (!id && !idsParam) {
      return NextResponse.json({ success: false, error: 'id or ids required' }, { status: 400 });
    }

    if (idsParam) {
      const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
      // Prefer using a DB-side transactional RPC if available
      try {
        const { error: rpcErr } = await supabase.rpc('delete_orders', { ids });
        if (!rpcErr) return NextResponse.json({ success: true, deleted: ids.length });
        console.warn('delete_orders rpc returned error, falling back to manual delete', rpcErr);
      } catch (e) {
        console.warn('RPC delete_orders not available, falling back to manual delete', e);
      }

      // fallback: delete dependent rows first
      const { error: itemsErr } = await supabase.from('order_items').delete().in('order_id', ids);
      if (itemsErr) console.warn('Failed to delete order_items for orders', itemsErr);
      const { error: paymentsErr } = await supabase.from('payments').delete().in('order_id', ids);
      const { error: attemptsErr } = await supabase.from('payment_attempts').delete().in('order_id', ids);
      if (paymentsErr) console.warn('Failed to delete payments for orders', paymentsErr);
      if (attemptsErr) console.warn('Failed to delete payment_attempts for orders', attemptsErr);
      const { error } = await supabase.from('orders').delete().in('id', ids);
      if (error) throw error;
      return NextResponse.json({ success: true, deleted: ids.length });
    }

    // single id: try RPC first then fallback to manual deletion
    try {
      const { error: rpcErr } = await supabase.rpc('delete_orders', { ids: [id] });
      if (!rpcErr) return NextResponse.json({ success: true, deleted: 1 });
      console.warn('delete_orders rpc returned error for single id, falling back', rpcErr);
    } catch (e) {
      console.warn('RPC delete_orders not available for single id, falling back', e);
    }

    const { error: itemsErr } = await supabase.from('order_items').delete().eq('order_id', id);
    if (itemsErr) console.warn('Failed to delete order_items for order', itemsErr);
    const { error: paymentsErr } = await supabase.from('payments').delete().eq('order_id', id);
    if (paymentsErr) console.warn('Failed to delete payments for order', paymentsErr);
    const { error: attemptsErr } = await supabase.from('payment_attempts').delete().eq('order_id', id);
    if (attemptsErr) console.warn('Failed to delete payment_attempts for order', attemptsErr);
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true, deleted: 1 });
  } catch (error: any) {
    console.error('Order delete error', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete orders' }, { status: 500 });
  }
}