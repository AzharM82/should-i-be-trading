import type { MarketScoreResponse } from "../types.js";
import { CategoryPanel, MetricRow } from "./CategoryPanel.js";

interface Props {
  data: MarketScoreResponse["trend"];
}

export function TrendPanel({ data }: Props) {
  const { spy, qqq } = data;

  const spyAbove50 = spy.price > spy.ma50;
  const spyAbove200 = spy.price > spy.ma200;
  const qqqAbove50 = qqq.price > qqq.ma50;

  return (
    <CategoryPanel title="Trend" score={data.score}>
      <MetricRow
        label="SPY"
        value={spy.price.toFixed(2)}
        direction={spyAbove50 ? "up" : "down"}
        interpretation={spyAbove200 ? "bullish" : "bearish"}
      />
      <div className="flex gap-3 text-[10px]">
        <span className={spy.price > spy.ma20 ? "text-t-green" : "text-t-red"}>
          MA20: {spy.ma20.toFixed(0)}
        </span>
        <span className={spy.price > spy.ma50 ? "text-t-green" : "text-t-red"}>
          MA50: {spy.ma50.toFixed(0)}
        </span>
        <span className={spy.price > spy.ma200 ? "text-t-green" : "text-t-red"}>
          MA200: {spy.ma200.toFixed(0)}
        </span>
      </div>
      <MetricRow
        label="RSI(14)"
        value={spy.rsi14.toFixed(1)}
        interpretation={spy.rsi14 > 70 ? "overbought" : spy.rsi14 < 30 ? "oversold" : spy.rsi14 > 50 ? "healthy" : "weakening"}
      />
      <MetricRow
        label="QQQ vs 50MA"
        value={qqq.price.toFixed(2)}
        direction={qqqAbove50 ? "up" : "down"}
      />
      <MetricRow
        label="Regime"
        value={spy.regime}
        interpretation={spy.regime.includes("Up") ? "bullish" : spy.regime.includes("Down") ? "bearish" : "neutral"}
      />
      <div className="text-t-muted pt-1 border-t border-t-border">{data.details}</div>
    </CategoryPanel>
  );
}
