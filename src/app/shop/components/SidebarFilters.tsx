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
          <button onClick={() => { const q = new URLSearchParams(window.location.search); if (min) q.set('min', min); else q.delete('min'); if (max) q.set('max', max); else q.delete('max'); window.location.search = q.toString(); }} className="px-3 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 text-black rounded text-sm w-full font-semibold">Apply</button>
        </div>

      {/* Promotional / information block under filters */}
      <div className="mt-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Why choose our Quantum Energy products?</h4>
        <ul className="space-y-2 text-sm font-semibold text-gray-900">
          <li className="flex items-start gap-2"><span className="text-amber-500">✅</span> <span>Empower your body to heal itself naturally</span></li>
          <li className="flex items-start gap-2"><span className="text-amber-500">✅</span> <span>Relieve pain, stress, and fatigue</span></li>
          <li className="flex items-start gap-2"><span className="text-amber-500">✅</span> <span>Boost immunity and energy levels</span></li>
          <li className="flex items-start gap-2"><span className="text-amber-500">✅</span> <span>Protect against pollution, toxins, and harmful radiation</span></li>
          <li className="flex items-start gap-2"><span className="text-amber-500">✅</span> <span>Support long-term wellness — with no side effects</span></li>
        </ul>
        <p className="mt-3 text-sm font-semibold text-gray-800">Each product is a one-time investment in your health. Safe for all ages, trusted globally, and built to last.</p>
      </div>
      </div>
    </div>
  );
}
