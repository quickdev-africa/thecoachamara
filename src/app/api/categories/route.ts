import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
import { createClient } from '@supabase/supabase-js';

// Server-side service role client (used for privileged writes from server routes)
const serverSupabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
import { Category, ApiResponse } from '@/lib/types';



// ============================================================================
// GET ALL CATEGORIES
// ============================================================================
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Category[]>>> {
  try {
    // Extract search params more efficiently
    const url = req.nextUrl;
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    // Build Supabase query
    let queryBuilder = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    const { data: categories, error } = await queryBuilder;
    if (error) {
      throw error;
    }

    let filteredCategories = categories || [];
    if (!includeInactive) {
      // DB returns snake_case columns; check is_active
      filteredCategories = filteredCategories.filter((category: any) => category.is_active);
    }

    return NextResponse.json({
      success: true,
      data: filteredCategories,
      meta: {
        total: filteredCategories.length
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    }, { status: 500 });
  }
}

// ============================================================================
// CREATE NEW CATEGORY
// ============================================================================
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const categoryData = await req.json();

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    // Create category with standardized structure
    const now = new Date().toISOString();

    // Log incoming category payload for diagnostics
    // eslint-disable-next-line no-console
    console.log('[api/categories] create payload:', categoryData);

    const insertRow: any = {
      name: categoryData.name,
      description: categoryData.description || '',
      image: categoryData.image || '',
      is_active: categoryData.isActive !== false,
      sort_order: categoryData.sortOrder || 0,
      metadata: {
        productCount: 0,
        tags: categoryData.tags || []
      },
      created_at: now,
      updated_at: now
    };

  const { data, error } = await serverSupabase
      .from('categories')
      .insert([insertRow])
      .select('id')
      .single();

    // Log Supabase response for diagnostics
    // eslint-disable-next-line no-console
    console.log('[api/categories] supabase insert response:', { data, error: error ? JSON.stringify(error) : null });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message || 'Supabase insert failed',
        supabase: { data, error: error ? JSON.stringify(error) : null }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { id: data.id },
      message: 'Category created successfully'
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category'
    }, { status: 500 });
  }
}
