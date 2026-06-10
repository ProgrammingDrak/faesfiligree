import { notFound } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { updateCommissionStatus } from "@/lib/actions/commissions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommissionDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return notFound();

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) return notFound();

  const statuses = ["pending", "in-progress", "completed", "declined"];

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl text-warm-white mb-6">Commission Details</h1>

      <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-warm-white/50 text-sm">Name</p>
            <p className="text-warm-white">{commission.name}</p>
          </div>
          <div>
            <p className="text-warm-white/50 text-sm">Email</p>
            <p className="text-warm-white">{commission.email}</p>
          </div>
          {commission.pieceType && (
            <div>
              <p className="text-warm-white/50 text-sm">Piece Type</p>
              <p className="text-warm-white">{commission.pieceType}</p>
            </div>
          )}
          {commission.budgetRange && (
            <div>
              <p className="text-warm-white/50 text-sm">Budget Range</p>
              <p className="text-warm-white">{commission.budgetRange}</p>
            </div>
          )}
          {commission.timeline && (
            <div>
              <p className="text-warm-white/50 text-sm">Timeline</p>
              <p className="text-warm-white">{commission.timeline}</p>
            </div>
          )}
        </div>

        {commission.description && (
          <div>
            <p className="text-warm-white/50 text-sm">Description</p>
            <p className="text-warm-white">{commission.description}</p>
          </div>
        )}

        {commission.materials.length > 0 && (
          <div>
            <p className="text-warm-white/50 text-sm">Materials</p>
            <p className="text-warm-white">{commission.materials.join(", ")}</p>
          </div>
        )}

        {commission.notes && (
          <div>
            <p className="text-warm-white/50 text-sm">Notes</p>
            <p className="text-warm-white">{commission.notes}</p>
          </div>
        )}

        <hr className="border-warm-white/10" />

        <div>
          <p className="text-warm-white/50 text-sm mb-2">Update Status</p>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <form
                key={status}
                action={async () => {
                  "use server";
                  await updateCommissionStatus(id, status);
                }}
              >
                <button
                  type="submit"
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    commission.status === status
                      ? "bg-copper text-white"
                      : "bg-warm-white/10 text-warm-white/60 hover:bg-warm-white/20"
                  }`}
                >
                  {status}
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
