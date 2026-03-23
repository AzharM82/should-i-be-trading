import type { MarketScoreResponse, TradingMode } from "../types.js";
import { ModeToggle } from "./ModeToggle.js";
import { TickerTape } from "./TickerTape.js";

interface TopBarProps {
  data: MarketScoreResponse | null;
  mode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
  onRefresh: () => void;
  loading: boolean;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function TopBar({ data, mode, onModeChange, onRefresh, loading }: TopBarProps) {
  return (
    <div className="border-b-2 border-t-text">
      {/* Masthead */}
      <div className="text-center py-3 border-b border-t-border">
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-black tracking-tight text-t-text">
          Should I Be Trading?
        </h1>
        <div className="text-t-muted text-[11px] mt-1 tracking-widest uppercase">
          Market Intelligence Report
        </div>
      </div>

      {/* Ticker Tape */}
      {data && <TickerTape tickers={data.tickerPrices} />}

      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-t-border bg-t-surface">
        <div className="flex items-center gap-4">
          <ModeToggle mode={mode} onChange={onModeChange} />
        </div>

        <div className="flex items-center gap-4">
          {/* Market status */}
          <div className="flex items-center gap-2">
            {data?.marketOpen ? (
              <>
                <span className="live-dot w-2 h-2 rounded-full bg-t-green inline-block" />
                <span className="text-t-green text-xs font-semibold">LIVE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-t-dim inline-block" />
                <span className="text-t-muted text-xs">CLOSED</span>
              </>
            )}
          </div>

          {/* Last updated */}
          {data && (
            <span className="text-t-muted text-xs">
              Updated {timeAgo(data.lastUpdated)}
            </span>
          )}

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-t-muted hover:text-t-text text-xs border border-t-border rounded px-2 py-1 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "REFRESH"}
          </button>
        </div>
      </div>
    </div>
  );
}
