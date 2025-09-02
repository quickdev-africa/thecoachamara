import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/requireAdmin';


import serverSupabase from '@/lib/serverSupabase';
import { ApiResponse } from '@/lib/types';

export interface Payment {
  id: string;
  reference: string;
  email: string;
  amount: number;
  productId?: string;
  status: 'pending' | 'success' | 'failed';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// GET ALL PAYMENTS
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Payment[]>>> {
  const auth = await requireAdminApi(req);
  if (auth) return auth;
  try {
    // Extract search params more efficiently
    const url = req.nextUrl;
    const pageLimit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const email = url.searchParams.get('email');

  // Build Supabase query (use server-side client to bypass RLS for admin endpoints)
  let queryBuilder = serverSupabase
      .from('payments')
  .select('*')
  .order('created_at', { ascending: false })
      .limit(pageLimit);

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }
    if (email) {
      queryBuilder = queryBuilder.ilike('email', `%${email}%`);
    }

    const { data: payments, error } = await queryBuilder;
    if (error) {
      throw error;
    }

    // helper: normalize any raw row (from payments or payment_attempts) into Payment
    const toPayment = (r: any): Payment => {
      const id = r.id || r.payment_reference || `${r.order_id || 'noorder'}-${r.initiated_at || r.created_at || ''}`;
      const reference = r.reference || r.payment_reference || r.ref || id;
      const email = r.email || r.paystack_data?.customer?.email || r.orders?.customerEmail || '';
      const amount = r.amount == null ? 0 : Number(r.amount) || 0;
      const productId = r.product_id || r.productId || null;
      const statusRaw = (r.status || r.state || '').toString();
      const status = statusRaw === 'success' ? 'success' : (statusRaw === 'pending' ? 'pending' : 'failed');
      const metadata = r.metadata || r.paystack_data || r.meta || {};
      const createdAt = r.created_at || r.createdAt || r.initiated_at || new Date().toISOString();
      const updatedAt = r.updated_at || r.updatedAt || r.completed_at || new Date().toISOString();
      return {
        id: String(id),
        reference: String(reference),
        email: String(email),
        amount,
        productId: productId ? String(productId) : undefined,
        status: status as Payment['status'],
        metadata,
        createdAt: String(createdAt),
        updatedAt: String(updatedAt)
      };
    };

  // If payments table is empty, fall back to recent payment_attempts (joined to orders)
  if ((!payments || payments.length === 0)) {
      try {
  const { data: attempts, error: attemptsErr } = await serverSupabase
          .from('payment_attempts')
          .select(`
            payment_reference,
            order_id,
            amount,
            payment_provider,
            status,
            initiated_at,
            completed_at,
            paystack_data,
            orders ( id, order_number, customerName, customerEmail, total )
          `)
          .order('initiated_at', { ascending: false })
          .limit(pageLimit);

        if (!attemptsErr && Array.isArray(attempts) && attempts.length > 0) {
          const mapped = attempts.map((a: any) => {
            const p = toPayment({ ...a, metadata: { source: 'payment_attempts', raw: a.paystack_data || a } });
            return p;
          });

          return NextResponse.json({ success: true, data: mapped, meta: { total: mapped.length } });
        }
      } catch (e) {
        // ignore and fall through to return empty list
        console.warn('Fallback to payment_attempts failed', e);
      }
    }

    // Normalize canonical payments rows into the Payment type
    const normalized = Array.isArray(payments) ? payments.map((p: any) => toPayment(p)) : [];
    return NextResponse.json({
      success: true,
      data: normalized,
      meta: {
        total: normalized.length
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payments'
    }, { status: 500 });
  }
}

// ============================================================================
// CREATE NEW PAYMENT RECORD
// ============================================================================
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const auth = await requireAdminApi(req);
  if (auth) return auth;
  try {
    const paymentData = await req.json();

    // Validate required fields
    const requiredFields = ['reference', 'email', 'amount', 'status'];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }

  // Create payment with standardized structure
  // Exclude createdAt/updatedAt from the in-memory payload since we use snake_case timestamps for DB inserts
  const payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> = {
      reference: paymentData.reference,
      email: paymentData.email,
      amount: parseFloat(paymentData.amount),
      productId: paymentData.productId,
      status: paymentData.status,
      metadata: paymentData.metadata || {}
    };

    const now = new Date().toISOString();
    const insertPayload = {
      ...payment,
      created_at: now,
      updated_at: now
    };

  const { data, error } = await serverSupabase
      .from('payments')
      .insert([insertPayload as any])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { id: data.id },
      message: 'Payment record created successfully'
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment'
    }, { status: 500 });
  }
}
