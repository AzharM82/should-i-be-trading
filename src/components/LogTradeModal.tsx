import { useState } from "react";
import type { MarketScoreResponse } from "../types.js";
import type { NewTradeBody } from "../services/api.js";

interface Props {
  data: MarketScoreResponse;
  onSubmit: (body: NewTradeBody) => Promise<void>;
  onClose: () => void;
}

const DIRS: Array<NewTradeBody["dirTaken"]> = ["CALLS", "PUTS", "SHARES"];

export function LogTradeModal({ data, onSubmit, onClose }: Props) {
  const [ticker, setTicker] = useState("");
  const [dirTaken, setDirTaken] = useState<NewTradeBody["dirTaken"]>(
    data.posture.direction === "PUTS" ? "PUTS" : "CALLS",
  );
  const [sizeUsedPct, setSizeUsedPct] = useState<number>(data.posture.sizePct || 50);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const overriding = sizeUsedPct > data.posture.sizePct + 5;

  async function submit() {
    if (!ticker.trim()) { setErr("Enter a ticker"); return; }
    setBusy(true); setErr(null);
    try {
      await onSubmit({
        ticker: ticker.trim().toUpperCase(),
        dirTaken,
        sizeUsedPct,
        mode: data.mode,
        recSize: data.posture.size,
        recSizePct: data.posture.sizePct,
        recInstrument: data.posture.instrument,
        recDirection: data.posture.direction,
        recBias: data.posture.bias,
        decision: data.decision,
        qualityScore: data.qualityScore,
        execScore: data.executionScore,
        regime: data.trend.spy.regime,
        vixLevel: data.volatility.vix.level,
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to log");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-t-card border border-t-border rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-t-text text-t-bg px-4 py-2 rounded-t-lg text-[11px] uppercase tracking-widest flex justify-between items-center">
          <span>Log a trade</span>
          <button onClick={onClose} className="text-t-bg/70 hover:text-t-bg">✕</button>
        </div>

        <div className="p-4 space-y-3">
          {/* what the tool said, for reference */}
          <div className="text-[11px] text-t-muted border border-t-border rounded px-2.5 py-2 bg-t-surface">
            Tool recommended now: <span className="font-bold text-t-text">{data.posture.headline}</span>
          </div>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-t-muted">Ticker</span>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="AAPL"
              className="mt-1 w-full bg-t-bg border border-t-border rounded px-2 py-1.5 text-sm uppercase focus:outline-none focus:border-t-blue"
            />
          </label>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-t-muted">Direction taken</span>
            <div className="mt-1 flex gap-1.5">
              {DIRS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDirTaken(d)}
                  className={`flex-1 py-1.5 rounded text-xs border ${dirTaken === d ? "bg-t-blue/15 border-t-blue text-t-blue font-bold" : "border-t-border text-t-muted"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-t-muted">Size used — % of account</span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range" min={0} max={100} step={5}
                value={sizeUsedPct}
                onChange={(e) => setSizeUsedPct(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-bold tabular-nums">{sizeUsedPct}%</span>
            </div>
            {overriding && (
              <div className="mt-1 text-[11px] text-t-red">
                ⚠ Bigger than the tool's {data.posture.sizePct}% cap — this is the habit the mirror tracks.
              </div>
            )}
          </label>

          {err && <div className="text-t-red text-xs">{err}</div>}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-1.5 rounded border border-t-border text-t-muted text-sm">Cancel</button>
            <button
              onClick={submit}
              disabled={busy}
              className="flex-1 py-1.5 rounded bg-t-blue/15 border border-t-blue text-t-blue font-bold text-sm disabled:opacity-50"
            >
              {busy ? "Saving…" : "Log trade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
