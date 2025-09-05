"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  // addToCart now accepts an optional quantity (default 1)
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function addToCart(item: Omit<CartItem, "quantity">, quantity: number = 1) {
    const qty = Math.max(1, Math.min(999, Math.floor(quantity || 1)));
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const next = prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
        // emit event so UI can open cart drawer when item is added
        try { window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { id: item.id, name: item.name, quantity: qty } })); } catch (e) {}
        try { window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: next.reduce((s, it) => s + it.quantity, 0) } })); } catch (e) {}
        return next;
      }
      const next = [...prev, { ...item, quantity: qty }];
      try { window.dispatchEvent(new CustomEvent('cart:item-added', { detail: { id: item.id, name: item.name, quantity: qty } })); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: next.reduce((s, it) => s + it.quantity, 0) } })); } catch (e) {}
      return next;
    });
  }

  function removeFromCart(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  }

  function clearCart() {
    setItems([]);
  }

  function getItemCount() {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
}
