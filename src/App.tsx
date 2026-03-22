import { useState } from "react";
import type { TradingMode } from "./types.js";
import { useMarketData } from "./hooks/useMarketData.js";
import { TopBar } from "./components/TopBar.js";
import { AlertBanner } from "./components/AlertBanner.js";
import { HeroPanel } from "./components/HeroPanel.js";
import { SummaryBanner } from "./components/SummaryBanner.js";
import { VolatilityPanel } from "./components/VolatilityPanel.js";
import { TrendPanel } from "./components/TrendPanel.js";
import { BreadthPanel } from "./components/BreadthPanel.js";
import { MomentumPanel } from "./components/MomentumPanel.js";
import { SectorHeatmap } from "./components/SectorHeatmap.js";
import { MacroPanel } from "./components/MacroPanel.js";
import { ExecutionWindow } from "./components/ExecutionWindow.js";
import { ScoringBreakdown } from "./components/ScoringBreakdown.js";
import { LoadingSkeleton } from "./components/LoadingSkeleton.js";

export function App() {
  const [mode, setMode] = useState<TradingMode>("swing");
  const { data, loading, error, refresh } = useMarketData(mode);

  if (loading && !data) {
    return <LoadingSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-t-bg flex items-center justify-center">
        <div className="bg-t-card border border-t-red/30 rounded-lg p-8 max-w-md text-center">
          <div className="text-t-red text-lg font-bold mb-2">Connection Error</div>
          <div className="text-t-muted text-sm mb-4">{error}</div>
          <button
            onClick={refresh}
            className="bg-t-blue/20 text-t-blue border border-t-blue/30 rounded px-4 py-2 text-sm hover:bg-t-blue/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-t-bg">
      {/* Top Bar */}
      <TopBar
        data={data}
        mode={mode}
        onModeChange={setMode}
        onRefresh={refresh}
        loading={loading}
      />

      {/* Alert Banner */}
      <AlertBanner fomc={data.macro.fomcProximity} />

      {/* Main Content */}
      <main className="p-3 space-y-3">
        {/* Hero + Summary Row */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4">
            <HeroPanel
              decision={data.decision}
              qualityScore={data.qualityScore}
              executionScore={data.executionScore}
            />
          </div>
          <div className="col-span-8">
            <SummaryBanner summary={data.summary} decision={data.decision} />
          </div>
        </div>

        {/* Category Panels Row */}
        <div className="grid grid-cols-4 gap-3">
          <VolatilityPanel data={data.volatility} />
          <TrendPanel data={data.trend} />
          <BreadthPanel data={data.breadth} />
          <MomentumPanel data={data.momentum} />
        </div>

        {/* Sector Heatmap + Macro + Execution Row */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-6">
            <SectorHeatmap sectors={data.momentum.sectors} />
          </div>
          <div className="col-span-3">
            <MacroPanel data={data.macro} />
          </div>
          <div className="col-span-3">
            <ExecutionWindow data={data.execution} />
          </div>
        </div>

        {/* Scoring Breakdown */}
        <ScoringBreakdown data={data} />

        {/* Footer */}
        <div className="text-center text-t-dim text-[10px] py-2">
          SHOULD I BE TRADING? v1.0 — {data.mode.toUpperCase()} MODE — Data: Polygon.io + FinViz Elite
        </div>
      </main>
    </div>
  );
}
