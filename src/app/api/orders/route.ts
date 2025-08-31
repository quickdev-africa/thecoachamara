// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

    const orderNumber = generateOrderNumber();

    // Start transaction
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
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const customerEmail = searchParams.get('email');
    const status = searchParams.get('status');

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

      return NextResponse.json({
        success: true,
        order
      });
    }

    // Get orders list with filters
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customerName,
        customerEmail,
        total,
        status,
        paymentStatus,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (customerEmail) {
      query = query.eq('customerEmail', customerEmail);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query.limit(50);

    if (error) {
      console.error('Orders fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch orders'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
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