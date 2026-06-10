import { GalleryPieceForm } from "@/components/admin/GalleryPieceForm";

export default async function NewGalleryPiecePage() {
  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">New Gallery Piece</h1>
      <GalleryPieceForm />
    </div>
  );
}
