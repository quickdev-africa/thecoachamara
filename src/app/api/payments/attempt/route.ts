// src/app/api/payments/attempt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      paymentReference,
      amount,
      currency = 'NGN',
      paymentProvider = 'paystack'
    } = body;

    if (!orderId || !paymentReference || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: orderId, paymentReference, amount'
      }, { status: 400 });
    }

    // Create payment attempt record
    const { data: paymentAttempt, error } = await supabase
      .from('payment_attempts')
      .insert({
        order_id: orderId,
        payment_reference: paymentReference,
        payment_provider: paymentProvider,
        amount: Number(amount),
        currency,
        status: 'pending',
        attempt_number: 1,
        initiated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Payment attempt creation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment attempt'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paymentAttempt
    }, { status: 201 });

  } catch (error) {
    console.error('Payment attempt API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paymentReference,
      status,
      failureReason,
      paystackData
    } = body;

    if (!paymentReference || !status) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference and status are required'
      }, { status: 400 });
    }

    const updates: any = {
      status,
      completed_at: new Date().toISOString()
    };

    if (failureReason) {
      updates.failure_reason = failureReason;
    }

    if (paystackData) {
      updates.paystack_data = paystackData;
    }

    const { data: paymentAttempt, error } = await supabase
      .from('payment_attempts')
      .update(updates)
      .eq('payment_reference', paymentReference)
      .select()
      .single();

    if (error) {
      console.error('Payment attempt update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update payment attempt'
      }, { status: 500 });
    }

    // If payment successful, update order status
    if (status === 'success') {
      await supabase
        .from('orders')
        .update({
          paymentStatus: 'paid',
          status: 'processing'
        })
        .eq('id', paymentAttempt.order_id);
    }

    return NextResponse.json({
      success: true,
      paymentAttempt
    });

  } catch (error) {
    console.error('Payment attempt update API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentReference = searchParams.get('ref');
    const orderId = searchParams.get('orderId');

    if (!paymentReference && !orderId) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference or order ID is required'
      }, { status: 400 });
    }

    let query = supabase
      .from('payment_attempts')
      .select(`
        *,
        orders (
          id,
          order_number,
          customerName,
          customerEmail,
          total
        )
      `);

    if (paymentReference) {
      query = query.eq('payment_reference', paymentReference);
    } else if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: paymentAttempts, error } = await query;

    if (error) {
      console.error('Payment attempts fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch payment attempts'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paymentAttempts: paymentAttempts || []
    });

  } catch (error) {
    console.error('Payment attempts fetch API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}