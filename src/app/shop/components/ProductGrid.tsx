"use client";
import { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import { productService } from '@/lib/api';
import type { Product } from '@/lib/types';

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productService.getAll({ limit: pageSize, offset: page * pageSize } as any)
      .then((res: any) => {
        if (!mounted) return;
        const dat = res.data || res.products || [];
        setProducts((p) => page === 0 ? dat : [...p, ...dat]);
        // If returned less than pageSize, no more results
        if (!dat || dat.length < pageSize) setHasMore(false);
      })
      .catch((e) => console.error('Failed to load products', e))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [page]);

  // IntersectionObserver to auto-load next page
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading && hasMore) {
          setPage((s) => s + 1);
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  return (
    <div>
      {loading && products.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-72 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-8" />

      <div className="mt-6 flex justify-center">
        {!hasMore ? (
          <div className="text-sm text-gray-500">No more products</div>
        ) : (
          <div className="text-sm text-gray-500">{loading ? 'Loading...' : 'Scroll to load more'}</div>
        )}
      </div>
    </div>
  );
}
