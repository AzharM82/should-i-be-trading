interface CategoryPanelProps {
  title: string;
  score: number;
  children: React.ReactNode;
}

export function CategoryPanel({ title, score, children }: CategoryPanelProps) {
  let scoreColor: string;
  if (score >= 65) scoreColor = "text-t-green bg-t-green/8 border-t-green/40";
  else if (score >= 40) scoreColor = "text-t-amber bg-t-amber/8 border-t-amber/40";
  else scoreColor = "text-t-red bg-t-red/8 border-t-red/40";

  return (
    <div className="bg-t-card border border-t-border rounded overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-t-border">
        <span
          className="text-xs font-bold uppercase tracking-widest text-t-text"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${scoreColor}`}>
          {score}
        </span>
      </div>
      <div className="p-4 space-y-3 text-xs">
        {children}
      </div>
    </div>
  );
}

// Reusable metric row
export function MetricRow({ label, value, direction, interpretation }: {
  label: string;
  value: string | number;
  direction?: "up" | "down" | "flat";
  interpretation?: string;
}) {
  const arrow = direction === "up" ? "\u25B2" : direction === "down" ? "\u25BC" : "\u25B6";
  const arrowColor = direction === "up" ? "text-t-green" : direction === "down" ? "text-t-red" : "text-t-muted";
  const interpColor =
    interpretation === "healthy" || interpretation === "bullish" || interpretation === "favorable"
      ? "text-t-green"
      : interpretation === "weakening" || interpretation === "bearish" || interpretation === "risk-off"
        ? "text-t-red"
        : "text-t-amber";

  return (
    <div className="flex items-center justify-between">
      <span className="text-t-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-t-text font-semibold">{value}</span>
        {direction && <span className={`${arrowColor} text-[10px]`}>{arrow}</span>}
        {interpretation && (
          <span className={`${interpColor} text-[10px] uppercase font-semibold`}>{interpretation}</span>
        )}
      </div>
    </div>
  );
}
