import { useState } from "react";
import type { TradeRecord } from "../types.js";

interface Props {
  trades: TradeRecord[];
  onLogClick: () => void;
  onClose: (id: string, outcome: { pnl?: number | null; win?: boolean | null; notes?: string }) => Promise<void>;
}

export function TradesPanel({ trades, onLogClick, onClose }: Props) {
  return (
    <div className="bg-t-card border border-t-border rounded p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-widest text-t-muted">My Trades</div>
        <button
          onClick={onLogClick}
          className="text-[11px] bg-t-blue/15 border border-t-blue text-t-blue rounded px-2.5 py-1 font-bold hover:bg-t-blue/25"
        >
          + Log trade
        </button>
      </div>

      {trades.length === 0 ? (
        <div className="text-t-muted text-[12px] italic py-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          No trades logged yet. When you take a trade, log it — the app snapshots what it recommended so you can
          compare later.
        </div>
      ) : (
        <div className="overflow-y-auto max-h-64 -mx-1">
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
    <div className="px-1 py-1.5 border-b border-t-border last:border-0 text-[12px]">
      <div className="flex items-center gap-2">
        <span className="font-bold w-12">{t.ticker}</span>
        <span className={t.dirTaken === "PUTS" ? "text-t-red" : "text-t-green"}>{t.dirTaken}</span>
        <span className="text-t-muted tabular-nums">
          {t.sizeUsedPct}%{overrode && <span className="text-t-red"> vs {t.recSizePct}% rec</span>}
        </span>
        <span className="ml-auto">
          {t.status === "CLOSED" ? (
            <span className={`tabular-nums font-bold ${(t.pnl ?? 0) >= 0 ? "text-t-green" : "text-t-red"}`}>
              {t.pnl == null ? "—" : `${t.pnl < 0 ? "−$" : "+$"}${Math.abs(t.pnl).toLocaleString("en-US")}`}
            </span>
          ) : (
            <button onClick={() => setOpen((o) => !o)} className="text-t-blue text-[11px] underline">
              Close
            </button>
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
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const pnlNum = pnl.trim() === "" ? null : Number(pnl);
    await onClose(id, {
      pnl: pnlNum,
      win: win ?? (pnlNum != null ? pnlNum >= 0 : null),
      notes,
    });
    onDone();
  }

  return (
    <div className="mt-2 p-2 bg-t-surface rounded space-y-2">
      <div className="flex gap-2 items-center">
        <input
          value={pnl}
          onChange={(e) => setPnl(e.target.value)}
          placeholder="P&L $"
          inputMode="numeric"
          className="w-24 bg-t-bg border border-t-border rounded px-2 py-1 text-[12px] tabular-nums"
        />
        <button onClick={() => setWin(true)} className={`px-2 py-1 rounded text-[11px] border ${win === true ? "bg-t-green/15 border-t-green text-t-green" : "border-t-border text-t-muted"}`}>Win</button>
        <button onClick={() => setWin(false)} className={`px-2 py-1 rounded text-[11px] border ${win === false ? "bg-t-red/15 border-t-red text-t-red" : "border-t-border text-t-muted"}`}>Loss</button>
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="notes (optional)"
        className="w-full bg-t-bg border border-t-border rounded px-2 py-1 text-[11px]"
      />
      <button onClick={submit} disabled={busy} className="w-full py-1 rounded bg-t-blue/15 border border-t-blue text-t-blue text-[11px] font-bold disabled:opacity-50">
        {busy ? "Saving…" : "Save outcome"}
      </button>
    </div>
  );
}
