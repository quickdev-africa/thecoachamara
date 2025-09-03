"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';
import type { Product, Category } from '@/lib/types';

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
            <img src={img} alt={`thumb-${i}`} className="object-cover w-12 h-12" />
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
            <img src={p.images[0]} alt={p.name} className="object-contain w-full h-32" />
          ) : (
            <div className="w-full h-32 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">No Image</div>
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

  function handleAddToCart() {
    addToCart({ id: product.id, name: product.name, price: Number(product.price || 0), image: images[0] });
    try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.name} added to cart` } })); } catch (e) {}
  }

  function handleBuyNow() {
  addToCart({ id: product.id, name: product.name, price: Number(product.price || 0), image: images[0] });
  try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.name} added — redirecting to checkout` } })); } catch (e) {}
  // Open cart drawer for visibility, then navigate to checkout shortly after
  try { window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { id: product.id, name: product.name } })); } catch(e){}
  setTimeout(() => router.push('/shop/checkout'), 300);
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
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
              <div className="text-yellow-500 font-extrabold text-3xl mb-2">₦{Number(product.price || 0).toLocaleString()}</div>
              {category && <div className="text-sm text-gray-700 mb-2">Category: <span className="font-semibold">{category.name}</span></div>}
              <div className="text-base leading-relaxed text-gray-900 mb-4 whitespace-pre-line">{product.description}</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button onClick={() => { handleAddToCart(); try { window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { id: product.id, name: product.name } })); } catch(e){} }} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded text-sm font-medium shadow-sm text-center">Add to cart</button>
                <button onClick={() => { handleBuyNow(); try { window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { id: product.id, name: product.name } })); } catch(e){} }} className="flex-0 bg-black hover:bg-gray-900 text-white px-3 py-2 rounded text-sm font-medium shadow-sm">Buy now</button>
              </div>
              <TrustBadges />
            </aside>
          </div>
        </div>
      </main>
      <RecentBuyersPopup productName={product.name} />
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {related && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">People also bought</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => <RelatedProductTile key={p.id} p={p} />)}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
