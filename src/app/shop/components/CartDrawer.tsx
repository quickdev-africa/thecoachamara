"use client";
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '../CartContext';

export default function CartDrawer({ onClose }: { onClose?: () => void }) {
  const { items, updateQuantity, removeFromCart, clearCart, getItemCount } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // focus trap: keep focus inside drawer
    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const drawer = drawerRef.current as HTMLElement | null;
    const nodes = drawer ? Array.from(drawer.querySelectorAll<HTMLElement>(focusable)) : [];
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (first) first.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
      if (e.key === 'Tab') {
        if (!nodes.length) return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  return (
    // backdrop + drawer container
    <div className="fixed inset-0 z-50 flex" aria-hidden={false}>
      {/* backdrop (behind drawer) */}
  <motion.button aria-label="Close cart" onClick={onClose} className="absolute inset-0 z-40 bg-black" initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }} />

      {/* drawer (on top) */}
      <motion.aside ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="cart-title" className="ml-auto w-full sm:w-[420px] md:w-96 h-full bg-white shadow-2xl p-6 flex flex-col z-50 text-gray-900" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
            <div className="text-sm text-gray-800">{getItemCount()} item{getItemCount() !== 1 ? 's' : ''}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button data-close-button type="button" onClick={onClose} aria-label="Close cart" className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400">Close</button>
          </div>
        </div>

        {/* content: items or empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
            <svg className="w-20 h-20 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 19a1 1 0 11-2 0 1 1 0 012 0zm-8 0a1 1 0 11-2 0 1 1 0 012 0z" fill="currentColor" />
            </svg>
            <div className="text-lg font-medium text-gray-900">Your cart is empty</div>
            <div className="text-sm text-gray-700">Add products to your cart and they'll appear here.</div>
            <div className="mt-4 w-full">
              <Link href="/shop" className="block text-center px-4 py-3 bg-black text-white rounded">Continue shopping</Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto mt-4">
            <ul className="divide-y">
              {items.map(i => (
                <li key={i.id} className="py-4 flex gap-4">
                  <img src={i.image || '/logo.png'} alt={i.name} className="w-20 h-20 flex-shrink-0 object-cover rounded-md bg-gray-50" />
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-semibold text-gray-900 text-sm md:text-base">{i.name}</div>
                      <div className="text-sm font-semibold text-amber-600">₦{i.price.toLocaleString()}</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-md p-2">
                        <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(i.id, Math.max(1, i.quantity - 1))} className="w-9 h-9 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 cursor-pointer text-lg">−</button>
                        <div className="px-4 text-base font-medium text-gray-900">{i.quantity}</div>
                        <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(i.id, i.quantity + 1)} className="w-9 h-9 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 cursor-pointer text-lg">+</button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(i.id)} className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

  {/* footer: sticky subtotal and actions */}
  <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Subtotal</div>
            <div className="text-lg font-bold text-gray-900">₦{subtotal.toLocaleString()}</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/shop/checkout" className={`flex-1 text-center px-4 py-3 rounded ${items.length === 0 ? 'bg-gray-300 text-gray-700 pointer-events-none' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>Proceed to Checkout</Link>
            <button type="button" onClick={() => clearCart()} className="px-4 py-3 rounded border border-gray-200 text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400">Clear cart</button>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
