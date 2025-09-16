"use client";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from "../shop/CartContext";
import CartDrawer from "../shop/components/CartDrawer";
import { createPortal } from 'react-dom';
import SiteToast from "./SiteToast";
import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  // Hide header on specific pages that should not render the global header
  const [hidden, setHidden] = useState(false);
  const { getItemCount } = useCart();
  const [count, setCount] = useState<number>(() => getItemCount());

  useEffect(() => {
  // initial mount handled below by pathname effect
    const handler = () => setOpen(true);
    window.addEventListener('cart:item-added', handler as EventListener);
    const updateBadge = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (typeof detail?.count === 'number') setCount(detail.count);
        else setCount(getItemCount());
      } catch {
        setCount(getItemCount());
      }
    };
    window.addEventListener('cart:updated', updateBadge as EventListener);
    return () => {
      window.removeEventListener('cart:item-added', handler as EventListener);
      window.removeEventListener('cart:updated', updateBadge as EventListener);
    };
  }, [getItemCount]);

  // update hidden state whenever the pathname changes (so header reappears on checkout)
  const pathname = usePathname();
  useEffect(() => {
    try {
      const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
    const hidePaths = ['/join', '/order-quantum-machine', '/quantum', '/shop/checkout', '/admin'];
      if (hidePaths.includes(path) || hidePaths.some(p => path.startsWith(p + '/'))) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      // if navigating to checkout, make sure the cart drawer is closed
      if (path === '/shop/checkout' || path.startsWith('/shop/checkout/')) {
        setOpen(false);
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  // Avoid returning early (which would change hook order). Hide via CSS instead.
  const headerClass = hidden ? 'hidden' : 'bg-[rgba(6,7,11,0.96)] text-white sticky top-0 z-50 backdrop-blur-sm border-b border-gray-800';

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    // focus first link in menu when opened
    setTimeout(() => {
      const el = document.querySelector('.mobile-menu-first') as HTMLElement | null;
      el?.focus();
    }, 50);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Close mobile menu on route change and lock body scroll when open
  useEffect(() => {
    if (mobileOpen) {
      try { document.body.style.overflow = 'hidden'; } catch {}
    } else {
      try { document.body.style.overflow = ''; } catch {}
    }
  }, [mobileOpen]);

  useEffect(() => {
    // any navigation should close the mobile menu
    setMobileOpen(false);
  }, [pathname]);

  return (
  <header className={headerClass}>
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
      <nav className="flex items-center justify-between px-4 py-3 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="CoachAmara logo" width={40} height={40} priority />
            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-yellow-400 hover:text-yellow-300 transition">CoachAmara</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/about" className="px-3 py-2 rounded text-sm md:text-base font-medium text-gray-200 hover:text-yellow-400 transition-colors">About</Link>
          <Link href="/shop" className="px-3 py-2 rounded text-sm md:text-base font-medium text-gray-100 hover:text-yellow-400 transition-colors">Maralis Solutions</Link>
          <Link href="/talktoamara" className="px-3 py-2 rounded text-sm md:text-base font-medium text-gray-200 hover:text-yellow-400 transition-colors">Talk to Amara</Link>
          <Link href="/contact" className="px-3 py-2 rounded text-sm md:text-base font-medium text-gray-200 hover:text-yellow-400 transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Cart" onClick={() => setOpen(true)} className="relative p-2 rounded-full hover:bg-gray-800/40 transition">
            <FaShoppingCart size={18} />
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full px-1.5 py-0.5">{count}</span>
          </button>
          <Link href="/signup" className="p-2 rounded-full hover:bg-gray-800/40 transition"><FaUser size={18} /></Link>
          {/* Mobile menu button */}
          <button aria-label="Menu" className="md:hidden p-2 ml-1 rounded-full hover:bg-gray-800/40 transition" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </nav>
      {/* Mobile menu overlay + panel (render only when open) */}
      {mobileOpen && (
        <>
          {/* backdrop to close on outside click */}
          <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden w-full absolute left-0 top-full z-40" aria-hidden={!mobileOpen}>
            <div className="bg-[rgba(6,7,11,0.98)] border-t border-gray-800">
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
                {/* Order: About, Maralis Solutions, Talk to Amara, Contact */}
                <Link href="/about" onClick={() => setMobileOpen(false)} className="mobile-menu-first block px-3 py-3 rounded text-lg font-semibold text-gray-100 hover:bg-gray-800/30">About</Link>
                <Link href="/shop" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded text-lg font-medium text-gray-200 hover:bg-gray-800/30">Maralis Solutions</Link>
                <Link href="/talktoamara" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded text-lg font-medium text-gray-200 hover:bg-gray-800/30">Talk to Amara</Link>
                <Link href="/contact" onClick={() => setMobileOpen(false)} className="block px-3 py-3 rounded text-lg font-medium text-gray-200 hover:bg-gray-800/30">Contact</Link>
              </div>
            </div>
          </div>
        </>
      )}
  {/* render the cart drawer in a portal so it overlays the whole page and isn't affected by header stacking contexts */}
  {typeof document !== 'undefined' ? createPortal(open ? <CartDrawer onClose={() => setOpen(false)} /> : null, document.body) : null}
  <SiteToast />
    </header>
  );
}
