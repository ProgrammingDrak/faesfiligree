import { notFound } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { GalleryPieceForm } from "@/components/admin/GalleryPieceForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryPiecePage({ params }: Props) {
  const { id } = await params;

  if (!isDatabaseConfigured()) return notFound();

  const piece = await prisma.galleryPiece.findUnique({ where: { id } });
  if (!piece) return notFound();

  const categories = await prisma.category.findMany({ orderBy: { title: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Edit Gallery Piece</h1>
      <GalleryPieceForm piece={piece} categories={categories} />
    </div>
  );
}
