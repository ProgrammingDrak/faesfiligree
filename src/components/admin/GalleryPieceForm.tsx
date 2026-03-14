"use client";

import { useState } from "react";
import { createGalleryPiece, updateGalleryPiece } from "@/lib/actions/gallery";

interface CategoryOption {
  id: string;
  title: string;
}

interface GalleryData {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  categoryId: string | null;
  materials: string[];
  year: number | null;
  isSold: boolean;
  isCommission: boolean;
  featured: boolean;
}

interface GalleryPieceFormProps {
  piece?: GalleryData;
  categories: CategoryOption[];
}

export function GalleryPieceForm({ piece, categories }: GalleryPieceFormProps) {
  const [images] = useState<string[]>(piece?.images || []);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    formData.set("images", JSON.stringify(images));
    const result = piece
      ? await updateGalleryPiece(piece.id, formData)
      : await createGalleryPiece(formData);
    if (result?.error) setError(result.error);
  };

  return (
    <form action={handleSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="bg-rose-gold/20 border border-rose-gold/30 rounded-lg p-3 text-rose-gold text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-warm-white/70 mb-1">Title</label>
        <input
          name="title"
          defaultValue={piece?.title}
          required
          className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
        />
      </div>

      <div>
        <label className="block text-sm text-warm-white/70 mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={piece?.description || ""}
          rows={3}
          className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Category</label>
          <select
            name="categoryId"
            defaultValue={piece?.categoryId || ""}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Year</label>
          <input
            name="year"
            type="number"
            defaultValue={piece?.year || new Date().getFullYear()}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-warm-white/70 mb-1">Materials (comma-separated)</label>
        <input
          name="materials"
          defaultValue={piece?.materials.join(", ")}
          className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          placeholder="Copper, Crystal"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-warm-white/70">
          <input name="isSold" type="checkbox" defaultChecked={piece?.isSold} className="rounded" />
          Sold
        </label>
        <label className="flex items-center gap-2 text-sm text-warm-white/70">
          <input name="isCommission" type="checkbox" defaultChecked={piece?.isCommission} className="rounded" />
          Commission
        </label>
        <label className="flex items-center gap-2 text-sm text-warm-white/70">
          <input name="featured" type="checkbox" defaultChecked={piece?.featured} className="rounded" />
          Featured
        </label>
      </div>

      <button
        type="submit"
        className="px-6 py-2.5 bg-copper hover:bg-copper-dark text-white rounded-lg font-medium transition-colors"
      >
        {piece ? "Update Piece" : "Create Piece"}
      </button>
    </form>
  );
}
