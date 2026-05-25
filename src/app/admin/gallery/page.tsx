import Link from "next/link";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { deleteGalleryPiece } from "@/lib/actions/gallery";
import { getLocalGalleryPieces } from "@/lib/local-gallery";

interface GalleryAdminCard {
  id: string;
  title: string;
  images: string[];
  year: number | null;
  isSold: boolean;
  isCommission: boolean;
  featured: boolean;
  description: string | null;
}

export default async function GalleryAdminPage() {
  const pieces: GalleryAdminCard[] = isDatabaseConfigured()
    ? (await prisma.galleryPiece.findMany({
        orderBy: { createdAt: "desc" },
      })).map((piece) => ({
        id: piece.id,
        title: piece.title,
        images: piece.images,
        year: piece.year,
        isSold: piece.isSold,
        isCommission: piece.isCommission,
        featured: piece.featured,
        description: piece.description,
      }))
    : (await getLocalGalleryPieces()).map((piece) => ({
        id: piece.id,
        title: piece.title,
        images: piece.images,
        year: piece.year,
        isSold: piece.isSold,
        isCommission: piece.isCommission,
        featured: piece.featured,
        description: piece.description,
      }));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl text-warm-white">Gallery</h1>
          <p className="text-warm-white/50 text-sm mt-1">
            Add portfolio photos here. Saved pieces feed the public gallery page.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
        >
          Add Photos
        </Link>
      </div>

      {!isDatabaseConfigured() && (
        <div className="mb-5 rounded-lg border border-copper/20 bg-copper/10 p-3 text-sm text-warm-white/70">
          Local gallery mode is active because no database is configured. Photos are saved under
          <code className="mx-1 text-copper">public/uploads/gallery</code>
          and metadata is saved locally for this workshop.
        </div>
      )}

      {pieces.length === 0 ? (
        <div className="rounded-lg border border-warm-white/10 p-6">
          <p className="text-warm-white/60">No gallery pieces yet.</p>
          <Link
            href="/admin/gallery/new"
            className="mt-3 inline-block text-copper hover:text-copper-light text-sm"
          >
            Add your first photos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pieces.map((piece) => (
            <article
              key={piece.id}
              className="overflow-hidden rounded-lg border border-warm-white/10 bg-warm-white/5"
            >
              <div className="aspect-square bg-charcoal/70">
                {piece.images[0] ? (
                  <img
                    src={piece.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-warm-white/25 text-sm">
                    No photo
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-warm-white font-medium">{piece.title}</h2>
                    {piece.featured && (
                      <span className="shrink-0 rounded bg-copper/20 px-2 py-0.5 text-xs text-copper">
                        Featured
                      </span>
                    )}
                  </div>
                  {piece.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-warm-white/45">
                      {piece.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {piece.year && (
                    <span className="rounded bg-warm-white/10 px-2 py-0.5 text-xs text-warm-white/50">
                      {piece.year}
                    </span>
                  )}
                  {piece.isSold && (
                    <span className="rounded bg-rose-gold/20 px-2 py-0.5 text-xs text-rose-gold">
                      Sold
                    </span>
                  )}
                  {piece.isCommission && (
                    <span className="rounded bg-copper/20 px-2 py-0.5 text-xs text-copper">
                      Commission
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/admin/gallery/${piece.id}/edit`}
                    className="text-copper text-sm hover:text-copper-light"
                  >
                    Edit
                  </Link>
                  <form action={async () => {
                    "use server";
                    await deleteGalleryPiece(piece.id);
                  }}>
                    <button type="submit" className="text-rose-gold/70 text-sm hover:text-rose-gold">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
