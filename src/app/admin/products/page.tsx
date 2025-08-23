"use client";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { uploadProductImage } from "../../../utils/uploadProductImage";
import { Product } from "@/lib/types";

type Category = string;

export default function ProductsPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", category: "", image: "", description: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      category: product.categoryId || "",
      image: product.images?.[0] || "",
      description: product.description || "",
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    
    const updateData = {
      name: editForm.name,
      price: parseFloat(editForm.price),
      categoryId: editForm.category,
      description: editForm.description,
      images: editForm.image ? [editForm.image] : []
    };
    
    const res = await fetch(`/api/products/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
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
  const [form, setForm] = useState({ name: "", price: "", category: "", newCategory: "", image: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const response = await res.json();
      
      if (response.success && response.data) {
        setProducts(response.data);
        // Extract unique categories from products
        const uniqueCategories = Array.from(new Set(response.data.map((p: Product) => p.categoryId).filter(Boolean))) as string[];
        setCategories(uniqueCategories);
      } else {
        console.error('Failed to fetch products:', response.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    
    let categoryId = form.category;
    if (form.newCategory.trim()) {
      categoryId = form.newCategory.trim();
    }
    
    const productData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      categoryId,
      images: form.image ? [form.image] : [],
      stock: 0, // Default stock
      featured: false, // Default featured
      tags: [] // Default tags
    };
    
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    
    const response = await res.json();
    
    if (!res.ok || !response.success) {
      setError(response.error || "Failed to add product");
    } else {
      setForm({ name: "", price: "", category: "", newCategory: "", image: "", description: "" });
      setSuccess("Product added successfully!");
      setImageUploaded(false);
      fetchProducts();
      setTimeout(() => setSuccess(""), 2000);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-blue_gray-400 tracking-wide">Product Management</h1>
      <p className="mb-4 text-gray-700">Here you can add, edit, and manage your products.</p>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-blue_gray-100">
        <h2 className="text-lg font-semibold mb-4 text-blue_gray-500 border-b pb-2">Add New Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-blue_gray-400 mb-1">Product Name<span className="text-red-500">*</span></label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              className="border rounded-lg px-3 py-2 text-blue_gray-700 bg-baby_powder-500 placeholder:text-blue_gray-100 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
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
              className="border rounded-lg px-3 py-2 text-blue_gray-700 bg-baby_powder-500 placeholder:text-blue_gray-100 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
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
              className="border rounded-lg px-3 py-2 text-blue_gray-700 bg-baby_powder-500 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
              className="border rounded-lg px-3 py-2 text-blue_gray-700 bg-baby_powder-500 placeholder:text-blue_gray-100 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <label htmlFor="imageUpload" className="text-sm font-medium text-blue_gray-400 mb-1">Product Image</label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border rounded-lg px-3 py-2 text-blue_gray-700 bg-baby_powder-500 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
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
              className="border rounded-lg px-3 py-2 text-blue_gray-700 bg-baby_powder-500 placeholder:text-blue_gray-100 mt-2 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
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
              className="border rounded-lg px-3 py-2 text-blue_gray-700 bg-baby_powder-500 placeholder:text-blue_gray-100 focus:outline-none focus:ring-2 focus:ring-sunglow-400"
            />
          </div>
          <button
            type="submit"
            className="bg-sunglow-400 hover:bg-mustard-400 text-black font-bold rounded-lg px-4 py-2 md:col-span-2 shadow mt-2 transition-colors duration-200 disabled:opacity-60"
            disabled={submitting || !form.name || !form.price}
          >
            {submitting ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Adding...</span>
            ) : "Add Product"}
          </button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-700 mt-2 font-semibold">{success}</div>}
      </div>
      <div className="bg-baby_powder-900 rounded-xl shadow p-2 md:p-6 border border-blue_gray-100 overflow-x-auto">
        {loading ? (
          <div>Loading products...</div>
        ) : products.length === 0 ? (
          <div>No products found.</div>
        ) : (
          <table className="min-w-full text-left text-xs md:text-base">
            <thead>
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Price</th>
                <th className="py-2">Category</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t">
                  {editingId === product.id ? (
                    <>
                      <td className="py-2" colSpan={4}>
                        <form onSubmit={handleEditSubmit} className="flex flex-col md:flex-row gap-2 items-center">
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            placeholder="Product Name"
                            className="border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                            required
                          />
                          <input
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                            placeholder="Price"
                            type="number"
                            min="0"
                            step="0.01"
                            className="border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                            required
                          />
                          <select
                            name="category"
                            value={editForm.category}
                            onChange={handleEditChange}
                            className="border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <input
                            name="image"
                            value={editForm.image}
                            onChange={handleEditChange}
                            placeholder="Image URL"
                            className="border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                          />
                          <input
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            placeholder="Description"
                            className="border rounded-lg px-2 py-1 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-3 py-1"
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
                        </form>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 font-semibold">{product.name}</td>
                      <td className="py-2">${product.price}</td>
                      <td className="py-2">{product.categoryId || "-"}</td>
                      <td className="py-2 flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-blue_gray-400 hover:text-sunglow-400 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-mustard-400 hover:text-red-600 hover:underline text-sm"
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
        )}
      </div>
    </div>
  );
}
