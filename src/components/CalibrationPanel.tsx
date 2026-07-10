import type { CalibrationResult } from "../types.js";

interface Props {
  calibration: CalibrationResult | null;
}

function money(n: number): string {
  const sign = n < 0 ? "−" : "+";
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`;
}

export function CalibrationPanel({ calibration }: Props) {
  const hasData = calibration && calibration.totalClosed > 0;

  return (
    <div className="bg-t-card border border-t-border rounded p-3 h-full">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[11px] uppercase tracking-widest text-t-muted">The Mirror</div>
        <div className="text-[10px] text-t-dim">{calibration?.totalClosed ?? 0} closed</div>
      </div>

      {!hasData ? (
        <div className="text-t-muted text-[12px] italic py-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          No closed trades yet. Log your trades and close them with a result — this panel will show what
          following (or ignoring) the size cap actually costs or earns you.
        </div>
      ) : (
        <>
          {/* headlines */}
          <div className="space-y-1.5 mb-3">
            {calibration!.headlines.map((h, i) => (
              <div
                key={i}
                className={`text-[12px] leading-snug px-2.5 py-1.5 rounded border-l-2 ${
                  h.includes("BIGGER") ? "border-t-red bg-t-red/5"
                  : h.includes("FOLLOWED") ? "border-t-green bg-t-green/5"
                  : "border-t-blue bg-t-blue/5"
                }`}
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* followed vs exceeded */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <Bucket label="Followed cap" stat={calibration!.followed} good />
            <Bucket label="Went bigger" stat={calibration!.exceeded} />
          </div>
        </>
      )}
    </div>
  );
}

function Bucket({ label, stat, good }: { label: string; stat: CalibrationResult["followed"]; good?: boolean }) {
  const pnlColor = stat.totalPnl > 0 ? "text-t-green" : stat.totalPnl < 0 ? "text-t-red" : "text-t-muted";
  return (
    <div className={`border rounded py-2 ${good ? "border-t-green/40" : "border-t-red/40"}`}>
      <div className="text-[9px] uppercase tracking-wider text-t-muted">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${pnlColor}`} style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {money(stat.totalPnl)}
      </div>
      <div className="text-[10px] text-t-muted tabular-nums">{stat.count} trades · {stat.winRate}% win</div>
    </div>
  );
}
