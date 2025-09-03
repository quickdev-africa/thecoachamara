"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';
import type { Product, Category } from '@/lib/types';

function TrustBadges() {
  return (
    <div className="flex gap-4 items-center mt-2 mb-6 flex-wrap">
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"><span role="img" aria-label="secure">🔒</span> Secure Checkout</div>
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"><span role="img" aria-label="guarantee">💸</span> Money-back Guarantee</div>
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"><span role="img" aria-label="support">🤝</span> 24/7 Support</div>
      <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"><span role="img" aria-label="fast">⚡</span> Fast Delivery</div>
    </div>
  );
}

export default function ClientProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const images = product && Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/image_pro.jpg'];
  const { addToCart } = useCart();
  const router = useRouter();

  function handleAddToCart() {
    addToCart({ id: product.id, name: product.name, price: Number(product.price || 0), image: images[0] });
    try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.name} added to cart` } })); } catch(e){}
  }

  function handleBuyNow() {
    addToCart({ id: product.id, name: product.name, price: Number(product.price || 0), image: images[0] });
    try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.name} added — redirecting to checkout` } })); } catch(e){}
    router.push('/shop/checkout');
  }

  return (
    <>
      <main className="w-full bg-white min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 flex items-start justify-center">
              <div className="w-full">
                <img src={images[0]} alt={product.name} className="object-contain w-full h-[420px] md:h-[520px] bg-gray-50 rounded-xl shadow-lg transition-transform duration-300 ease-out" />
              </div>
            </div>

            <aside className="flex-1 flex flex-col justify-start">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
              <div className="text-yellow-500 font-extrabold text-3xl mb-2">{`₦${Number(product.price).toLocaleString()}`}</div>
              <div className="text-gray-900 mb-4 whitespace-pre-line">{product.description}</div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button onClick={handleAddToCart} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded shadow">Add to Cart</button>
                <button onClick={handleBuyNow} className="bg-black hover:bg-gray-900 text-white font-semibold px-6 py-3 rounded shadow">Buy Now</button>
              </div>

              <TrustBadges />
            </aside>
          </div>
        </div>
      </main>

      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {related && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">People also bought</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <div key={p.id} className="group">
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
                    <div className="text-xs text-gray-900 font-semibold">₦{Number(p.price).toLocaleString()}</div>
                    <button onClick={() => { addToCart({ id: p.id, name: p.name, price: Number(p.price||0), image: p.images && p.images[0] }); try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${p.name} added to cart` } })); } catch(e){} }} className="ml-2 px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-black text-xs rounded">Add</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
