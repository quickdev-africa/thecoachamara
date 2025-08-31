import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const updateData = body || {};

  const updateFields: any = {
    updated_at: new Date().toISOString()
  };
  if (Object.prototype.hasOwnProperty.call(updateData, 'name')) updateFields.name = updateData.name;
  if (Object.prototype.hasOwnProperty.call(updateData, 'description')) updateFields.description = updateData.description;
  if (Object.prototype.hasOwnProperty.call(updateData, 'price')) updateFields.price = Number(updateData.price);
  if (Object.prototype.hasOwnProperty.call(updateData, 'stock')) updateFields.stock = Number(updateData.stock);
  if (Object.prototype.hasOwnProperty.call(updateData, 'categoryId')) updateFields.category_id = updateData.categoryId || null;
  if (Object.prototype.hasOwnProperty.call(updateData, 'image')) updateFields.image = updateData.image;
  if (Object.prototype.hasOwnProperty.call(updateData, 'images')) updateFields.images = updateData.images || [];

  // Merge metadata explicitly
  const incomingMetadata: any = {};
  if (Object.prototype.hasOwnProperty.call(updateData, 'metadata') && updateData.metadata && typeof updateData.metadata === 'object') {
    Object.assign(incomingMetadata, updateData.metadata);
  }
  if (Object.keys(incomingMetadata).length > 0) {
    // fetch existing metadata first
    const { data: existing, error: fetchErr } = await supabase.from('products').select('metadata').eq('id', id).single();
    const baseMeta = (existing && existing.metadata) ? existing.metadata : {};
    updateFields.metadata = { ...baseMeta, ...incomingMetadata };
  }

  const { data, error } = await supabase
    .from('products')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ success: false, error: error.message, updateFields }, { status: 400 });
  }
  return NextResponse.json({ success: true, data, message: 'Product updated' });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
