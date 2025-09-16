"use client";
import { useState } from 'react';

export default function SortDropdown() {
  const [value, setValue] = useState('latest');
  function apply(v: string) {
    setValue(v);
    const q = new URLSearchParams(window.location.search);
    q.set('sort', v);
    window.location.search = q.toString();
  }
  return (
    <div className="text-sm">
      <label className="mr-2 text-black font-medium">Sort:</label>
      <select value={value} onChange={(e) => apply(e.target.value)} className="p-2 border rounded border-gray-200 text-black bg-white">
        <option value="latest">Latest</option>
        <option value="price_asc">Price low → high</option>
        <option value="price_desc">Price high → low</option>
        <option value="popular">Popularity</option>
      </select>
    </div>
  );
}
