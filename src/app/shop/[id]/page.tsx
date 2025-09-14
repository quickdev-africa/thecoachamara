import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import ProductDetailClient from './ProductDetailClient';
import type { Product } from '@/lib/types';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
// Server component: fetch product and render client interactive component

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-red-600">Product not found.</div>;
  }

  // Fetch product server-side using service role key for reliable access
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error('[ProductDetailPage] product fetch error:', { id, error });
    return <div className="max-w-3xl mx-auto py-16 text-center text-red-600">Product not found.</div>;
  }

  // Fetch related products (simple: other active products)
  const { data: allProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(12);

  const related = (allProducts || []).filter((p: Product) => p.id !== product.id).slice(0, 8);

  return <ProductDetailClient product={product as Product} related={related as Product[]} />;
}
