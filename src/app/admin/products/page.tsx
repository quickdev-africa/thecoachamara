
"use client";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { uploadProductImage } from "../../../utils/uploadProductImage";


const pageSize = 10;


type Product = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
  stock?: number;
  // For UI rendering only:
  categoryName?: string;
};


type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
  metadata?: any;
};


export default function ProductsPage() {
  // Collapsible form state
  const [showForm, setShowForm] = useState(false);
  // Pagination state
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", category: "", image: "", description: "", stock: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const startEdit = (product: Product & { stock?: number }) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category || "",
      image: product.image || "",
      description: product.description || "",
      stock: product.stock !== undefined ? product.stock.toString() : "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    // Validate stock
    const stockValue = parseInt(editForm.stock, 10);
    if (isNaN(stockValue) || stockValue <= 0) {
      setError("Stock must be a positive integer");
      setEditSubmitting(false);
      return;
    }
    await fetch(`/api/products/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        price: parseFloat(editForm.price),
        stock: stockValue,
      }),
    });
    setEditingId(null);
    setEditSubmitting(false);
    fetchProducts();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", price: "", category: "", newCategory: "", image: "", description: "", stock: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);


  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const response = await res.json();
    let productsArr: any[] = [];
    if (Array.isArray(response)) {
      productsArr = response;
    } else if (response && Array.isArray(response.data)) {
      productsArr = response.data;
    }
    // Attach category name from categories if possible
    const productsWithCategory = productsArr.map(product => {
      let categoryName = "-";
      if (product.category_id && categories.length > 0) {
        const cat = categories.find(c => c.id === product.category_id);
        if (cat) categoryName = cat.name;
      }
      // Stock fallback
      let stock = typeof product.stock === 'number' ? product.stock : (product.stock ?? 0);
      // Image fallback (array or string)
      let image = '';
      if (Array.isArray(product.images) && product.images.length > 0) image = product.images[0];
      else if (typeof product.image === 'string') image = product.image;
      return { ...product, categoryName, stock, image };
    });
    setProducts(productsWithCategory);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Cloudinary direct upload (client-side only)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Enforce file size < 500KB
    if (file.size > 500 * 1024) {
      setError("Image must be less than 500KB");
      return;
    }
    // Enforce file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Image must be JPEG, PNG, or WebP format");
      return;
    }
    setUploading(true);
    setError("");
    setImageUploaded(false);
    try {
      const url = await uploadProductImage(file);
      setForm(f => ({ ...f, image: url }));
      setImageUploaded(true);
    } catch {
      setError("Image upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    let categoryId: string | null = null;
    let categoryName = form.category;
    if (form.newCategory.trim()) {
      categoryName = form.newCategory.trim();
      // Check if category already exists
      let found = categories.find(cat => cat.name === categoryName);
      if (!found) {
        // Create new category
        try {
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: categoryName })
          });
          const data = await res.json();
          if (res.ok && data && data.data && data.data.id) {
            categoryId = data.data.id;
            // Refetch categories and update dropdown
            await fetchCategories();
          } else {
            setError(data?.error || "Failed to create new category");
            setSubmitting(false);
            return;
          }
        } catch (err) {
          setError("Failed to create new category");
          setSubmitting(false);
          return;
        }
      } else {
        categoryId = found.id;
      }
    } else if (form.category) {
      const found = categories.find(cat => cat.name === form.category);
      if (found) categoryId = found.id;
    }
    // categoryId is now optional; do not error if not present
    // Validate stock
    const stockValue = parseInt(form.stock, 10);
    if (isNaN(stockValue) || stockValue <= 0) {
      setError("Stock must be a positive integer");
      setSubmitting(false);
      return;
    }
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        categoryId: categoryId || null,
        price: parseFloat(form.price),
        stock: stockValue,
      }),
    });
    if (!res.ok) {
      let errorMsg = "Failed to add product";
      try {
        const errorData = await res.json();
        if (errorData && errorData.error) errorMsg = errorData.error;
      } catch {}
      setError(errorMsg);
    } else {
      setForm({ name: "", price: "", category: "", newCategory: "", image: "", description: "", stock: "" });
      setSuccess("Product added successfully!");
      setImageUploaded(false);
      setShowForm(false); // Hide the form after successful creation
      await fetchCategories();
      await fetchProducts();
      setTimeout(() => setSuccess(""), 2000);
    }
    setSubmitting(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-black tracking-wide">Product Management</h1>
      <p className="mb-4 text-gray-700">Here you can add, edit, and manage your products.</p>
      <button
        className="mb-4 bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-4 py-2 shadow border border-sunglow-400 transition-colors duration-200"
        onClick={() => setShowForm(f => !f)}
      >
        {showForm ? 'Hide Add Product Form' : '+ Add Product'}
      </button>
      {showForm && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-blue_gray-100">
          <h2 className="text-lg font-semibold mb-4 text-blue_gray-500 border-b pb-2">Add New Product</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="stock" className="text-sm font-medium text-blue_gray-400 mb-1">Stock<span className="text-red-500">*</span></label>
            <input
              id="stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock Quantity"
              type="number"
              min="1"
              step="1"
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-blue_gray-400 mb-1">Product Name<span className="text-red-500">*</span></label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="text-sm font-medium text-blue_gray-400 mb-1">Price<span className="text-red-500">*</span></label>
            <input
              id="price"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium text-blue_gray-400 mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            >
              <option value="">Select Category</option>
              {categories.filter(cat => cat.isActive !== false).map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="newCategory" className="text-sm font-medium text-blue_gray-400 mb-1">Or Add New Category</label>
            <input
              id="newCategory"
              name="newCategory"
              value={form.newCategory}
              onChange={handleChange}
              placeholder="New Category"
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label htmlFor="imageUpload" className="text-sm font-medium text-blue_gray-400 mb-1">Product Image</label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            />
            <div className="flex items-center gap-2 mt-1">
              {uploading && <span className="text-xs text-blue_gray-400 animate-pulse">Uploading...</span>}
              {!uploading && imageUploaded && <span className="text-xs text-green-700">Image uploaded!</span>}
              {form.image && (
                <Image src={form.image} alt="Preview" width={80} height={80} className="w-20 h-20 object-cover rounded border" />
              )}
            </div>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="Image URL"
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 mt-2 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label htmlFor="description" className="text-sm font-medium text-blue_gray-400 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            />
          </div>
          <button
            type="submit"
            className="bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-4 py-2 md:col-span-2 shadow mt-2 transition-colors duration-200 disabled:opacity-60 border border-sunglow-400"
            disabled={submitting || !form.name || !form.price || !form.stock}
          >
            {submitting ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Adding...</span>
            ) : "Add Product"}
          </button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-700 mt-2 font-semibold">{success}</div>}
        </div>
      )}
      <div className="bg-baby_powder-900 rounded-xl shadow p-2 md:p-6 border border-blue_gray-100">
        {loading ? (
          <div>Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-gray-900 font-semibold">No products found.</div>
        ) : (
          <div className="overflow-x-auto" style={{ maxHeight: '28rem', minHeight: '8rem', overflowY: 'auto' }}>
            <table className="min-w-full text-left text-xs md:text-base sticky">
              <thead className="sticky top-0 bg-baby_powder-900 z-10">
                <tr>
                  <th className="py-2 text-gray-900 font-bold">Name</th>
                  <th className="py-2 text-gray-900 font-bold">Price</th>
                  <th className="py-2 text-gray-900 font-bold">Category</th>
                  <th className="py-2 text-gray-900 font-bold">Stock</th>
                  <th className="py-2 text-gray-900 font-bold">Image</th>
                  <th className="py-2 text-gray-900 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                <tr key={product.id} className="border-t text-gray-900 font-semibold align-top">
                  {editingId === product.id ? (
                    <>
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          placeholder="Product Name"
                          className="w-full border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                          required
                        />
                      </td>
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                          placeholder="Price"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                          required
                        />
                      </td>
                      <td className="py-2 px-2 align-middle">
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="w-full border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500"
                        >
                          <option value="">Select Category</option>
                          {categories.filter(cat => cat.isActive !== false).map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="stock"
                          value={editForm.stock}
                          onChange={handleEditChange}
                          placeholder="Stock Quantity"
                          type="number"
                          min="1"
                          step="1"
                          className="w-full border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                          required
                        />
                      </td>
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="image"
                          value={editForm.image}
                          onChange={handleEditChange}
                          placeholder="Image URL"
                          className="w-full border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                        />
                      </td>
                      <td className="py-2 px-2 align-middle">
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          placeholder="Description"
                          className="w-full border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100 resize-none"
                          rows={1}
                        />
                      </td>
                      <td className="py-2 px-2 align-middle flex flex-col gap-2 md:flex-row md:gap-2">
                        <button
                          type="button"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-3 py-1"
                          onClick={handleEditSubmit}
                          disabled={editSubmitting}
                        >
                          {editSubmitting ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-gray-500 hover:underline px-2 py-1"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">{
                        new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(product.price)
                      }</td>
                      <td className="py-2">{product.categoryName || "-"}</td>
                      <td className="py-2">{product.stock}</td>
                      <td className="py-2">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} width={60} height={60} className="object-cover rounded border bg-gray-100" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
                        ) : (
                          <Image src="/logo.png" alt="No image" width={60} height={60} className="object-cover rounded border bg-gray-100" />
                        )}
                      </td>
                      <td className="py-2 flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-3 py-1 text-xs shadow border border-sunglow-400 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold rounded-lg px-3 py-1 text-xs shadow border border-red-500 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination Controls */}
        {products.length > pageSize && (
          <div className="flex justify-end items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded border bg-white text-gray-900 disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
