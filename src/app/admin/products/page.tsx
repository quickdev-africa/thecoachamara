"use client";
import Image from 'next/image';
import { useEffect, useState } from "react";
import { uploadProductImage } from "../../../utils/uploadProductImage";

type Product = {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  description?: string;
};

type Category = string;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", price: "", category: "", newCategory: "", image: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", category: "", image: "", description: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchProducts = async () => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    const uniqueCategories = Array.from(new Set(data.map((p: Product) => p.category).filter(Boolean))) as string[];
    setCategories(uniqueCategories);
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
    if (file.size > 500 * 1024) {
      setError("Image must be less than 500KB");
      return;
    }
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
    let category = form.category;
    if (form.newCategory.trim()) {
      category = form.newCategory.trim();
    }
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        category,
        price: parseFloat(form.price),
      }),
    });
    if (!res.ok) {
      setError("Failed to add product");
    } else {
      setForm({ name: "", price: "", category: "", newCategory: "", image: "", description: "" });
      setSuccess("Product added successfully!");
      setImageUploaded(false);
      fetchProducts();
      setTimeout(() => setSuccess(""), 2000);
    }
    setSubmitting(false);
  };

  // Edit logic
  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category || "",
      image: product.image || "",
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
    await fetch(`/api/products/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        price: parseFloat(editForm.price),
      }),
    });
    setEditingId(null);
    setEditSubmitting(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  const cancelEdit = () => {
    setEditingId(null);
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
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z\"></path></svg>Adding...</span>
            ) : "Add Product"}
          </button>
        </form>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-blue_gray-100 rounded-xl">
          <thead>
            <tr className="bg-blue_gray-50 text-blue_gray-400">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Image</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              editingId === product.id ? (
                <tr key={product.id} className="bg-yellow-50">
                  <td className="py-2 px-4">
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      type="number"
                      min="0"
                      step="0.01"
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-2 px-4">
                    {editForm.image && <Image src={editForm.image} alt="Product" width={40} height={40} className="object-cover rounded border" />}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={handleEditSubmit} className="bg-green-500 text-white px-2 py-1 rounded text-xs" disabled={editSubmitting}>Save</button>
                    <button onClick={cancelEdit} className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={product.id}>
                  <td className="py-2 px-4">{product.name}</td>
                  <td className="py-2 px-4">${product.price.toFixed(2)}</td>
                  <td className="py-2 px-4">{product.category}</td>
                  <td className="py-2 px-4">{product.image && <Image src={product.image} alt="Product" width={40} height={40} className="object-cover rounded border" />}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={() => startEdit(product)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Delete</button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}