"use client";
import { useEffect, useState } from 'react';
import { categoryService } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function SidebarFilters() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useEffect(() => {
    let mounted = true;
    categoryService.getAll()
      .then((res: any) => { if (!mounted) return; const data = res.data || []; setCategories(data); })
      .catch(() => {})
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-white rounded p-4 shadow-sm">
      <h3 className="font-semibold mb-3 text-black">Filters</h3>
      <div className="mb-4">
        <label className="text-sm font-medium text-black">Category</label>
        <div className="flex flex-col mt-2 gap-2">
          {categories.map(c => (
            <a key={c.id} href={`?category=${encodeURIComponent(c.id)}`} className="text-sm text-gray-700 hover:underline">{c.name}</a>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-black">Price range</label>
        <div className="flex gap-2 mt-2">
          <input value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min" className="w-1/2 p-2 border rounded" />
          <input value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max" className="w-1/2 p-2 border rounded" />
        </div>
        <div className="mt-2">
          <button onClick={() => { const q = new URLSearchParams(window.location.search); if (min) q.set('min', min); else q.delete('min'); if (max) q.set('max', max); else q.delete('max'); window.location.search = q.toString(); }} className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded text-sm">Apply</button>
        </div>
      </div>
    </div>
  );
}
