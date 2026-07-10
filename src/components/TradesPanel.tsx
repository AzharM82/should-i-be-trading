import { useState } from "react";
import type { TradeRecord } from "../types.js";

interface Props {
  trades: TradeRecord[];
  onLogClick: () => void;
  onClose: (id: string, outcome: { pnl?: number | null; win?: boolean | null; notes?: string }) => Promise<void>;
}

// Lean trades list for the side rail: log button + compact rows.
export function TradesPanel({ trades, onLogClick, onClose }: Props) {
  const open = trades.filter((t) => t.status === "OPEN").length;

  return (
    <div className="bg-t-card border border-t-border rounded p-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-t-muted">
          Trades{trades.length > 0 && <span className="text-t-dim"> · {open} open</span>}
        </span>
        <button
          onClick={onLogClick}
          className="text-[10px] bg-t-blue/15 border border-t-blue text-t-blue rounded px-2 py-0.5 font-bold hover:bg-t-blue/25"
        >
          + Log
        </button>
      </div>

      {trades.length === 0 ? (
        <div className="text-[11px] text-t-muted italic">Log a trade to start the mirror.</div>
      ) : (
        <div className="max-h-48 overflow-y-auto -mx-0.5">
          {trades.map((t) => (
            <TradeRow key={t.id} trade={t} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeRow({ trade: t, onClose }: { trade: TradeRecord; onClose: Props["onClose"] }) {
  const [open, setOpen] = useState(false);
  const overrode = t.sizeUsedPct > t.recSizePct + 5;

  return (
    <div className="px-0.5 py-1 border-b border-t-border last:border-0 text-[11px]">
      <div className="flex items-center gap-1.5">
        <span className="font-bold w-10 truncate">{t.ticker}</span>
        <span className={t.dirTaken === "PUTS" ? "text-t-red" : "text-t-green"}>{t.dirTaken === "PUTS" ? "▼" : "▲"}</span>
        <span className="text-t-muted tabular-nums" title={overrode ? `you ${t.sizeUsedPct}% vs ${t.recSizePct}% rec` : `${t.sizeUsedPct}%`}>
          {t.sizeUsedPct}%{overrode && <span className="text-t-red">!</span>}
        </span>
        <span className="ml-auto">
          {t.status === "CLOSED" ? (
            <span className={`tabular-nums font-bold ${(t.pnl ?? 0) >= 0 ? "text-t-green" : "text-t-red"}`}>
              {t.pnl == null ? "—" : `${t.pnl < 0 ? "−$" : "+$"}${Math.abs(t.pnl).toLocaleString("en-US")}`}
            </span>
          ) : (
            <button onClick={() => setOpen((o) => !o)} className="text-t-blue underline">close</button>
          )}
        </span>
      </div>
      {open && t.status === "OPEN" && <CloseForm id={t.id} onClose={onClose} onDone={() => setOpen(false)} />}
    </div>
  );
}

function CloseForm({ id, onClose, onDone }: { id: string; onClose: Props["onClose"]; onDone: () => void }) {
  const [pnl, setPnl] = useState("");
  const [win, setWin] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const pnlNum = pnl.trim() === "" ? null : Number(pnl);
    await onClose(id, { pnl: pnlNum, win: win ?? (pnlNum != null ? pnlNum >= 0 : null) });
    onDone();
  }

  return (
    <div className="mt-1.5 flex gap-1 items-center">
      <input
        value={pnl}
        onChange={(e) => setPnl(e.target.value)}
        placeholder="P&L $"
        inputMode="numeric"
        className="w-16 bg-t-bg border border-t-border rounded px-1.5 py-0.5 text-[11px] tabular-nums"
      />
      <button onClick={() => setWin(true)} className={`px-1.5 py-0.5 rounded text-[10px] border ${win === true ? "bg-t-green/15 border-t-green text-t-green" : "border-t-border text-t-muted"}`}>W</button>
      <button onClick={() => setWin(false)} className={`px-1.5 py-0.5 rounded text-[10px] border ${win === false ? "bg-t-red/15 border-t-red text-t-red" : "border-t-border text-t-muted"}`}>L</button>
      <button onClick={submit} disabled={busy} className="ml-auto px-2 py-0.5 rounded bg-t-blue/15 border border-t-blue text-t-blue text-[10px] font-bold disabled:opacity-50">
        {busy ? "…" : "save"}
      </button>
    </div>
  );
}
