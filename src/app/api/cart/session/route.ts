// src/app/api/cart/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, customerId } = body;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    // Create or update cart session
    const { data: cartSession, error } = await supabase
      .from('cart_sessions')
      .upsert({
        session_id: sessionId,
        customer_id: customerId || null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Cart session creation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create cart session'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cartSession
    });

  } catch (error) {
    console.error('Cart session API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    const { data: cartSession, error } = await supabase
      .from('cart_sessions')
      .select(`
        *,
        cart_items (
          *,
          products (
            id,
            name,
            price,
            images
          )
        )
      `)
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Cart session fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Cart session not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      cartSession
    });

  } catch (error) {
    console.error('Cart session fetch API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}