import Link from 'next/link';
import { useCart } from '../CartContext';
import type { Product } from '@/lib/types';

const WHATSAPP_PHONE = '+2348012345678';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const thumb = product.images && product.images.length ? product.images[0] : '/logo.png';
  const price = Number(product.price || 0);
  const waLink = `https://wa.me/${WHATSAPP_PHONE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (ID: ${product.id}). Is it available?`)}`;

  return (
  <div className="bg-white shadow-md rounded-lg overflow-hidden group border border-gray-100 transform transition-all duration-150 hover:shadow-lg hover:-translate-y-1">
  <Link href={`/shop/${product.id}`} className="relative w-full h-40 sm:h-48 md:h-56 bg-gray-100 flex items-center justify-center">
        <img src={thumb} alt={product.name} className="object-cover w-full h-full" />
      </Link>
      <div className="p-2 sm:p-3">
  <Link href={`/shop/${product.id}`} className="text-sm font-semibold text-black line-clamp-2 block hover:underline">{product.name}</Link>
        <div className="mt-1 text-yellow-500 font-extrabold text-sm sm:text-base">₦{price.toLocaleString()}</div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            onClick={() => { addToCart({ id: product.id, name: product.name, price, image: thumb }); try { window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `${product.name} added to cart` } })); } catch(e){} }}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded text-sm font-medium shadow-sm text-center"
          >
            Add to cart
          </button>
          <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Contact on WhatsApp" title="Contact on WhatsApp" className="flex-0 inline-flex items-center gap-2 px-1 py-0 w-10 h-10 justify-center rounded-full sm:w-auto sm:h-auto sm:px-3 sm:py-2 sm:rounded border-2 border-yellow-400 text-black hover:bg-yellow-50 bg-white">
            {/* mobile: use exact JPG placed at /public/whatsapp-mobile.jpg */}
            <img src="/whatsapp-mobile.jpg" alt="WhatsApp" className="block sm:hidden w-6 h-6 rounded-full object-cover" />
            {/* desktop/tablet: show inline svg + label */}
            <svg className="hidden sm:inline w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.95 11.95 0 0012.04.01C5.95.01.98 4.98.98 11.06c0 1.95.5 3.85 1.44 5.55L.02 23l6.57-1.7a11.04 11.04 0 005.45 1.33h.02c6.09 0 11.06-4.97 11.06-11.05a11.9 11.9 0 00-2.6-7.1zM12.04 20.1h-.01c-1.67 0-3.3-.45-4.72-1.3l-.34-.2-3.9 1.01 1.04-3.8-.21-.38A8.95 8.95 0 013.1 11.06c0-4.97 4.03-9 8.95-9 2.39 0 4.64.93 6.33 2.62a8.92 8.92 0 012.62 6.32c0 4.97-4.02 9-8.96 9z"/></svg>
            <span className="hidden sm:inline text-black">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
