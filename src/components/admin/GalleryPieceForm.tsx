"use client";

import { useState } from "react";
import { createGalleryPiece, updateGalleryPiece } from "@/lib/actions/gallery";
import { uploadImage } from "@/lib/actions/upload";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface GalleryData {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  materials: string[];
  year: number | null;
  isSold: boolean;
  isCommission: boolean;
  featured: boolean;
}

interface GalleryPieceFormProps {
  piece?: GalleryData;
}

export function GalleryPieceForm({ piece }: GalleryPieceFormProps) {
  const [images, setImages] = useState<string[]>(piece?.images || []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setIsSaving(true);

    let uploadedImages: string[] = [];
    try {
      uploadedImages = await Promise.all(
        pendingFiles.map(async (file) => {
          const uploadData = new FormData();
          uploadData.set("file", file);
          return uploadImage(uploadData);
        })
      );
    } catch (err) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : "Could not upload photos");
      return;
    }

    formData.set("images", JSON.stringify([...images, ...uploadedImages]));
    const result = piece
      ? await updateGalleryPiece(piece.id, formData)
      : await createGalleryPiece(formData);
    if (result?.error) {
      setIsSaving(false);
      setError(result.error);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4 max-w-4xl">
      {error && (
        <div className="bg-rose-gold/20 border border-rose-gold/30 rounded-lg p-3 text-rose-gold text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-warm-white/70 mb-1">Photos</label>
        <ImageUploader
          images={images}
          onImagesChange={setImages}
          pendingFiles={pendingFiles}
          onPendingFilesChange={setPendingFiles}
          hint="Uploaded photos appear on the public gallery page after save."
        />
      </div>

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

      <div>
        <label className="block text-sm text-warm-white/70 mb-1">Year</label>
        <input
          name="year"
          type="number"
          defaultValue={piece?.year || new Date().getFullYear()}
          className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
        />
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
        disabled={isSaving}
        className="px-6 py-2.5 bg-copper hover:bg-copper-dark text-white rounded-lg font-medium transition-colors"
      >
        {isSaving ? "Saving..." : piece ? "Update Piece" : "Create Piece"}
      </button>
    </form>
  );
}
