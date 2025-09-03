"use client";
import { useState, useEffect } from "react";
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from "../shop/CartContext";
import CartDrawer from "../shop/components/CartDrawer";
import SiteToast from "./SiteToast";
import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { getItemCount } = useCart();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('cart:item-added', handler as EventListener);
    return () => window.removeEventListener('cart:item-added', handler as EventListener);
  }, []);

  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow">
      <div className="bg-amber-500 text-black text-sm md:text-base py-1 px-2 text-center font-semibold tracking-wide">
        <a href="/quantum" className="block w-full hover:underline">
          <span className="inline-flex items-center justify-center gap-2 w-full">
            <span className="truncate whitespace-nowrap max-w-[95%]">Discount offer on Quantum Machine – Hospital in the home!</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </a>
      </div>
      <nav className="flex items-center justify-between px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="CoachAmara logo" width={36} height={36} priority />
            <span className="text-2xl font-extrabold tracking-tight text-yellow-400 hover:text-yellow-300 transition">CoachAmara</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4 md:gap-6">
          <Link href="/about" className="px-3 py-2 rounded text-sm md:text-base font-medium text-white hover:text-yellow-400">About</Link>
          <Link href="/contact" className="px-3 py-2 rounded text-sm md:text-base font-medium text-white hover:text-yellow-400">Maralis Solutions</Link>
          <Link href="/shop" className="px-3 py-2 rounded text-sm md:text-base font-medium text-white hover:text-yellow-400">Shop</Link>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Cart" onClick={() => setOpen(true)} className="relative p-2 rounded-full hover:bg-gray-800 transition">
            <FaShoppingCart size={18} />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full px-1.5 py-0.5">{getItemCount()}</span>
          </button>
          <Link href="/signin" className="p-2 rounded-full hover:bg-gray-800 transition"><FaUser size={18} /></Link>
        </div>
      </nav>
      {open && <CartDrawer onClose={() => setOpen(false)} />}
  <SiteToast />
    </header>
  );
}
