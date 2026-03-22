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
    <div className="bg-t-surface border-b border-t-border">
      {/* Ticker Tape */}
      {data && <TickerTape tickers={data.tickerPrices} />}

      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="text-t-blue font-bold text-sm tracking-wider">SHOULD I BE TRADING?</span>
          <ModeToggle mode={mode} onChange={onModeChange} />
        </div>

        <div className="flex items-center gap-4">
          {/* Market status */}
          <div className="flex items-center gap-2">
            {data?.marketOpen ? (
              <>
                <span className="live-dot w-2 h-2 rounded-full bg-t-green inline-block" />
                <span className="text-t-green text-xs font-medium">LIVE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-t-muted inline-block" />
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
            className="text-t-muted hover:text-t-blue text-xs border border-t-border rounded px-2 py-1 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "REFRESH"}
          </button>
        </div>
      </div>
    </div>
  );
}
