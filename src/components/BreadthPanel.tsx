import type { MarketScoreResponse } from "../types.js";
import { CategoryPanel, MetricRow } from "./CategoryPanel.js";

interface Props {
  data: MarketScoreResponse["breadth"];
}

function breadthInterp(pct: number): "healthy" | "neutral" | "weakening" {
  if (pct > 60) return "healthy";
  if (pct > 40) return "neutral";
  return "weakening";
}

export function BreadthPanel({ data }: Props) {
  return (
    <CategoryPanel title="Breadth" score={data.score}>
      <MetricRow
        label="Above 200d MA"
        value={`${data.above200d}%`}
        interpretation={breadthInterp(data.above200d)}
      />
      <MetricRow
        label="Above 50d MA"
        value={`${data.above50d}%`}
        interpretation={breadthInterp(data.above50d)}
      />
      <MetricRow
        label="Above 20d MA"
        value={`${data.above20d}%`}
        interpretation={breadthInterp(data.above20d)}
      />
      <MetricRow
        label="A/D Ratio"
        value={data.advDeclineRatio.toFixed(2)}
        direction={data.advDeclineRatio > 1 ? "up" : "down"}
        interpretation={data.advDeclineRatio > 1.5 ? "healthy" : data.advDeclineRatio < 0.7 ? "risk-off" : "neutral"}
      />
      <MetricRow
        label="New Highs / Lows"
        value={`${data.newHighs} / ${data.newLows}`}
        interpretation={data.nhNlRatio > 0.6 ? "bullish" : data.nhNlRatio < 0.4 ? "bearish" : "neutral"}
      />
      <div className="text-t-muted pt-1 border-t border-t-border">{data.details}</div>
    </CategoryPanel>
  );
}
