
import SidebarFilters from "./components/SidebarFilters";
import ProductGrid from "./components/ProductGrid";
// SortDropdown intentionally removed from this layout (unused)
import "./styles/shop.css";
import SiteHero from "../components/SiteHero";
import SiteFooter from "../components/SiteFooter";

export default function ShopPage() {
  return (
    <div className={`font-shop min-h-screen flex flex-col bg-white`}>
      <SiteHero
        heading={(
          <span style={{ color: '#FFD700', textShadow: '0 1px 1px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.35)' }}>
            Maralis Solutions Webstore
          </span>
        )}
        subtext={(
          <span>
            <span className="block">🌍 Discover innovative Quantum Energy and wellness products designed</span>
            <span className="block md:inline"> to heal, energize, and transform lives.</span>
            <span className="block mt-2">✨ Join a global movement where health meets opportunity — empowering you to thrive in wellness and prosperity.</span>
          </span>
        )}
        disableTypewriter={true}
        compact={true}
        hideCTA={true}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 px-4 md:px-8 py-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 mb-8 md:mb-0">
          <SidebarFilters />
        </aside>

        {/* Product Grid Section */}
        <section className="flex-1 flex flex-col">
          <ProductGrid />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
