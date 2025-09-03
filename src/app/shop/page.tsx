
import SidebarFilters from "./components/SidebarFilters";
import ProductGrid from "./components/ProductGrid";
import SortDropdown from "./components/SortDropdown";
import "./styles/shop.css";
import SiteHeader from "../components/SiteHeader";
import SiteHero from "../components/SiteHero";
import SiteFooter from "../components/SiteFooter";

export default function ShopPage() {
  return (
    <div className={`font-shop min-h-screen flex flex-col bg-white`}>
      <SiteHeader />
      <SiteHero />

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
