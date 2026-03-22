export interface SectorData {
  ticker: string;
  name: string;
  changePercent: number;
  price: number;
}

export interface VixData {
  level: number;
  change: number;
  trend: "rising" | "falling" | "flat";
  percentile: number;
  change5d: number;
}

export interface CategoryScore {
  score: number;
  weight: number;
  details: string;
}

export interface MacroFomc {
  daysUntil: number;
  nextDate: string;
  isToday: boolean;
}

export interface MarketScoreResponse {
  decision: "YES" | "CAUTION" | "NO";
  qualityScore: number;
  executionScore: number;
  mode: "swing" | "day";
  summary: string;
  lastUpdated: string;
  marketOpen: boolean;

  volatility: CategoryScore & { vix: VixData };
  momentum: CategoryScore & {
    sectors: SectorData[];
    topBottomSpread: number;
    pctPositive: number;
  };
  trend: CategoryScore & {
    spy: {
      price: number;
      ma20: number;
      ma50: number;
      ma200: number;
      rsi14: number;
      regime: string;
    };
    qqq: { price: number; ma50: number };
  };
  breadth: CategoryScore & {
    above20d: number;
    above50d: number;
    above200d: number;
    advDeclineRatio: number;
    newHighs: number;
    newLows: number;
    nhNlRatio: number;
  };
  macro: CategoryScore & {
    tnx: { price: number; change5d: number; trend: string };
    dxy: { price: number; change5d: number; trend: string };
    fomcProximity: MacroFomc;
  };
  execution: CategoryScore & {
    breakoutsHolding: number;
    pullbacksBought: number;
    followThrough: number;
  };

  tickerPrices: Array<{
    ticker: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
}

export type TradingMode = "swing" | "day";
