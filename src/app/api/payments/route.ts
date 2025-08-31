import { NextRequest, NextResponse } from 'next/server';


import { supabase } from '../../../supabaseClient';
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
  try {
    // Extract search params more efficiently
    const url = req.nextUrl;
    const pageLimit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const email = url.searchParams.get('email');

    // Build Supabase query
    let queryBuilder = supabase
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

    return NextResponse.json({
      success: true,
      data: payments || [],
      meta: {
        total: payments ? payments.length : 0
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

    const { data, error } = await supabase
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
