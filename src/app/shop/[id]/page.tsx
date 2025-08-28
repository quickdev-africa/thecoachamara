"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
// Recent buyers popup component
function RecentBuyersPopup({ productName }: { productName: string }) {
  const names = [
    "Chinedu", "Ngozi", "Amara", "Tunde", "Fatima", "Bola", "Uche", "Aisha", "Emeka", "Kemi", "Ifeanyi", "Ada", "Seyi", "Blessing", "Gbenga"
  ];
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * names.length));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        let next = Math.floor(Math.random() * names.length);
        // Avoid repeating the same name
        while (next === prev) next = Math.floor(Math.random() * names.length);
        return next;
      });
    }, 4000 + Math.random() * 2000); // 4-6 seconds
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white shadow-lg rounded-xl px-5 py-3 flex items-center gap-3 border border-amber-200 animate-fade-in-up">
        <span className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
          {names[current][0]}
        </span>
        <span className="text-gray-800 text-sm font-medium">
          <span className="font-semibold">{names[current]}</span> bought this in the last 24 hours
        </span>
      </div>
    </div>
  );
}

// --- Product Image Gallery ---
function ProductImageGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0);
  function handleSwipe(dir: 'left' | 'right') {
    setSelected((prev) => {
      if (dir === 'left') return prev === images.length - 1 ? 0 : prev + 1;
      if (dir === 'right') return prev === 0 ? images.length - 1 : prev - 1;
      return prev;
    });
  }
  return (
    <div>
      <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {images[selected] ? (
          <img
            src={images[selected]}
            alt="Product image"
            className="object-contain w-full h-80 select-none"
            onTouchStart={e => {
              const startX = e.touches[0].clientX;
              const handleTouchMove = (ev: TouchEvent) => {
                const diff = ev.touches[0].clientX - startX;
                if (Math.abs(diff) > 50) {
                  handleSwipe(diff < 0 ? 'left' : 'right');
                  window.removeEventListener('touchmove', handleTouchMove);
                }
              };
              window.addEventListener('touchmove', handleTouchMove);
              window.addEventListener('touchend', () => window.removeEventListener('touchmove', handleTouchMove), { once: true });
            }}
          />
        ) : (
          <div className="w-full h-80 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">No Image</div>
        )}
      </div>
      <div className="flex gap-2 mt-2 justify-center">
        {images.map((img, i) => (
          <button
            key={img + i}
            className={`w-12 h-12 rounded border-2 ${i === selected ? 'border-amber-500' : 'border-transparent'} overflow-hidden focus:outline-none`}
            onClick={() => setSelected(i)}
            aria-label={`Show image ${i + 1}`}
          >
            <img src={img} alt="Thumb" className="object-cover w-12 h-12" />
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Trust Badges ---
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

// --- Related Products Carousel ---
function RelatedProducts({ products }: { products: Product[] }) {
  const [start, setStart] = useState(0);
  const visible = 4;
  if (!products.length) return null;
  const show = products.slice(start, start + visible);
  function next() { setStart(s => (s + 1) % (products.length - visible + 1)); }
  function prev() { setStart(s => (s - 1 + (products.length - visible + 1)) % (products.length - visible + 1)); }
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">People also bought</h2>
      <div className="relative">
        {products.length > visible && (
          <>
            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow p-1 hidden md:block" aria-label="Previous" style={{left: -24}}>&lt;</button>
            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow p-1 hidden md:block" aria-label="Next" style={{right: -24}}>&gt;</button>
          </>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {show.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`} className="block group">
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} className="object-contain w-full h-32" />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">No Image</div>
                )}
              </div>
              <div className="mt-2 text-sm font-medium">{p.name}</div>
              <div className="text-xs text-gray-500">₦{p.price?.toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- FAQ Accordion ---
function FAQAccordion({ faqs }: { faqs: { q: string, a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!faqs.length) return null;
  return (
    <div className="mt-12 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
      <div className="divide-y divide-gray-200">
        {faqs.map((faq, i) => (
          <div key={faq.q}>
            <button
              className="w-full text-left py-3 font-medium flex justify-between items-center focus:outline-none"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {faq.q}
              <span>{open === i ? '-' : '+'}</span>
            </button>
            {open === i && <div className="pb-4 text-gray-700 text-sm">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useRouter, useSearchParams } from "next/navigation";
import { productService, categoryService } from "@/lib/api";
import type { Product, Category } from "@/lib/types";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const prodRes = await productService.getById(params.id);
        if (!prodRes.data) throw new Error("Product not found");
        setProduct(prodRes.data && typeof prodRes.data === 'object' && 'id' in prodRes.data ? prodRes.data as Product : null);
        if (prodRes.data && typeof prodRes.data === 'object' && 'category_id' in prodRes.data) {
          const catRes = await categoryService.getById((prodRes.data as Product).category_id);
          setCategory(catRes.data && typeof catRes.data === 'object' && 'id' in catRes.data ? catRes.data as Category : null);
        }
      } catch (err) {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  // --- Fetch related products for carousel ---
  const [related, setRelated] = useState<Product[]>([]);
  useEffect(() => {
    let ignore = false;
    async function fetchRelated() {
      try {
        const res = await productService.getAll();
        if (!ignore && res.data && Array.isArray(res.data)) {
          setRelated(res.data.filter((p: Product) => p.id !== product.id).slice(0, 8));
        }
      } catch {}
    }
    if (product) fetchRelated();
    return () => { ignore = true; };
  }, [product]);

  // --- Example FAQs (could be dynamic per product) ---
  const faqs = [
    { q: "How long does delivery take?", a: "Delivery is typically within 2-5 business days nationwide." },
    { q: "Is there a money-back guarantee?", a: "Yes, we offer a 7-day money-back guarantee if you're not satisfied." },
    { q: "How do I contact support?", a: "You can reach us 24/7 via the chat widget or email support@thecoachamara.com." },
  ];

  // --- Gallery images: support array or fallback to single image ---
  const images = product && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["/public/image_pro.jpg"];

  if (loading) return <div className="max-w-3xl mx-auto py-16 text-center text-gray-700">Loading...</div>;
  if (error || !product) return <div className="max-w-3xl mx-auto py-16 text-center text-red-600">{error || "Product not found."}</div>;

  return (
    <>
      <div className="max-w-5xl mx-auto px-2 py-12 bg-white rounded-xl shadow-md">
        <button onClick={() => router.back()} className="mb-6 text-amber-700 hover:underline">&larr; Back to Shop</button>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1 flex items-center justify-center">
            {/* Big, bold, no margin/padding image gallery */}
            {product && (
              <div className="w-full flex items-center justify-center">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="object-contain w-full h-[420px] md:h-[520px] bg-gray-50 rounded-xl shadow-lg"
                  style={{margin:0, padding:0, maxWidth:'100%'}}
                />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-black hover:text-amber-600 transition mb-2 cursor-pointer" tabIndex={0}>{product.name}</h1>
            <div className="text-amber-600 font-bold text-2xl mb-2">
              {product ? `₦${product.price.toLocaleString()}` : ''}
            </div>
            {category && product && (
              <div className="text-sm text-gray-700 mb-2">Category: <span className="font-semibold">{category.name}</span></div>
            )}
            {product && product.featured && (
              <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded mb-2 self-start font-semibold">Popular</span>
            )}
            <div className="text-gray-800 mb-4 whitespace-pre-line">{product ? product.description : ''}</div>
            {product && (
              <>
                <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded shadow mb-2">Add to Cart</button>
                <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded shadow">Buy Now</button>
              </>
            )}
            <TrustBadges />
          </div>
        </div>
      </div>
      <RecentBuyersPopup productName={product.name} />
      <RelatedProducts products={related} />
      <FAQAccordion faqs={faqs} />
    </>
  );
}
