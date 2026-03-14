import Link from "next/link";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { deleteGalleryPiece } from "@/lib/actions/gallery";

export default async function GalleryAdminPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Gallery</h1>
        <p className="text-warm-white/50">Database not configured.</p>
      </div>
    );
  }

  const pieces = await prisma.galleryPiece.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl text-warm-white">Gallery</h1>
        <Link
          href="/admin/gallery/new"
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
        >
          Add Piece
        </Link>
      </div>

      {pieces.length === 0 ? (
        <p className="text-warm-white/50">No gallery pieces yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-warm-white/10">
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Title</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Category</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Year</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Status</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pieces.map((piece) => (
                <tr key={piece.id} className="border-b border-warm-white/5">
                  <td className="py-3 text-warm-white">
                    {piece.title}
                    {piece.featured && (
                      <span className="ml-2 text-xs bg-copper/20 text-copper px-1.5 py-0.5 rounded">Featured</span>
                    )}
                  </td>
                  <td className="py-3 text-warm-white/70">{piece.category?.title || "—"}</td>
                  <td className="py-3 text-warm-white/70">{piece.year || "—"}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {piece.isSold && <span className="text-xs bg-rose-gold/20 text-rose-gold px-1.5 py-0.5 rounded">Sold</span>}
                      {piece.isCommission && <span className="text-xs bg-copper/20 text-copper px-1.5 py-0.5 rounded">Commission</span>}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/gallery/${piece.id}/edit`} className="text-copper text-sm hover:text-copper-light">Edit</Link>
                      <form action={async () => { "use server"; await deleteGalleryPiece(piece.id); }}>
                        <button type="submit" className="text-rose-gold/70 text-sm hover:text-rose-gold">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
