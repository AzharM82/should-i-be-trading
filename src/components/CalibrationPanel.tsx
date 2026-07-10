import type { CalibrationResult } from "../types.js";

interface Props {
  calibration: CalibrationResult | null;
}

function money(n: number): string {
  const sign = n < 0 ? "−" : "+";
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`;
}

// Lean "your edge" summary for the side rail: two figures, no prose.
export function CalibrationPanel({ calibration }: Props) {
  const hasData = calibration && calibration.totalClosed > 0;

  return (
    <div className="bg-t-card border border-t-border rounded p-2.5" title="Followed cap = you sized at/under the recommendation. Went bigger = you exceeded it.">
      <div className="text-[10px] uppercase tracking-widest text-t-muted mb-2">Your edge</div>

      {!hasData ? (
        <div className="text-[11px] text-t-muted italic">No closed trades yet.</div>
      ) : (
        <div className="space-y-1.5">
          <Row label="Followed cap" stat={calibration!.followed} good />
          <Row label="Went bigger" stat={calibration!.exceeded} />
        </div>
      )}
    </div>
  );
}

function Row({ label, stat, good }: { label: string; stat: CalibrationResult["followed"]; good?: boolean }) {
  const color = stat.totalPnl > 0 ? "text-t-green" : stat.totalPnl < 0 ? "text-t-red" : "text-t-muted";
  return (
    <div className={`flex items-baseline justify-between border-l-2 pl-2 ${good ? "border-t-green/50" : "border-t-red/50"}`}>
      <span className="text-[11px] text-t-muted">{label}</span>
      <span className="text-right">
        <span className={`text-sm font-bold tabular-nums ${color}`} style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>{money(stat.totalPnl)}</span>
        <span className="text-[9px] text-t-dim ml-1 tabular-nums">{stat.count}·{stat.winRate}%</span>
      </span>
    </div>
  );
}
