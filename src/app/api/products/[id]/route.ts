import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
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

    // Use explicit presence checks so falsy/empty values (0, empty string, empty array) are handled
    if (Object.prototype.hasOwnProperty.call(updateData, 'name')) updateFields.name = updateData.name;
    if (Object.prototype.hasOwnProperty.call(updateData, 'description')) updateFields.description = updateData.description;
    if (Object.prototype.hasOwnProperty.call(updateData, 'price')) updateFields.price = Number(updateData.price);
    if (Object.prototype.hasOwnProperty.call(updateData, 'categoryId')) updateFields.category_id = updateData.categoryId || null;
    if (Object.prototype.hasOwnProperty.call(updateData, 'images')) updateFields.images = updateData.images || [];
    if (Object.prototype.hasOwnProperty.call(updateData, 'stock')) updateFields.stock = Number(updateData.stock);
    if (Object.prototype.hasOwnProperty.call(updateData, 'isActive')) updateFields.is_active = !!updateData.isActive;
    if (Object.prototype.hasOwnProperty.call(updateData, 'featured')) updateFields.featured = !!updateData.featured;

    // Handle metadata updates: merge existing metadata with incoming keys explicitly
    const incomingMetadata: any = {};
    if (Object.prototype.hasOwnProperty.call(updateData, 'weight')) incomingMetadata.weight = updateData.weight;
    if (Object.prototype.hasOwnProperty.call(updateData, 'dimensions')) incomingMetadata.dimensions = updateData.dimensions;
    if (Object.prototype.hasOwnProperty.call(updateData, 'tags')) incomingMetadata.tags = updateData.tags;
    if (Object.keys(incomingMetadata).length > 0) {
      updateFields.metadata = {
        ...(product.metadata || {}),
        ...incomingMetadata
      };
    }

    // Perform update and return the updated row so clients can confirm
    const { data: updated, error } = await supabase
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      data: updated,
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
