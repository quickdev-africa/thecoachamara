import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
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
      filteredCategories = filteredCategories.filter(category => category.isActive);
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
    const category: Omit<Category, 'id'> = {
      name: categoryData.name,
      description: categoryData.description || '',
      image: categoryData.image || '',
      isActive: categoryData.isActive !== false, // Default to true
      sortOrder: categoryData.sortOrder || 0,
      metadata: {
        productCount: 0, // Will be updated when products are added
        tags: categoryData.tags || []
      },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          ...category,
          created_at: category.createdAt,
          updated_at: category.updatedAt,
        }
      ])
  .select('id')
      .single();

    if (error) {
      throw error;
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
