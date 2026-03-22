import type { MarketScoreResponse } from "../types.js";
import { CategoryPanel, MetricRow } from "./CategoryPanel.js";

interface Props {
  data: MarketScoreResponse["volatility"];
}

export function VolatilityPanel({ data }: Props) {
  const { vix } = data;

  const vixInterp = vix.level < 18 ? "healthy" : vix.level < 25 ? "elevated" : "risk-off";
  const trendDir = vix.trend === "falling" ? "down" : vix.trend === "rising" ? "up" : "flat";

  return (
    <CategoryPanel title="Volatility" score={data.score}>
      <MetricRow
        label="VIX"
        value={vix.level.toFixed(1)}
        direction={trendDir}
        interpretation={vixInterp}
      />
      <MetricRow
        label="5d Change"
        value={`${vix.change5d > 0 ? "+" : ""}${vix.change5d.toFixed(1)}%`}
        direction={vix.change5d > 2 ? "up" : vix.change5d < -2 ? "down" : "flat"}
      />
      <MetricRow
        label="Percentile"
        value={`${vix.percentile}th`}
        interpretation={vix.percentile < 30 ? "healthy" : vix.percentile > 70 ? "risk-off" : "neutral"}
      />
      <div className="text-t-muted pt-1 border-t border-t-border">{data.details}</div>
    </CategoryPanel>
  );
}
