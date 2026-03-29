import { useState, useEffect } from "react";
import type { TradingMode } from "../types.js";

interface DayScore {
  date: string;
  decision: "YES" | "CAUTION" | "NO";
  qualityScore: number;
  volatilityScore: number;
  trendScore: number;
  macroScore: number;
  vixLevel: number;
  spyPrice: number;
  regime: string;
}

const DECISION_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  YES: { bg: "bg-t-green/10", text: "text-t-green", border: "border-t-green/40" },
  CAUTION: { bg: "bg-t-amber/10", text: "text-t-amber", border: "border-t-amber/40" },
  NO: { bg: "bg-t-red/10", text: "text-t-red", border: "border-t-red/40" },
};

function formatDate(dateStr: string): { day: string; date: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function scoreBarWidth(score: number): string {
  return `${Math.max(4, score)}%`;
}

function scoreColor(score: number): string {
  if (score >= 65) return "bg-t-green";
  if (score >= 40) return "bg-t-amber";
  return "bg-t-red";
}

export function TrendHistory({ mode }: { mode: TradingMode }) {
  const [history, setHistory] = useState<DayScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/market-history?mode=${mode}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mode]);

  if (loading) {
    return (
      <div className="bg-t-card border border-t-border rounded overflow-hidden">
        <div className="px-4 py-2.5 border-b border-t-border">
          <span
            className="text-xs font-bold uppercase tracking-widest text-t-text"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            7-Day Trend
          </span>
        </div>
        <div className="p-4 text-center text-t-muted text-xs">Loading history...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-t-card border border-t-border rounded overflow-hidden">
        <div className="px-4 py-2.5 border-b border-t-border">
          <span
            className="text-xs font-bold uppercase tracking-widest text-t-text"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            7-Day Trend
          </span>
        </div>
        <div className="p-4 text-center text-t-muted text-xs">No historical data available</div>
      </div>
    );
  }

  // Find trend changes
  const changes: number[] = [];
  for (let i = 1; i < history.length; i++) {
    if (history[i].decision !== history[i - 1].decision) changes.push(i);
  }

  return (
    <div className="bg-t-card border border-t-border rounded overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-t-border">
        <span
          className="text-xs font-bold uppercase tracking-widest text-t-text"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          7-Day Trend
        </span>
        <span className="text-[10px] text-t-muted">
          {changes.length === 0
            ? "No signal change"
            : `${changes.length} signal change${changes.length > 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="p-3">
        {/* Timeline rows */}
        <div className="space-y-0">
          {history.map((day, i) => {
            const { day: dayName, date } = formatDate(day.date);
            const style = DECISION_STYLES[day.decision];
            const isChange = changes.includes(i);
            const isToday = i === history.length - 1;
            const prevDay = i > 0 ? history[i - 1] : null;
            const scoreDelta = prevDay ? day.qualityScore - prevDay.qualityScore : 0;

            return (
              <div key={day.date}>
                {/* Signal change marker */}
                {isChange && (
                  <div className="flex items-center gap-1.5 py-0.5 px-1">
                    <div className="flex-1 border-t border-dashed border-t-amber/50" />
                    <span className="text-[8px] text-t-amber font-semibold uppercase tracking-wider">
                      Changed
                    </span>
                    <div className="flex-1 border-t border-dashed border-t-amber/50" />
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                    isToday ? "bg-t-surface/80 border border-t-border/50" : ""
                  }`}
                >
                  {/* Date */}
                  <div className="w-14 flex-shrink-0">
                    <div className="text-[9px] text-t-muted leading-tight">{dayName}</div>
                    <div className="text-[11px] text-t-text font-semibold leading-tight">{date}</div>
                  </div>

                  {/* Decision badge */}
                  <div
                    className={`w-14 flex-shrink-0 text-center text-[9px] font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {day.decision}
                  </div>

                  {/* Score bar */}
                  <div className="flex-1 flex items-center gap-1.5">
                    <div className="flex-1 h-2.5 bg-t-surface rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all ${scoreColor(day.qualityScore)}`}
                        style={{ width: scoreBarWidth(day.qualityScore) }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-t-text w-6 text-right">{day.qualityScore}</span>
                    {scoreDelta !== 0 && (
                      <span
                        className={`text-[9px] font-semibold w-6 text-right ${
                          scoreDelta > 0 ? "text-t-green" : "text-t-red"
                        }`}
                      >
                        {scoreDelta > 0 ? "+" : ""}{scoreDelta}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
