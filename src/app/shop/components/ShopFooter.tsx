export default function ShopFooter() {
  return (
    <footer className="w-full bg-gray-50 border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
          <div className="text-xl font-bold">thecoachamara</div>
          <div className="text-sm text-gray-600 mt-2">Empowering lives with quantum energy products.</div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium mb-2">Newsletter</div>
          <div className="flex gap-2">
            <input placeholder="Your email" className="p-2 border rounded w-full" />
            <button className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded">Subscribe</button>
          </div>
        </div>
        <div className="text-sm text-gray-600">© {new Date().getFullYear()} thecoachamara</div>
      </div>
    </footer>
  );
}
