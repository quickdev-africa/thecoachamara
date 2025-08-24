
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
import { Product, ApiResponse, PaginationParams } from '@/lib/types';





// ============================================================================
// GET ALL PRODUCTS WITH FILTERING & PAGINATION
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    // Extract search params more efficiently  
  const url = req.nextUrl;
  const categoryId = url.searchParams.get('categoryId');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageLimit = parseInt(url.searchParams.get('limit') || '20');
  // Only allow snake_case fields for sorting
  const allowedSortFields = ['created_at', 'updated_at', 'price', 'name', 'stock'];
  let sortBy = url.searchParams.get('sortBy') || 'created_at';
  if (!allowedSortFields.includes(sortBy)) sortBy = 'created_at';
  const sortOrder = url.searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

    // Build Supabase query
    let queryBuilder = supabase
      .from('products')
      .select('*')
  .order(sortBy, { ascending: sortOrder === 'asc' })
      .limit(pageLimit);

    let { data: products, error } = await queryBuilder;
    if (error) {
      throw error;
    }

    // Filter active products (snake_case)
    products = (products || []).filter(product => product.is_active);

    if (categoryId) {
      products = products.filter(product => product.category_id === categoryId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        (product.metadata?.tags || []).some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    const total = products.length;
    const hasMore = products.length === pageLimit;

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit: pageLimit,
        hasMore
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products'
    }, { status: 500 });
  }
}

// ============================================================================
// CREATE NEW PRODUCT
// ============================================================================
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await req.json();
    const requiredFields = ['name', 'price', 'categoryId', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }

    const imageUrls = body.image ? [body.image] : [];

    // Map camelCase to snake_case for DB
    const now = new Date().toISOString();
    const dbProduct = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      category_id: body.categoryId, // snake_case for DB
      images: imageUrls,
      stock: typeof body.stock === 'number' ? body.stock : parseInt(body.stock, 10) || 0,
      is_active: true,
      featured: false,
      metadata: {
        tags: body.tags ? (Array.isArray(body.tags) ? body.tags : [body.tags]) : []
      },
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { id: data.id },
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product'
    }, { status: 500 });
  }
}
