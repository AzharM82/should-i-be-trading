import type { TradePosture } from "../types.js";

interface Props {
  posture: TradePosture;
  mode: "swing" | "day";
  qualityScore: number;
  executionScore: number;
}

const SIZE_STYLES: Record<TradePosture["size"], { text: string; label: string }> = {
  FULL: { text: "text-t-green", label: "FULL SIZE" },
  HALF: { text: "text-t-amber", label: "HALF SIZE" },
  QUARTER: { text: "text-t-amber", label: "QUARTER SIZE" },
  NONE: { text: "text-t-red", label: "SIT OUT" },
};

const DIR_STYLES: Record<TradePosture["direction"], { text: string; label: string }> = {
  CALLS: { text: "text-t-green", label: "CALLS ▲" },
  PUTS: { text: "text-t-red", label: "PUTS ▼" },
  NEITHER: { text: "text-t-muted", label: "NO SIDE" },
};

const INSTR_LABELS: Record<TradePosture["instrument"], string> = {
  OPTIONS: "Long Options",
  STOCK: "Shares",
  SPREADS: "Spreads",
  CASH: "Cash",
};

function Chip({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-t-card border border-t-border rounded px-2.5 py-1.5 min-w-0 flex-1">
      <div className="text-t-muted text-[9px] uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`font-bold text-sm truncate ${valueClass ?? "text-t-text"}`} style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {value}
      </div>
    </div>
  );
}

export function PosturePanel({ posture, mode, qualityScore, executionScore }: Props) {
  const size = SIZE_STYLES[posture.size];
  const dir = DIR_STYLES[posture.direction];
  const sittingOut = posture.size === "NONE";

  return (
    <div className="bg-t-card border border-t-border rounded overflow-hidden h-full flex flex-col">
      {/* header bar */}
      <div className="bg-t-text text-t-bg px-3 py-1.5 flex justify-between items-center text-[10px] uppercase tracking-widest">
        <span>Trade Posture · {mode}</span>
        <span>Q {qualityScore} · Ex {executionScore}</span>
      </div>

      <div className="p-3 flex flex-col gap-2.5 flex-1">
        {/* headline size */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`text-2xl font-black tracking-wide ${size.text}`} style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {size.label}
          </span>
          {!sittingOut && (
            <span className="text-t-muted text-[10px] uppercase tracking-wider">{posture.sizePct}% of normal</span>
          )}
          <span className="ml-auto text-[9px] uppercase tracking-wider text-t-muted border border-t-border rounded px-1.5 py-0.5">
            {posture.confidence} conf
          </span>
        </div>

        {/* chips */}
        <div className="flex gap-2">
          <Chip label="Direction" value={dir.label} valueClass={dir.text} />
          <Chip label="Instrument" value={INSTR_LABELS[posture.instrument]} valueClass="text-t-blue" />
        </div>

        {/* rationale */}
        <div className="text-t-muted text-[11px] leading-snug pt-1.5 border-t border-t-border" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {posture.rationale}
        </div>
      </div>
    </div>
  );
}
