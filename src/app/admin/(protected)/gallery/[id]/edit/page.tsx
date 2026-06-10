import { notFound } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { GalleryPieceForm } from "@/components/admin/GalleryPieceForm";
import { getLocalGalleryPiece } from "@/lib/local-gallery";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryPiecePage({ params }: Props) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    const piece = await getLocalGalleryPiece(id);
    if (!piece) return notFound();

    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-6">Edit Gallery Piece</h1>
        <GalleryPieceForm piece={piece} />
      </div>
    );
  }

  const piece = await prisma.galleryPiece.findUnique({ where: { id } });
  if (!piece) return notFound();

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Edit Gallery Piece</h1>
      <GalleryPieceForm piece={piece} />
    </div>
  );
}
