interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="bg-warm-white/5 border border-warm-white/10 rounded-xl p-5">
      <p className="text-warm-white/50 text-sm">{label}</p>
      <p className="text-2xl font-heading text-warm-white mt-1">{value}</p>
      {detail && (
        <p className="text-warm-white/40 text-xs mt-1">{detail}</p>
      )}
    </div>
  );
}
