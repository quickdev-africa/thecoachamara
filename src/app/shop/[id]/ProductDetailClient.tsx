"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';
import type { Product, Category } from '@/lib/types';
// SiteHeader removed here — use global header from root layout

function RecentBuyersPopup({ productName }: { productName: string }) {
  const names = [
    'Chinedu', 'Ngozi', 'Amara', 'Tunde', 'Fatima', 'Bola', 'Uche', 'Aisha', 'Emeka', 'Kemi'
  ];
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * names.length));
  useEffect(() => {
    const id = setInterval(() => setCurrent((s) => (s + 1) % names.length), 4500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white shadow-lg rounded-xl px-5 py-3 flex items-center gap-3 border border-amber-200">
        <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">{names[current][0]}</span>
        <span className="text-gray-900 text-sm font-medium"><span className="font-semibold">{names[current]}</span> bought this in the last 24 hours</span>
      </div>
    </div>
  );
}

function ProductImageGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);
  if (!images || images.length === 0) return <div className="w-full h-80 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">No image</div>;
  return (
    <div>
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <img src={images[selected]} alt={`image-${selected}`} className="object-contain w-full h-80" />
      </div>
      <div className="flex gap-2 mt-2 justify-center">
        {images.map((img, i) => (
          <button key={img + i} className={`w-12 h-12 rounded border-2 ${i === selected ? 'border-amber-500' : 'border-transparent'} overflow-hidden`} onClick={() => setSelected(i)}>
            <img src={img} alt={`thumb-${i}`} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="flex gap-4 items-center mt-2 mb-6 flex-wrap">
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">🔒 Secure Checkout</div>
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">💸 Money-back Guarantee</div>
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">🤝 24/7 Support</div>
    </div>
  );
}

function RelatedProductTile({ p }: { p: Product }) {
  const { addToCart } = useCart();
  return (
    <div className="group">
      <a href={`/shop/${p.id}`} className="block">
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {p.images && p.images.length > 0 ? (
            <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">No Image</div>
          )}
        </div>
      </a>
      <div className="mt-2 text-sm font-medium text-gray-900">{p.name}</div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-xs text-gray-900 font-semibold">₦{Number(p.price || 0).toLocaleString()}</div>
        <button onClick={() => { addToCart({ id: p.id, name: p.name, price: Number(p.price || 0), image: p.images?.[0] }); try{ window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${p.name} added to cart` } })); }catch(e){} }} className="ml-2 px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-black text-xs rounded">Add</button>
      </div>
    </div>
  );
}

export default function ProductDetailClient({ product, related, category }: { product: Product, related: Product[], category?: Category | null }) {
  const images = product.images && product.images.length ? product.images : ['/image_pro.jpg'];
  const { addToCart } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState<number>(1);

  function handleAddToCart() {
    const times = Math.max(1, Math.min(99, Number(qty || 1)));
  addToCart({ id: product.id, name: product.name, price: Number(product.price || 0), image: images[0] }, times);
  try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.name} added to cart (${times})` } })); } catch {}
  }

  // replaced by WhatsApp flow (see button markup)
  function handleBuyNow() {
    // fallback: add single and go to checkout
    addToCart({ id: product.id, name: product.name, price: Number(product.price || 0), image: images[0] });
    try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.name} added — redirecting to checkout` } })); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { id: product.id, name: product.name } })); } catch(e){}
    setTimeout(() => router.push('/shop/checkout'), 350);
  }

  return (
    <>
      <main className="w-full bg-white min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <a href="/shop" className="mb-6 text-yellow-600 hover:underline inline-block">← Back to Shop</a>
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 flex items-start justify-center">
              <div className="w-full">
                <img src={images[0]} alt={product.name} className="object-contain w-full h-[420px] md:h-[520px] bg-gray-50 rounded-xl shadow-lg" />
              </div>
            </div>
            <aside className="flex-1 flex flex-col justify-start">
              <h1 className="text-5xl md:text-4xl font-extrabold text-gray-900 mb-3">{product.name}</h1>
              <div className="text-yellow-500 font-extrabold text-3xl md:text-4xl mb-3">₦{Number(product.price || 0).toLocaleString()}</div>
              {category && <div className="text-base text-gray-800 mb-2">Category: <span className="font-semibold">{category.name}</span></div>}
              <div className="text-lg leading-relaxed text-gray-900 mb-4 whitespace-pre-line">{product.description}</div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <label className="text-base text-gray-800 mr-2">Qty</label>
                  <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-lg">−</button>
                    <input value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} className="w-20 text-center text-lg py-2 text-gray-900 font-medium" />
                    <button onClick={() => setQty(q => Math.min(99, q + 1))} className="px-3 py-2 text-lg">+</button>
                  </div>
                </div>

                <button type="button" onClick={() => { handleAddToCart(); }} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded text-lg font-semibold shadow-sm text-center cursor-pointer">Add to cart</button>

                

                {/* WhatsApp button like ProductCard */}
                <a href={`https://wa.me/${'+2348012345678'.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (ID: ${product.id}). Is it available?`)}`} target="_blank" rel="noreferrer" className="flex-0 inline-flex items-center gap-2 px-3 py-2 rounded border-2 border-yellow-400 text-black bg-white hover:bg-yellow-50">
                  <img src="/whatsapp-mobile.jpg" alt="WhatsApp" className="block sm:hidden w-6 h-6 rounded-full object-cover" />
                  <svg className="hidden sm:inline w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.95 11.95 0 0012.04.01C5.95.01.98 4.98.98 11.06c0 1.95.5 3.85 1.44 5.55L.02 23l6.57-1.7a11.04 11.04 0 005.45 1.33h.02c6.09 0 11.06-4.97 11.06-11.05a11.9 11.9 0 00-2.6-7.1zM12.04 20.1h-.01c-1.67 0-3.3-.45-4.72-1.3l-.34-.2-3.9 1.01 1.04-3.8-.21-.38A8.95 8.95 0 013.1 11.06c0-4.97 4.03-9 8.95-9 2.39 0 4.64.93 6.33 2.62a8.92 8.92 0 012.62 6.32c0 4.97-4.02 9-8.96 9z"/></svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
              <TrustBadges />
            </aside>
          </div>
        </div>
      </main>
      <RecentBuyersPopup productName={product.name} />
      <section className="max-w-7xl mx-auto px-4 md:px-8 bg-white py-8 rounded-lg mt-8">
        {related && related.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">People also bought</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.slice(0,4).map((p) => (
                <div key={p.id} className="bg-white rounded-lg shadow-sm p-4">
                  <a href={`/shop/${p.id}`} className="block w-full h-44 overflow-hidden rounded">
                    <img src={p.images && p.images[0] ? p.images[0] : '/logo.png'} alt={p.name} className="w-full h-full object-cover" />
                  </a>
                  <div className="mt-3 text-sm font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-amber-600 font-semibold">₦{Number(p.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
