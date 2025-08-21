"use client";
import { useEffect, useState } from "react";

type Category = string;

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
    setCategories(data);
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

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: "DELETE" });
    fetchCategories();
  };

  const startEdit = (name: string) => {
    setEditing(name);
    setEditValue(name);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const handleEdit = async (oldName: string) => {
    if (!editValue.trim() || editValue === oldName) {
      cancelEdit();
      return;
    }
    await fetch(`/api/categories/${encodeURIComponent(oldName)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });
    cancelEdit();
    fetchCategories();
  };

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-blue_gray-400 tracking-wide">Category Management</h1>
      <div className="bg-baby_powder-900 rounded-xl shadow p-2 md:p-6 border border-blue_gray-100 overflow-x-auto">
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="New Category"
            className="border rounded-lg px-3 py-2 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
            required
          />
          <button
            type="submit"
            className="bg-sunglow-400 hover:bg-mustard-400 text-baby_powder-500 font-bold rounded-lg px-4 py-2 shadow"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Category"}
          </button>
        </form>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div>No categories found.</div>
        ) : (
          <ul>
            {categories.map(cat => (
              <li key={cat} className="flex justify-between items-center py-2 border-b last:border-b-0 gap-2">
                {editing === cat ? (
                  <>
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="border rounded-lg px-2 py-1 mr-2 text-blue_gray-300 bg-baby_powder-500 placeholder:text-blue_gray-100"
                    />
                    <button
                      onClick={() => handleEdit(cat)}
                      className="bg-sunglow-400 hover:bg-mustard-400 text-baby_powder-500 font-bold rounded-lg px-3 py-1 text-sm mr-2 shadow"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:underline text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span>{cat}</span>
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-blue_gray-400 hover:text-sunglow-400 hover:underline text-sm mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="text-red-600 hover:underline text-sm"
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
