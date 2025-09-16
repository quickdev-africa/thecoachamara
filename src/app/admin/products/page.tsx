
"use client";

import Image from 'next/image';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useEffect, useState } from "react";
import { uploadProductImage } from "../../../utils/uploadProductImage";
import type { Product } from "../../../lib/types";


const pageSize = 10;





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
  const [editForm, setEditForm] = useState({ title: "", price: "", category: "", image: "", description: "", inventory: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      // optimistic update
      setProducts(prev => prev.filter(p => p.id !== id));
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error('Delete failed');
      addToast('Product deleted', 'success');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete failed', err);
      addToast('Failed to delete product', 'error');
    }
    await fetchProducts();
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      title: product.name,
      price: product.price.toString(),
      category: product.category_id || "",
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      description: product.description || "",
      inventory: product.stock !== undefined ? product.stock.toString() : "",
    });
  const meta: any = (product as any).metadata || {};
  setTags(Array.isArray(meta.tags) ? meta.tags.join(',') : (meta.tags || '').toString());
  setWeight(meta.weight !== undefined && meta.weight !== null ? String(meta.weight) : '');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    // Validate inventory
    const inventoryValue = parseInt(editForm.inventory, 10);
    if (isNaN(inventoryValue) || inventoryValue <= 0) {
      setError("Inventory must be a positive integer");
      setEditSubmitting(false);
      return;
    }
    const payload: any = {
      name: editForm.title,
      price: parseFloat(editForm.price),
      stock: inventoryValue,
      description: editForm.description,
      images: editForm.image ? [editForm.image] : [],
      categoryId: editForm.category || null,
    };
    if (tags) payload.tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (weight) payload.weight = Number(weight);
    // Helper: transform server product into local table shape
    const transformServerProduct = (product: any) => {
      let image = '';
      if (Array.isArray(product.images) && product.images.length > 0) image = product.images[0];
      else if (typeof product.image === 'string') image = product.image;
      let inventory = typeof product.stock === 'number' ? product.stock : (product.inventory ?? 0);
      let categoryName = "-";
      if (product.category_id && categories.length > 0) {
        const cat = categories.find((c) => c.id === product.category_id);
        if (cat) categoryName = cat.name;
      }
      return { ...product, categoryName, inventory, image };
    };

    // Poll the GET endpoint until the server reflects the expected payload or timeout
    const confirmUpdate = async (id: string, expected: any) => {
      const maxAttempts = 6;
      let attempt = 0;
      let delay = 500; // ms
      const almostEqual = (a: any, b: any) => {
        if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 0.0001;
        return a === b;
      };
      while (attempt < maxAttempts) {
        try {
          const res = await fetch(`/api/products/${id}?_ts=${Date.now()}`);
          if (res.ok) {
            const serverProduct = await res.json();
            // serverProduct may be wrapped in { data: ... } or direct
            const prod = serverProduct && serverProduct.data ? serverProduct.data : serverProduct;
            if (prod && prod.id) {
              const serverTags = (prod.metadata && prod.metadata.tags) || [];
              const serverWeight = prod.metadata && prod.metadata.weight;
              const expectedTags = expected.tags || [];
              const expectedWeight = expected.weight;
              const nameOk = prod.name === expected.name;
              const priceOk = almostEqual(Number(prod.price), Number(expected.price));
              const stockOk = Number(prod.stock) === Number(expected.stock);
              const descOk = (prod.description || '') === (expected.description || '');
              const tagsOk = JSON.stringify(serverTags || []) === JSON.stringify(expectedTags || []);
              const weightOk = (serverWeight === undefined && expectedWeight === undefined) || almostEqual(Number(serverWeight || 0), Number(expectedWeight || 0));
              if (nameOk && priceOk && stockOk && descOk && tagsOk && weightOk) {
                // update local products list with server product
                setProducts(prev => prev.map(p => p.id === id ? transformServerProduct(prod) : p));
                return true;
              }
            }
          }
        } catch (err) {
          // ignore network hiccups and retry
        }
        // wait then retry
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, delay));
        attempt += 1;
        delay *= 2;
      }
      return false;
    };

    try {
      const res = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Update failed');

      // Build expected shape for confirmation
      const expected: any = {
        id: editingId,
        name: payload.name,
        price: payload.price,
        stock: payload.stock,
        description: payload.description,
        tags: payload.tags || [],
        weight: payload.weight,
      };

      const confirmed = await confirmUpdate(editingId, expected);
      if (confirmed) {
        addToast('Product updated (confirmed)', 'success');
      } else {
        addToast('Product update sent — server taking longer to reflect changes, refreshing list', 'info');
        // final reconciliation
        await fetchProducts();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Update failed', err);
      addToast('Failed to update product', 'error');
    }
    setEditingId(null);
    setEditSubmitting(false);
    setTags('');
    setWeight('');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", price: "", category: "", newCategory: "", image: "", description: "", inventory: "" });
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState("");
  const [weight, setWeight] = useState("");
  // toasts
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'info'|'success'|'error' }>>([]);
  const addToast = (message: string, type: 'info'|'success'|'error' = 'info') => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2,8);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
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
      // Inventory fallback
      let inventory = typeof product.inventory === 'number' ? product.inventory : (product.inventory ?? 0);
      // Image fallback (array or string)
      let image = '';
      if (Array.isArray(product.images) && product.images.length > 0) image = product.images[0];
      else if (typeof product.image === 'string') image = product.image;
      return { ...product, categoryName, inventory, image };
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
    const inventoryValue = parseInt(form.inventory, 10);
    if (isNaN(inventoryValue) || inventoryValue <= 0) {
      setError("Inventory must be a positive integer");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.title,
          price: parseFloat(form.price),
          stock: inventoryValue,
          description: form.description,
          images: form.image ? [form.image] : [],
          category_id: categoryId || null,
          metadata: { tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [], weight: weight ? Number(weight) : undefined }
        }),
      });
      if (!res.ok) {
        let errorMsg = "Failed to add product";
        try {
          const errorData = await res.json();
          if (errorData && errorData.error) errorMsg = errorData.error;
        } catch {}
        throw new Error(errorMsg);
      }
      addToast('Product created', 'success');
      setForm({ title: "", price: "", category: "", newCategory: "", image: "", description: "", inventory: "" });
      setTags('');
      setWeight('');
      setSuccess("Product added successfully!");
      setImageUploaded(false);
      setShowForm(false); // Hide the form after successful creation
      await fetchCategories();
      await fetchProducts();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err:any) {
      setError(err?.message || 'Failed to add product');
      addToast('Failed to create product', 'error');
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
            <label htmlFor="inventory" className="text-sm font-medium text-blue_gray-400 mb-1">Inventory<span className="text-red-500">*</span></label>
            <input
              id="inventory"
              name="inventory"
              value={form.inventory}
              onChange={handleChange}
              placeholder="Inventory Quantity"
              type="number"
              min="1"
              step="1"
              className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium text-blue_gray-400 mb-1">Product Title<span className="text-red-500">*</span></label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Product Title"
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
          <div className="flex flex-col gap-1">
            <label htmlFor="tags" className="text-sm font-medium text-blue_gray-400 mb-1">Tags (comma separated)</label>
            <input id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. popular,new" className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="weight" className="text-sm font-medium text-blue_gray-400 mb-1">Weight (kg)</label>
            <input id="weight" name="weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.5" className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-4 py-2 md:col-span-2 shadow mt-2 transition-colors duration-200 disabled:opacity-60 border border-sunglow-400"
            disabled={submitting || !form.title || !form.price || !form.inventory}
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
                  <th className="py-2 text-gray-900 font-bold">Description</th>
                  <th className="py-2 text-gray-900 font-bold">Tags</th>
                  <th className="py-2 text-gray-900 font-bold">Weight</th>
                  <th className="py-2 text-gray-900 font-bold">Image</th>
                  <th className="py-2 text-gray-900 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                <tr key={product.id} className="border-t text-gray-900 font-semibold align-top">
                  {editingId === product.id ? (
                    <>
                      {/* Name */}
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          placeholder="Product Title"
                          className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white placeholder:text-gray-400"
                          required
                        />
                      </td>

                      {/* Price */}
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                          placeholder="Price"
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white placeholder:text-gray-400"
                          required
                        />
                      </td>

                      {/* Category */}
                      <td className="py-2 px-2 align-middle">
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white"
                        >
                          <option value="">Select Category</option>
                          {categories.filter(cat => cat.isActive !== false).map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Stock / Inventory */}
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="inventory"
                          value={editForm.inventory}
                          onChange={handleEditChange}
                          placeholder="Inventory Quantity"
                          type="number"
                          min="0"
                          step="1"
                          className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white placeholder:text-gray-400"
                          required
                        />
                      </td>

                      {/* Description (make roomy) */}
                      <td className="py-2 px-2 align-middle">
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          placeholder="Description"
                          className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white placeholder:text-gray-400 resize-none"
                          rows={3}
                        />
                      </td>

                      {/* Tags */}
                      <td className="py-2 px-2 align-middle">
                        <input name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white placeholder:text-gray-400" />
                      </td>

                      {/* Weight */}
                      <td className="py-2 px-2 align-middle">
                        <input name="weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (kg)" className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white placeholder:text-gray-400" />
                      </td>

                      {/* Image URL */}
                      <td className="py-2 px-2 align-middle">
                        <input
                          name="image"
                          value={editForm.image}
                          onChange={handleEditChange}
                          placeholder="Image URL"
                          className="w-full border rounded-lg px-2 py-1 text-gray-900 bg-white placeholder:text-gray-400"
                        />
                      </td>

                      {/* Actions */}
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
                      <td className="py-2">{
                        (() => {
                          const cat = categories.find(c => c.id === product.category_id);
                          return cat ? cat.name : "-";
                        })()
                      }</td>
                      <td className="py-2">{product.stock}</td>
                      <td className="py-2">{product.description || '-'}</td>
                      <td className="py-2">{(product as any).metadata && (product as any).metadata.tags ? ((product as any).metadata.tags || []).join(',') : '-'}</td>
                      <td className="py-2">{(product as any).metadata && (product as any).metadata.weight ? String((product as any).metadata.weight) : '-'}</td>
                      <td className="py-2">
                        <ImageWithFallback src={product.images && product.images.length > 0 ? product.images[0] : '/logo.png'} alt={product.name} width={60} height={60} />
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
        {/* Toast container */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
          {toasts.map(t => (
            <div key={t.id} className={`px-4 py-2 rounded shadow-md text-sm ${t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
              {t.message}
            </div>
          ))}
        </div>
    </div>
  );
}

// Using shared ImageWithFallback component from src/components
