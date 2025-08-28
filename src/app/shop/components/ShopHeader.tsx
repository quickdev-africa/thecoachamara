
import { FaShoppingCart, FaUser, FaSearch } from "react-icons/fa";
import Link from "next/link";
import '../styles/shop.css';

export default function ShopHeader() {
  return (
  <header className={`w-full bg-black text-white border-b border-gray-200 sticky top-0 z-30`}> 
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold tracking-tight text-yellow-400">thecoachamara</span>
        </div>
        {/* Center: Navigation */}
        <nav className="hidden md:flex gap-6 text-base font-medium">
          <a href="#" className="hover:text-yellow-400 transition">Home</a>
          <a href="#" className="hover:text-yellow-400 transition">About</a>
          <a href="#" className="hover:text-yellow-400 transition">Contact Us</a>
        </nav>
        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <button aria-label="Search" className="p-2 rounded-full hover:bg-gray-800 transition"><FaSearch size={20} /></button>
          <Link href="/shop/cart" className="relative p-2 rounded-full hover:bg-gray-800 transition" aria-label="Cart">
            <FaShoppingCart size={20} />
            {/* Cart count badge (to be connected to cart context) */}
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full px-1.5 py-0.5">0</span>
          </Link>
          <button aria-label="Account" className="p-2 rounded-full hover:bg-gray-800 transition"><FaUser size={20} /></button>
        </div>
      </div>
    </header>
  );
}
