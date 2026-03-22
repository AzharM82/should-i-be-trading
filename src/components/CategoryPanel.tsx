interface CategoryPanelProps {
  title: string;
  score: number;
  children: React.ReactNode;
}

export function CategoryPanel({ title, score, children }: CategoryPanelProps) {
  let scoreColor: string;
  if (score >= 65) scoreColor = "text-t-green bg-t-green/10 border-t-green/30";
  else if (score >= 40) scoreColor = "text-t-amber bg-t-amber/10 border-t-amber/30";
  else scoreColor = "text-t-red bg-t-red/10 border-t-red/30";

  return (
    <div className="bg-t-card border border-t-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-t-border bg-t-surface">
        <span className="text-xs font-semibold uppercase tracking-wider text-t-muted">{title}</span>
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
  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "►";
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
        <span className="text-t-text font-medium">{value}</span>
        {direction && <span className={`${arrowColor} text-[10px]`}>{arrow}</span>}
        {interpretation && (
          <span className={`${interpColor} text-[10px] uppercase`}>{interpretation}</span>
        )}
      </div>
    </div>
  );
}
