import type { MarketScoreResponse } from "../types.js";
import { CategoryPanel, MetricRow } from "./CategoryPanel.js";

interface Props {
  data: MarketScoreResponse["macro"];
}

export function MacroPanel({ data }: Props) {
  const tnxDir = data.tnx.trend === "rising" ? "up" : data.tnx.trend === "falling" ? "down" : "flat";
  const dxyDir = data.dxy.trend === "rising" ? "up" : data.dxy.trend === "falling" ? "down" : "flat";

  // For stocks: falling yields & falling dollar = favorable
  const tnxInterp = data.tnx.trend === "falling" ? "favorable" : data.tnx.trend === "rising" ? "risk-off" : "neutral";
  const dxyInterp = data.dxy.trend === "falling" ? "favorable" : data.dxy.trend === "rising" ? "risk-off" : "neutral";

  return (
    <CategoryPanel title="Macro" score={data.score}>
      <MetricRow
        label="10Y Yield"
        value={data.tnx.price > 10 ? (data.tnx.price / 10).toFixed(2) + "%" : data.tnx.price.toFixed(2) + "%"}
        direction={tnxDir}
        interpretation={tnxInterp}
      />
      <MetricRow
        label="DXY"
        value={data.dxy.price.toFixed(2)}
        direction={dxyDir}
        interpretation={dxyInterp}
      />
      <MetricRow
        label="Next FOMC"
        value={data.fomcProximity.isToday ? "TODAY" : `${data.fomcProximity.daysUntil}d`}
        interpretation={data.fomcProximity.daysUntil <= 3 ? "risk-off" : "neutral"}
      />
      <div className="text-t-muted pt-1 border-t border-t-border">{data.details}</div>
    </CategoryPanel>
  );
}
