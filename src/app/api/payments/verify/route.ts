// src/app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

async function verifyPaystackPayment(reference: string) {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Paystack verification error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentReference, paystackReference, status } = body;

    if (!paymentReference) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference is required'
      }, { status: 400 });
    }

    // Get the payment attempt
    const { data: paymentAttempt, error: fetchError } = await supabase
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
      `)
      .eq('payment_reference', paymentReference)
      .single();

    if (fetchError || !paymentAttempt) {
      return NextResponse.json({
        success: false,
        error: 'Payment attempt not found'
      }, { status: 404 });
    }

    let verificationResult = null;
    let finalStatus = status;

    // Verify with Paystack if we have a reference
    if (paystackReference && status === 'success') {
      verificationResult = await verifyPaystackPayment(paystackReference);
      
      if (verificationResult && verificationResult.status === true) {
        const paystackData = verificationResult.data;
        
        // Verify amount matches
        const expectedAmount = Math.round(paymentAttempt.amount * 100); // Convert to kobo
        const paidAmount = paystackData.amount;
        
        if (paidAmount !== expectedAmount) {
          finalStatus = 'failed';
          console.error('Amount mismatch:', { expected: expectedAmount, paid: paidAmount });
        } else {
          finalStatus = 'success';
        }
      } else {
        finalStatus = 'failed';
      }
    }

    // Update payment attempt
    const { error: updateError } = await supabase
      .from('payment_attempts')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        paystack_data: verificationResult?.data || null
      })
      .eq('payment_reference', paymentReference);

    if (updateError) {
      console.error('Payment attempt update error:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update payment attempt'
      }, { status: 500 });
    }

    // Update order status if payment successful
    if (finalStatus === 'success') {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          paymentStatus: 'paid',
          status: 'processing',
          payment_reference: paystackReference || paymentReference,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentAttempt.order_id);

      if (orderUpdateError) {
        console.error('Order update error:', orderUpdateError);
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: paymentAttempt.order_id,
          amount: paymentAttempt.amount,
          status: 'completed',
          payment_method: 'paystack',
          reference: paystackReference || paymentReference,
          created_at: new Date().toISOString()
        });

      if (paymentError) {
        console.error('Payment record creation error:', paymentError);
      }

      // TODO: Trigger email notifications here
      // await triggerOrderConfirmationEmail(paymentAttempt.order_id);
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      paymentAttempt: {
        id: paymentAttempt.id,
        order_id: paymentAttempt.order_id,
        amount: paymentAttempt.amount,
        status: finalStatus
      },
      verification: verificationResult
    });

  } catch (error) {
    console.error('Payment verification API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({
        success: false,
        error: 'Payment reference is required'
      }, { status: 400 });
    }

    // Verify directly with Paystack
    const verificationResult = await verifyPaystackPayment(reference);

    if (!verificationResult) {
      return NextResponse.json({
        success: false,
        error: 'Failed to verify payment with Paystack'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      verification: verificationResult
    });

  } catch (error) {
    console.error('Payment verification GET API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}