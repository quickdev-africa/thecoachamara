// src/app/api/funnel/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: QM-YYYYMMDD-XXXX (random 4-digit suffix)
function makeOrderNumber() {
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QM-${datePart}-${suffix}`;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      deliveryFee = 0,
      total,
      delivery = {},
      metadata = {}
    } = body;

    if (!productId || !customerName || !customerEmail || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare order payload and generate a friendly, unique order number
    const orderPayloadBase: any = {
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
      items // store snapshot
    };

  // Helper defined above

    let order: any = null;
    let orderError: any = null;
    const MAX_ORDER_TRIES = 5;
    for (let attempt = 0; attempt < MAX_ORDER_TRIES; attempt++) {
      const candidate = { ...orderPayloadBase, order_number: makeOrderNumber() };
      const res = await supabase.from('orders').insert(candidate).select().maybeSingle();
      // res may be { data, error } or similar; handle both shapes
      const data = (res as any).data ?? (res as any)[0];
      const err = (res as any).error ?? (res as any)[1];
      if (!err && data) {
        order = data;
        orderError = null;
        break;
      }
      orderError = err || orderError;
      // if duplicate order_number or other transient error, retry
      console.warn('Order insert attempt failed (will retry):', attempt, orderError);
    }

    if (orderError || !order) {
      console.error('Funnel order creation error:', orderError);
      return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
    }

    // Insert order_items; only attach product_id if the product exists
    const productIds = items.map((it: any) => it.productId).filter(Boolean);
    let existingProductIds = new Set<string>();
    if (productIds.length > 0) {
      try {
        const { data: productsList } = await supabase
          .from('products')
          .select('id')
          .in('id', productIds);
        if (Array.isArray(productsList)) existingProductIds = new Set(productsList.map((p: any) => p.id));
      } catch (e) {
        console.warn('Product lookup failed during funnel create', e);
      }
    }

    // If some productIds were provided but not found, create placeholder products so
    // order_items can satisfy NOT NULL + FK constraints in the DB.
    const missingProductIds = productIds.filter((pid: string) => !existingProductIds.has(pid));
    if (missingProductIds.length > 0) {
      try {
        // Build a minimal product record for each missing id using the first matching item
        const productsToCreate: any[] = missingProductIds.map((mid) => {
          const sourceItem = items.find((it: any) => it.productId === mid) || {};
          return {
            id: mid,
            name: sourceItem.productName || 'Unknown Product',
            description: sourceItem.productDescription || null,
            price: Number(sourceItem.unitPrice || sourceItem.price || 0),
            stock: 0,
            images: sourceItem.images || [],
            metadata: { _note: 'auto-created placeholder for funnel order', sourceItem: { ...sourceItem } },
            is_active: false
          };
        });

        const { data: createdProducts, error: createErr } = await supabase
          .from('products')
          .insert(productsToCreate)
          .select('id');

        if (!createErr && Array.isArray(createdProducts)) {
          createdProducts.forEach((p: any) => existingProductIds.add(p.id));
          console.info('Created placeholder products for missing productIds during funnel create:', missingProductIds);
          // Notify admin/webhook about placeholders if configured
          try {
            const webhook = process.env.ADMIN_PLACEHOLDER_WEBHOOK_URL;
            if (webhook) {
              // fire-and-forget; include order id and created product ids for triage
              await fetch(webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'placeholder_products_created',
                  orderId: order.id,
                  createdProductIds: createdProducts.map((p: any) => p.id),
                  customerEmail: customerEmail || null,
                  timestamp: new Date().toISOString()
                })
              });
            }
          } catch (e) {
            console.warn('Failed to notify admin webhook about placeholder products', e);
          }
        } else {
          console.warn('Failed to create placeholder products for funnel create:', createErr);
        }
      } catch (e) {
        console.warn('Unexpected error while creating placeholder products for funnel create', e);
      }
    }

    const orderItems = items.map((item: any) => {
      const row: any = {
        order_id: order.id,
        product_name: item.productName,
        product_price: Number(item.unitPrice || item.price),
        quantity: Number(item.quantity),
        total_price: Number(item.totalPrice || item.total),
        product_snapshot: { ...item, capturedAt: new Date().toISOString() }
      };
        const hasProduct = item.productId && existingProductIds.has(item.productId);
        // Only include product_id if product exists to avoid FK constraint failures
        if (hasProduct) {
          row.product_id = item.productId;
        } else if (item.productId) {
          // annotate snapshot when a productId was provided but not found in products table
          row.product_snapshot._note = "productId provided but not found in products table";
          console.info('Product id not found in products table for funnel create, storing snapshot without FK:', item.productId);
        }
      return row;
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Funnel order items creation error:', itemsError);
      // Rollback order to avoid orphaned orders
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ success: false, error: 'Failed to create order items' }, { status: 500 });
    }

    // Create payment_attempt
    const paymentReference = `QEM_${order.id}_${Date.now()}`;
    const { error: paymentError } = await supabase
      .from('payment_attempts')
      .insert({
        order_id: order.id,
        payment_reference: paymentReference,
        amount: Number(total),
        currency: 'NGN',
        status: 'pending',
        payment_provider: 'paystack',
        created_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error('Funnel payment attempt creation error:', paymentError);
      // rollback
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ success: false, error: 'Failed to create payment attempt' }, { status: 500 });
    }

    // Try to initialize Paystack transaction server-side so Paystack knows the reference
    let paystackAuthorizationUrl: string | null = null;
    let paystackReference: string | null = null;
    try {
      const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
      if (PAYSTACK_SECRET) {
        const initBody = {
          email: customerEmail,
          amount: Math.round(Number(total) * 100), // kobo
          metadata: {
            paymentReference,
            orderId: order.id,
            source: 'quantum-funnel',
            items: items || []
          }
        };
        const resp = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PAYSTACK_SECRET}`
          },
          body: JSON.stringify(initBody)
        });
        const json = await resp.json();
        if (json && json.status === true && json.data) {
          paystackAuthorizationUrl = json.data.authorization_url || null;
          paystackReference = json.data.reference || null;
          // Update payment_attempts with paystack reference if available
          if (paystackReference) {
            await supabase.from('payment_attempts').update({ paystack_reference: paystackReference }).eq('payment_reference', paymentReference);
          }
        } else {
          console.warn('Paystack initialize returned non-ok', json);
        }
      } else {
        console.warn('PAYSTACK_SECRET_KEY not configured, skipping server-side initialize');
      }
    } catch (e) {
      console.warn('Failed to initialize Paystack transaction', e);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentReference,
      amount: Number(total),
      paystackAuthorizationUrl,
      paystackReference
    }, { status: 201 });

  } catch (error) {
    console.error('Funnel create API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
