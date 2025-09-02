"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Products", href: "/admin/products" },
  { name: "Categories", href: "/admin/categories" },
  { name: "Customers", href: "/admin/customers" },
  { name: "Orders", href: "/admin/orders" },
  { name: "Payments", href: "/admin/payments" },
  // Payment Events removed from sidebar
  { name: "Email Queue", href: "/admin/email-queue" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
  <div className="min-h-screen flex flex-col bg-baby_powder-500">
      {/* Top nav for mobile */}
      <nav className="flex md:hidden items-center justify-between bg-gray-900 border-b border-sunglow-200 px-4 py-3 sticky top-0 z-20">
        <span className="text-lg font-bold text-sunglow-400 tracking-wide">Admin</span>
        <button
          className="text-white focus:outline-none"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </nav>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-sunglow-200 px-4 py-2 flex flex-col gap-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors duration-200 ${pathname === item.href ? "bg-yellow-300 text-gray-900 shadow" : "text-white hover:bg-sunglow-100 hover:text-sunglow-400"}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
      {/* Sidebar for desktop */}
      <div className="flex-1 flex flex-col md:flex-row">
        <aside className="hidden md:flex md:w-64 bg-gray-900 shadow-lg flex-col p-6 border-r border-sunglow-200 min-h-screen">
          <h2 className="text-2xl font-bold text-sunglow-400 mb-8 tracking-wide">Admin</h2>
          <nav className="flex flex-col gap-2 w-full">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${pathname === item.href ? "bg-yellow-300 text-gray-900 shadow" : "text-white hover:bg-sunglow-100 hover:text-sunglow-400"}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-10 bg-baby_powder-500">{children}</main>
      </div>
    </div>
  );
}
