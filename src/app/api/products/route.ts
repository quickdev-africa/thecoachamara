// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminApi } from '@/lib/requireAdmin';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Keep the category param but ignore it
    // const category = searchParams.get('category');

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
        images,
        metadata,
        categories(name)
      `)
      .eq('is_active', true);

    // Ignore category filter, always return all products
    // if (category) {
    //     query = query.eq('categories.name', category);
    // }

    const { data: products, error } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch products'
      }, { status: 500 });
    }

  // Fallback logic for 'quantum' category is now removed since category is ignored

    return NextResponse.json({
      success: true,
      // Keep `data` for existing callers but also expose `products` to match frontend expectations
      products: products || [],
      data: products || [],
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
  const auth = await requireAdminApi(request);
  if (auth) return auth;
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