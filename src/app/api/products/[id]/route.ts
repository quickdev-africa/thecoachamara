import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../supabaseClient';
import { Product, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: { id: string };
}

// ============================================================================
// GET SINGLE PRODUCT BY ID (Supabase)
// ============================================================================
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch product'
    }, { status: 500 });
  }
}

// ============================================================================
// UPDATE PRODUCT (Supabase)
// ============================================================================
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const { id } = params;
    const updateData = await req.json();
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }
    // Check if product exists
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, metadata')
      .eq('id', id)
      .single();
    if (fetchError || !product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }
    // Prepare update fields (snake_case for DB)
    const updateFields: any = {
      updated_at: new Date().toISOString()
    };
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description) updateFields.description = updateData.description;
    if (updateData.price !== undefined) updateFields.price = parseFloat(updateData.price);
    if (updateData.categoryId) updateFields.category_id = updateData.categoryId;
    if (updateData.images) updateFields.images = updateData.images;
    if (updateData.stock !== undefined) updateFields.stock = updateData.stock;
    if (updateData.isActive !== undefined) updateFields.is_active = updateData.isActive;
    if (updateData.featured !== undefined) updateFields.featured = updateData.featured;
    // Handle metadata updates
    if (updateData.weight || updateData.dimensions || updateData.tags) {
      updateFields.metadata = {
        ...(product.metadata || {}),
        ...(updateData.weight && { weight: updateData.weight }),
        ...(updateData.dimensions && { dimensions: updateData.dimensions }),
        ...(updateData.tags && { tags: updateData.tags })
      };
    }
    const { error } = await supabase
      .from('products')
      .update(updateFields)
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
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product'
    }, { status: 500 });
  }
}

// ============================================================================
// DELETE PRODUCT (SOFT DELETE, Supabase)
// ============================================================================
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }
    // Check if product exists in Supabase
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    if (fetchError || !product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }
    // Hard delete: permanently remove the product
    const { error } = await supabase
      .from('products')
      .delete()
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
      message: 'Product permanently deleted'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product'
    }, { status: 500 });
  }
}
