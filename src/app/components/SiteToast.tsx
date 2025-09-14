"use client";
import { useEffect, useState } from 'react';

export default function SiteToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: string; name?: string } | undefined;
      const name = detail?.name || 'Item';
      setMsg(`${name} added to cart`);
      // auto-hide after 2.5s
      setTimeout(() => setMsg(null), 2500);
    };
    window.addEventListener('cart:item-added', handler as EventListener);
    return () => window.removeEventListener('cart:item-added', handler as EventListener);
  }, []);

  if (!msg) return null;
  return (
    <div aria-live="polite" className="fixed right-4 bottom-6 z-60">
      <div className="bg-black text-white px-4 py-2 rounded shadow-lg">{msg}</div>
    </div>
  );
}
