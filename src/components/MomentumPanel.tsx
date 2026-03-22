import type { MarketScoreResponse } from "../types.js";
import { CategoryPanel, MetricRow } from "./CategoryPanel.js";

interface Props {
  data: MarketScoreResponse["momentum"];
}

export function MomentumPanel({ data }: Props) {
  return (
    <CategoryPanel title="Momentum" score={data.score}>
      <MetricRow
        label="Sectors Positive"
        value={`${data.pctPositive}%`}
        interpretation={data.pctPositive > 70 ? "healthy" : data.pctPositive < 40 ? "weakening" : "neutral"}
      />
      <MetricRow
        label="Top3-Bot3 Spread"
        value={`${data.topBottomSpread.toFixed(2)}%`}
        interpretation={data.topBottomSpread > 1.0 ? "healthy" : "neutral"}
      />

      {/* Top 3 sectors */}
      <div className="pt-1 border-t border-t-border">
        <div className="text-t-muted mb-1">Leaders</div>
        {data.sectors.slice(0, 3).map((s) => (
          <div key={s.ticker} className="flex justify-between py-0.5">
            <span className="text-t-muted">{s.ticker}</span>
            <span className="text-t-green">+{s.changePercent.toFixed(2)}%</span>
          </div>
        ))}
      </div>

      {/* Bottom 3 */}
      <div>
        <div className="text-t-muted mb-1">Laggards</div>
        {data.sectors.slice(-3).map((s) => (
          <div key={s.ticker} className="flex justify-between py-0.5">
            <span className="text-t-muted">{s.ticker}</span>
            <span className={s.changePercent >= 0 ? "text-t-green" : "text-t-red"}>
              {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div className="text-t-muted pt-1 border-t border-t-border">{data.details}</div>
    </CategoryPanel>
  );
}
