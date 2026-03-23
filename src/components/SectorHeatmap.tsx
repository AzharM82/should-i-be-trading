import type { SectorData } from "../types.js";

interface Props {
  sectors: SectorData[];
}

export function SectorHeatmap({ sectors }: Props) {
  const sorted = [...sectors].sort((a, b) => b.changePercent - a.changePercent);
  const maxAbs = Math.max(...sorted.map((s) => Math.abs(s.changePercent)), 0.5);

  return (
    <div className="bg-t-card border border-t-border rounded overflow-hidden">
      <div className="px-4 py-2.5 border-b border-t-border">
        <span
          className="text-xs font-bold uppercase tracking-widest text-t-text"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Sector Performance
        </span>
      </div>
      <div className="p-4 space-y-1.5">
        {sorted.map((s) => {
          const width = Math.min(100, (Math.abs(s.changePercent) / maxAbs) * 100);
          const isPositive = s.changePercent >= 0;

          return (
            <div key={s.ticker} className="flex items-center gap-2 text-xs">
              <span className="w-10 text-t-text font-semibold shrink-0">{s.ticker}</span>
              <div className="flex-1 h-5 bg-t-surface rounded overflow-hidden relative">
                <div
                  className={`h-full rounded transition-all duration-500 ${
                    isPositive ? "bg-t-green/20" : "bg-t-red/20"
                  }`}
                  style={{ width: `${width}%` }}
                />
                <span className={`absolute right-1 top-0.5 text-[10px] font-semibold ${
                  isPositive ? "text-t-green" : "text-t-red"
                }`}>
                  {isPositive ? "+" : ""}{s.changePercent.toFixed(2)}%
                </span>
              </div>
              <span className="w-16 text-right text-t-muted text-[10px] shrink-0">{s.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
