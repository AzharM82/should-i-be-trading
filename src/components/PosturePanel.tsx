import type { TradePosture } from "../types.js";

interface Props {
  posture: TradePosture;
  mode: "swing" | "day";
}

const SIZE_STYLES: Record<TradePosture["size"], { text: string; label: string }> = {
  FULL: { text: "text-t-green", label: "FULL SIZE" },
  HALF: { text: "text-t-amber", label: "HALF SIZE" },
  QUARTER: { text: "text-t-amber", label: "QUARTER" },
  NONE: { text: "text-t-red", label: "SIT OUT" },
};

const DIR_STYLES: Record<TradePosture["direction"], { text: string; label: string }> = {
  CALLS: { text: "text-t-green", label: "CALLS ▲" },
  PUTS: { text: "text-t-red", label: "PUTS ▼" },
  NEITHER: { text: "text-t-muted", label: "NO SIDE" },
};

const INSTR_LABELS: Record<TradePosture["instrument"], string> = {
  OPTIONS: "Long options",
  STOCK: "Shares",
  SPREADS: "Spreads",
  CASH: "Cash",
};

// Lean, figure-first card for the side rail. Full reasoning is available on
// hover (title) — the front stays a glanceable answer, logic lives in the API.
export function PosturePanel({ posture, mode }: Props) {
  const size = SIZE_STYLES[posture.size];
  const dir = DIR_STYLES[posture.direction];
  const sittingOut = posture.size === "NONE";

  return (
    <div className="bg-t-card border border-t-border rounded overflow-hidden" title={posture.rationale}>
      <div className="bg-t-text text-t-bg px-2.5 py-1.5 text-[10px] uppercase tracking-widest flex justify-between">
        <span>What to trade</span>
        <span>{mode}</span>
      </div>

      <div className="px-3 py-3 text-center">
        <div className={`text-2xl font-black leading-none ${size.text}`} style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {size.label}
        </div>
        {!sittingOut && (
          <div className="text-t-muted text-[10px] uppercase tracking-wider mt-1">{posture.sizePct}% of account</div>
        )}

        {!sittingOut && (
          <div className="mt-3 pt-3 border-t border-t-border flex flex-col gap-1">
            <div className={`text-base font-bold ${dir.text}`} style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {dir.label}
            </div>
            <div className="text-xs text-t-blue">{INSTR_LABELS[posture.instrument]}</div>
          </div>
        )}

        <div className="text-[9px] uppercase tracking-wider text-t-dim mt-3">{posture.confidence} confidence</div>
      </div>
    </div>
  );
}
