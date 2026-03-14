interface BarChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}

export function BarChart({ data, formatValue = (v) => String(v) }: BarChartProps) {
  if (data.length === 0) {
    return <p className="text-warm-white/40 text-sm">No data to display.</p>;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((item) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-warm-white/50 text-xs">{formatValue(item.value)}</span>
            <div className="w-full flex justify-center">
              <div
                className="w-full max-w-10 bg-copper/70 rounded-t transition-all"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
            </div>
            <span className="text-warm-white/40 text-xs truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
