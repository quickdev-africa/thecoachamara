"use client";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  [key: string]: any;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    // Robustly handle API response and filter out inactive categories
    let cats: Category[] = [];
    if (Array.isArray(data)) {
      cats = data;
    } else if (Array.isArray(data?.data)) {
      cats = data.data;
    }
    // Only show categories where is_active !== false (default to true if missing)
    setCategories(cats.filter(cat => cat.is_active !== false));
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    if (!res.ok) {
      setError("Failed to add category");
    } else {
      setNewCategory("");
      fetchCategories();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      console.log('Delete response:', data);
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete category');
      } else {
        setError("");
        fetchCategories();
      }
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    }
  };

  const startEdit = (cat: Category) => {
    setEditing(cat.id);
    setEditValue(cat.name);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const handleEdit = async (cat: Category) => {
    if (!editValue.trim() || editValue === cat.name) {
      cancelEdit();
      return;
    }
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(cat.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editValue.trim() }),
      });
      const data = await res.json();
      console.log('Edit response:', data);
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update category');
      } else {
        setError("");
        cancelEdit();
        fetchCategories();
      }
    } catch (err) {
      setError('Failed to update category');
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-black tracking-wide">Category Management</h1>
      <div className="bg-baby_powder-900 rounded-xl shadow p-2 md:p-6 border border-blue_gray-100 overflow-x-auto">
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="New Category"
                className="border rounded-lg px-3 py-2 text-gray-900 bg-white placeholder:text-gray-400"
            required
          />
          <button
            type="submit"
                className="bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-4 py-2 shadow border border-sunglow-400 transition-colors duration-200"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Category"}
          </button>
        </form>
        {error && (
          <div className="flex items-center justify-between bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2" role="alert">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-4 text-red-700 hover:text-red-900 font-bold text-lg focus:outline-none"
              aria-label="Close error alert"
            >
              &times;
            </button>
          </div>
        )}
        {loading ? (
          <div>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-gray-700">No categories found.</div>
        ) : (
          <ul>
            {categories.map(cat => (
              <li key={cat.id || cat.name} className="flex justify-between items-center py-2 border-b last:border-b-0 gap-2">
                {editing === cat.id ? (
                  <>
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="border rounded-lg px-2 py-1 mr-2 text-gray-900 bg-white placeholder:text-gray-400"
                    />
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-3 py-1 text-sm mr-2 shadow border border-sunglow-400 transition-colors duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold rounded-lg px-3 py-1 text-sm shadow border border-gray-300 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-700">{cat.name}</span>
                    <button
                      onClick={() => startEdit(cat)}
                      className="bg-sunglow-400 hover:bg-mustard-400 text-gray-900 font-bold rounded-lg px-3 py-1 text-sm mr-2 shadow border border-sunglow-400 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold rounded-lg px-3 py-1 text-sm shadow border border-red-500 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
