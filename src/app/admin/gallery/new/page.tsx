import { prisma, isDatabaseConfigured } from "@/lib/db";
import { GalleryPieceForm } from "@/components/admin/GalleryPieceForm";

export default async function NewGalleryPiecePage() {
  const categories = isDatabaseConfigured()
    ? await prisma.category.findMany({ orderBy: { title: "asc" } })
    : [];

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">New Gallery Piece</h1>
      <GalleryPieceForm categories={categories} />
    </div>
  );
}
