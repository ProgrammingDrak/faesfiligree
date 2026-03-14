import Link from "next/link";
import { prisma, isDatabaseConfigured } from "@/lib/db";

export default async function CommissionsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Commissions</h1>
        <p className="text-warm-white/50">Database not configured.</p>
      </div>
    );
  }

  const commissions = await prisma.commission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    "in-progress": "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
    declined: "bg-rose-gold/20 text-rose-gold",
  };

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Commissions</h1>

      {commissions.length === 0 ? (
        <p className="text-warm-white/50">No commission requests yet.</p>
      ) : (
        <div className="space-y-3">
          {commissions.map((c) => (
            <Link
              key={c.id}
              href={`/admin/commissions/${c.id}`}
              className="block bg-warm-white/5 border border-warm-white/10 rounded-lg p-4 hover:bg-warm-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-warm-white font-medium">{c.name}</p>
                  <p className="text-warm-white/50 text-sm">{c.email}</p>
                  {c.pieceType && (
                    <p className="text-warm-white/40 text-sm mt-1">Type: {c.pieceType}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[c.status] || "bg-warm-white/10 text-warm-white/60"}`}>
                    {c.status}
                  </span>
                  <span className="text-warm-white/30 text-xs">
                    {c.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
