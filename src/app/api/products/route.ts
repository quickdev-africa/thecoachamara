// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock,
        is_active,
        category_id,
        categories!inner(name)
      `)
      .eq('is_active', true);

    if (category) {
      if (category === 'quantum') {
        query = query.ilike('name', '%quantum%');
      } else {
        query = query.eq('categories.name', category);
      }
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch products'
      }, { status: 500 });
    }

    // If no quantum products found, return fallback data
    if (category === 'quantum' && (!products || products.length === 0)) {
      const fallbackProducts = [
        {
          id: 'quantum-full-payment',
          name: 'Quantum Machine - Full Payment',
          description: 'Complete ownership with maximum savings',
          price: 2800000,
          stock: 10,
          is_active: true,
          category_id: null
        },
        {
          id: 'quantum-installment',
          name: 'Quantum Machine - Installment Plan',
          description: 'Easy payment plan - ₦1.5M down payment',
          price: 1500000,
          stock: 10,
          is_active: true,
          category_id: null
        }
      ];

      return NextResponse.json({
        success: true,
        products: fallbackProducts,
        count: fallbackProducts.length
      });
    }

    return NextResponse.json({
      success: true,
      products: products || [],
      count: products?.length || 0
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, stock, category_id, images, metadata } = body;

    if (!name || !price) {
      return NextResponse.json({
        success: false,
        error: 'Name and price are required'
      }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price: Number(price),
        stock: Number(stock) || 0,
        category_id,
        images: images || [],
        metadata: metadata || {},
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create product'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });

  } catch (error) {
    console.error('Product creation API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}