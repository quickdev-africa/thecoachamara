
import ShopHeader from "./components/ShopHeader";
import SidebarFilters from "./components/SidebarFilters";
import ProductGrid from "./components/ProductGrid";
import ShopFooter from "./components/ShopFooter";
import SortDropdown from "./components/SortDropdown";
import "./styles/shop.css";

export default function ShopPage() {
  return (
  <div className={`font-shop min-h-screen flex flex-col bg-white`}>
      {/* Header */}
      <ShopHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 px-4 md:px-8 py-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-60 mb-8 md:mb-0">
          <SidebarFilters />
        </aside>

        {/* Product Grid Section */}
        <section className="flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-black">Shop</h1>
            <SortDropdown />
          </div>
          <ProductGrid />
        </section>
      </main>

      {/* Footer */}
      <ShopFooter />
    </div>
  );
}
