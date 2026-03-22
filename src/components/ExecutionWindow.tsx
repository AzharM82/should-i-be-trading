import type { MarketScoreResponse } from "../types.js";
import { CategoryPanel, MetricRow } from "./CategoryPanel.js";

interface Props {
  data: MarketScoreResponse["execution"];
}

function subScoreInterp(score: number): "healthy" | "neutral" | "weakening" {
  if (score >= 65) return "healthy";
  if (score >= 40) return "neutral";
  return "weakening";
}

export function ExecutionWindow({ data }: Props) {
  return (
    <CategoryPanel title="Execution Window" score={data.score}>
      <MetricRow
        label="Breakouts Holding"
        value={data.breakoutsHolding}
        interpretation={subScoreInterp(data.breakoutsHolding)}
      />
      <MetricRow
        label="Pullbacks Bought"
        value={data.pullbacksBought}
        interpretation={subScoreInterp(data.pullbacksBought)}
      />
      <MetricRow
        label="Follow-Through"
        value={data.followThrough}
        interpretation={subScoreInterp(data.followThrough)}
      />
      <div className="text-t-muted pt-1 border-t border-t-border">{data.details}</div>
    </CategoryPanel>
  );
}
