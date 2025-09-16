import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/requireAdmin';
import { supabase } from '../../../../supabaseClient';
import { createClient } from '@supabase/supabase-js';

const serverSupabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
import { Category, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: { id: string };
}

// ============================================================================
// GET SINGLE CATEGORY BY ID (Supabase)
// ============================================================================
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Category>>> {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }
    // Fetch category from Supabase
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !category) {
      return NextResponse.json({
        success: false,
        error: error?.message || 'Category not found'
      }, { status: 404 });
    }
    // Get product count for this category
  const { count: productCount, error: prodCountError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('is_active', true);
    if (prodCountError) {
      return NextResponse.json({
        success: false,
        error: prodCountError.message
      }, { status: 500 });
    }
    // Attach productCount to metadata
    const result: Category = {
      ...category,
      metadata: {
        ...(category.metadata || {}),
        productCount: productCount || 0
      }
    };
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch category'
    }, { status: 500 });
  }
}

// ============================================================================
// UPDATE CATEGORY (Supabase)
// ============================================================================
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const auth = await requireAdminApi(req);
  if (auth) return auth;
  try {
    const { id } = params;
    const updateData = await req.json();
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }
    // Prepare update fields
    // Use camelCase for type safety, then map to snake_case for DB
    const updateFields: Partial<Category> = {
      updatedAt: new Date().toISOString()
    };
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.image !== undefined) updateFields.image = updateData.image;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.sortOrder !== undefined) updateFields.sortOrder = updateData.sortOrder;
    // Handle metadata updates
    if (updateData.tags) {
      updateFields.metadata = {
        ...(updateData.metadata || {}),
        tags: updateData.tags
      };
    }
    // Map camelCase to snake_case for Supabase
    const dbFields: any = {
      ...(updateFields.name !== undefined && { name: updateFields.name }),
      ...(updateFields.description !== undefined && { description: updateFields.description }),
      ...(updateFields.image !== undefined && { image: updateFields.image }),
      ...(updateFields.isActive !== undefined && { is_active: updateFields.isActive }),
      ...(updateFields.sortOrder !== undefined && { sort_order: updateFields.sortOrder }),
      ...(updateFields.metadata !== undefined && { metadata: updateFields.metadata }),
      updated_at: updateFields.updatedAt,
    };
    const { error } = await supabase
      .from('categories')
      .update(dbFields)
      .eq('id', id);
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category'
    }, { status: 500 });
  }
}

// ============================================================================
// DELETE CATEGORY (SOFT DELETE)
// ============================================================================
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const auth = await requireAdminApi(req);
  if (auth) return auth;
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    // Check if category has active products in Supabase
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id)
      .eq('is_active', true);
    if (prodError) throw prodError;
    if (products && products.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete category with ${products.length} active products. Please move or delete products first.`
      }, { status: 400 });
    }

    // Hard delete: permanently remove the category if no products
    const { error } = await serverSupabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Category permanently deleted'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category'
    }, { status: 500 });
  }
}
