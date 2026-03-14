"use client";

import { useState, useEffect } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (formData: FormData) => {
    await createCategory(formData);
    window.location.reload();
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    await updateCategory(id, formData);
    setEditingId(null);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteCategory(id);
    window.location.reload();
  };

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Categories</h1>

      {/* Add new */}
      <form action={handleCreate} className="flex gap-2 mb-6">
        <input
          name="title"
          required
          placeholder="Category name"
          className="flex-1 px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper"
        />
        <input
          name="description"
          placeholder="Description (optional)"
          className="flex-1 px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-warm-white/50">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-warm-white/50">No categories yet.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-warm-white/5 border border-warm-white/10 rounded-lg p-3"
            >
              {editingId === cat.id ? (
                <form
                  action={(formData) => handleUpdate(cat.id, formData)}
                  className="flex gap-2 flex-1"
                >
                  <input
                    name="title"
                    defaultValue={cat.title}
                    className="flex-1 px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                  />
                  <input
                    name="description"
                    defaultValue={cat.description || ""}
                    className="flex-1 px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                  />
                  <button type="submit" className="text-copper text-sm">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-warm-white/50 text-sm">Cancel</button>
                </form>
              ) : (
                <>
                  <div>
                    <span className="text-warm-white">{cat.title}</span>
                    {cat.description && (
                      <span className="text-warm-white/50 text-sm ml-2">{cat.description}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(cat.id)} className="text-copper text-sm">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-rose-gold/70 text-sm">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
