"use client";
import React from "react";
import Link from "next/link";
import { useCart, CartItem } from "@/app/shop/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const subtotal = items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-amber-500 text-center">Your Cart</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded shadow p-6 mb-8 text-center text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <div className="bg-white rounded shadow p-4 mb-8 divide-y divide-gray-100">
          {items.map((item: CartItem) => (
            <div key={item.id} className="flex items-center gap-4 py-4">
              <img src={item.image || "/logo.png"} alt={item.name} className="w-16 h-16 object-contain bg-gray-50 rounded" />
              <div className="flex-1">
                <div className="font-semibold text-black">{item.name}</div>
                <div className="text-amber-600 font-bold">₦{item.price.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-7 h-7 rounded bg-gray-200 text-black font-bold">-</button>
                  <span className="px-2">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded bg-gray-200 text-black font-bold">+</button>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-600 hover:underline ml-2">Remove</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <div className="text-lg font-bold">Subtotal:</div>
        <div className="text-2xl text-amber-600 font-bold">₦{subtotal.toLocaleString()}</div>
      </div>
      <div className="flex gap-4 justify-center">
        <Link href="/shop" className="bg-black text-white px-6 py-2 rounded hover:bg-amber-600 transition">Continue Shopping</Link>
        {items.length > 0 && (
          <Link href="/shop/checkout" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded font-semibold transition">Checkout</Link>
        )}
        {items.length > 0 && (
          <button onClick={clearCart} className="bg-gray-200 text-black px-6 py-2 rounded font-semibold hover:bg-gray-300 transition">Clear Cart</button>
        )}
      </div>
    </main>
  );
}
