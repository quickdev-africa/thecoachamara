// src/app/api/funnel/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import serverSupabase from '@/lib/serverSupabase';

const supabase = serverSupabase;

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

    // Accept delivery fields either nested under `delivery` or at top-level (many clients use both shapes)
    const incomingDelivery = delivery || {};
    const shippingAddress = incomingDelivery?.shippingAddress || body.shippingAddress || body.shipping_address || null;
    const pickupLocation = incomingDelivery?.pickupLocation || body.pickupLocation || body.pickup_location || null;
    const deliveryMethod = incomingDelivery?.method || body.deliveryMethod || body.delivery_method || null; // 'pickup' | 'shipping'
    const shippingState = (shippingAddress && (shippingAddress.state || shippingAddress.shipping_state)) || incomingDelivery?.state || body.shippingState || body.shipping_state || null;
    const customerState = body.customerState || null;

    // productId as a top-level field is legacy; require customer info and items instead
    if (!customerName || !customerEmail || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize delivery info and prepare order payload
    const orderPayloadBase: any = {
  // attach user_id when available (created below)
  user_id: null,
      customerName,
      customerEmail,
      customerPhone,
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      total: Number(total),
      status: 'pending',
      paymentStatus: 'pending',
      delivery_method: deliveryMethod,
      shipping_address: shippingAddress ? shippingAddress : null,
      pickup_location: pickupLocation ? pickupLocation : null,
      shipping_state: shippingState,
      customer_state: customerState,
      // persist a normalized delivery JSON for compatibility and future-proofing
      delivery: {
        ...(incomingDelivery || {}),
        method: deliveryMethod,
        shippingAddress: shippingAddress || null,
        pickupLocation: pickupLocation || null,
        state: shippingState || (incomingDelivery && (incomingDelivery.state || incomingDelivery.shipping_state)) || null
      },
      metadata: {
        ...metadata,
        source: 'quantum-funnel',
        createdAt: new Date().toISOString(),
        customerState: customerState,
      },
      items // store snapshot
    };

    // Attempt to auto-create a user account/profile so checkout continues smoothly.
    // This is best-effort and will not block payment if it fails.
    let createdUserId: string | null = null;
    try {
      if (customerEmail) {
        // check existing profile
        const { data: existing } = await supabase.from('user_profiles').select('id').eq('email', customerEmail).maybeSingle();
        if (existing && existing.id) {
          createdUserId = existing.id;
        } else {
          // try to create an auth user via service-role admin API (best-effort)
          try {
            // @ts-ignore - admin API may not be typed here
            if (typeof (supabase.auth as any)?.admin?.createUser === 'function') {
              const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
              try {
                // create auth user
                // @ts-ignore
                const createResp: any = await (supabase.auth as any).admin.createUser({
                  email: customerEmail,
                  password: tempPassword,
                  email_confirm: true,
                  user_metadata: { name: customerName }
                });
                createdUserId = createResp?.user?.id || null;
                // store a hint in metadata so notify can mention account created (do NOT send raw password by default)
                if (createdUserId) orderPayloadBase.metadata = { ...(orderPayloadBase.metadata || {}), accountCreated: true };
              } catch (e) {
                // ignore auth create failure, fall back to profile insert
                createdUserId = null;
              }
            }
          } catch (e) {
            // ignore
          }

          // If auth user wasn't created, create a user_profiles row so we have a customer record
          if (!createdUserId) {
            try {
              const { data: up } = await supabase.from('user_profiles').insert({ name: customerName, email: customerEmail, phone: customerPhone, joined_at: new Date().toISOString(), is_active: true }).select('id').maybeSingle();
              if (up && up.id) createdUserId = up.id;
            } catch (e) {
              // ignore
            }
          }
        }
      }
    } catch (e) {
      console.warn('Auto-create user/profile failed', e);
    }

    if (createdUserId) orderPayloadBase.user_id = createdUserId;

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

    // Ensure top-level delivery columns are set (some clients store delivery at top-level)
    try {
      const { data: updatedOrder, error: updateErr } = await supabase.from('orders').update({
        delivery_method: deliveryMethod || null,
        shipping_address: shippingAddress || null,
        pickup_location: pickupLocation || null,
        shipping_state: shippingState || null
      }).eq('id', order.id).select().maybeSingle();
      if (updateErr) {
        console.warn('Failed to persist top-level delivery columns on order', updateErr);
      } else {
        console.info('Persisted top-level delivery columns on order', updatedOrder?.id || order.id);
        // update local order reference so downstream logic sees persisted values
        order = { ...order, ...updatedOrder };
      }
    } catch (e) {
      console.warn('Failed to persist top-level delivery columns on order', e);
    }

    // Ensure top-level delivery columns are persisted (some clients store delivery at top-level)
    try {
      const updatePayload: any = {};
      if (deliveryMethod !== null) updatePayload.delivery_method = deliveryMethod;
      if (shippingAddress !== null) updatePayload.shipping_address = shippingAddress;
      if (pickupLocation !== null) updatePayload.pickup_location = pickupLocation;
      if (shippingState !== null) updatePayload.shipping_state = shippingState;
      // also ensure the normalized delivery JSON is stored
      updatePayload.delivery = {
        ...(incomingDelivery || {}),
        method: deliveryMethod,
        shippingAddress: shippingAddress || null,
        pickupLocation: pickupLocation || null,
        state: shippingState || null
      };
      if (Object.keys(updatePayload).length > 0) {
        await supabase.from('orders').update(updatePayload).eq('id', order.id);
      }
    } catch (e) {
      console.warn('Failed to persist top-level delivery columns on order:', e);
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
    // Map from incoming productId (may be external non-UUID) -> actual product UUID created
    const externalToCreatedId: Record<string, string> = {};
    if (missingProductIds.length > 0) {
      try {
        // Helper to test valid uuid (simple regex)
        const isUuid = (v: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);

        const productsToCreate: any[] = missingProductIds.map((mid) => {
          const sourceItem = items.find((it: any) => it.productId === mid) || {};
          // If incoming id is not a UUID, generate a new UUID for the placeholder product
          const assignedId = isUuid(mid) ? mid : (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : null);
          if (!assignedId) {
            // fallback to creating without explicit id (DB will generate one if default exists)
          }
          // remember mapping from external mid -> assignedId (or null)
          externalToCreatedId[mid] = assignedId || '';
          return {
            ...(assignedId ? { id: assignedId } : {}),
            name: sourceItem.productName || 'Unknown Product',
            description: sourceItem.productDescription || null,
            price: Number(sourceItem.unitPrice || sourceItem.price || 0),
            stock: 0,
            images: sourceItem.images || [],
            metadata: { _note: 'auto-created placeholder for funnel order', externalProductId: mid, sourceItem: { ...sourceItem } },
            is_active: false
          };
        });

        const { data: createdProducts, error: createErr } = await supabase
          .from('products')
          .insert(productsToCreate)
          .select('id');

        if (!createErr && Array.isArray(createdProducts)) {
          // Add created ids to existingProductIds and fix mapping where DB generated id differs
          createdProducts.forEach((p: any, idx: number) => {
            existingProductIds.add(p.id);
            const incoming = missingProductIds[idx];
            if (incoming && p.id) externalToCreatedId[incoming] = p.id;
          });
          console.info('Created placeholder products for missing productIds during funnel create:', missingProductIds);
          try {
            const webhook = process.env.ADMIN_PLACEHOLDER_WEBHOOK_URL;
            if (webhook) {
              await fetch(webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'placeholder_products_created',
                  orderId: order.id,
                  createdProductIds: createdProducts.map((p: any) => p.id),
                  externalIds: missingProductIds,
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
  product_price: Number(item.unitPrice || item.price || 0),
  quantity: Number(item.quantity || 0),
  // Ensure total_price is always a number. Prefer explicit totalPrice/total from client,
  // otherwise compute as product_price * quantity to avoid inserting null/NaN into DB.
  total_price: Number(item.totalPrice ?? item.total ?? (Number(item.unitPrice || item.price || 0) * Number(item.quantity || 0))),
        product_snapshot: { ...item, capturedAt: new Date().toISOString() }
      };
      const providedId = item.productId;
      // Prefer existing product id
      if (providedId && existingProductIds.has(providedId)) {
        row.product_id = providedId;
      } else if (providedId && externalToCreatedId[providedId]) {
        // Use placeholder product id created above (may be DB-generated or assigned UUID)
        row.product_id = externalToCreatedId[providedId];
      } else if (providedId) {
        // No product id available - annotate snapshot but leave product_id absent
        row.product_snapshot._note = 'productId provided but not found in products table';
        console.info('Product id not found in products table for funnel create, storing snapshot without FK:', providedId);
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
        email: customerEmail,
        phone: customerPhone,
        payment_reference: paymentReference,
        amount: Number(total),
        currency: 'NGN',
        status: 'pending',
        payment_provider: 'paystack',
        metadata: {
          customerEmail,
          customerPhone,
          delivery: {
            delivery_method: deliveryMethod,
            shipping_address: shippingAddress,
            pickup_location: pickupLocation,
            shipping_state: shippingState,
          },
          orderSnapshot: order,
          items
        },
        initiated_at: new Date().toISOString(),
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
    // Prefer a runtime-derived base URL (useful in local dev where NEXT_PUBLIC_BASE_URL may point to a different port)
    const host = request.headers.get('host') || '';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const envBase = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
    const runtimeBase = envBase || (host ? `${proto}://${host.replace(/\/+$/, '')}` : '');
    // Use the hosted callback endpoint so the server can verify the transaction and then redirect to the public thank-you page
    const callbackUrl = runtimeBase ? `${runtimeBase}/api/paystack/hosted/callback` : null;
        const initBody = {
          email: customerEmail,
          amount: Math.round(Number(total) * 100), // kobo
          // ask Paystack to redirect back to our thank-you page after payment
          ...(callbackUrl ? { callback_url: callbackUrl } : {}),
          metadata: {
            paymentReference,
            orderId: order.id,
            source: 'quantum-funnel',
            items: items || [],
            delivery: {
              delivery_method: deliveryMethod,
              shipping_address: shippingAddress,
              pickup_location: pickupLocation,
              shipping_state: shippingState,
              customer_state: customerState
            },
            customerPhone: customerPhone
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
