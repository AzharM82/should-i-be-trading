export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  t: number; // timestamp ms
}

export interface SnapshotTicker {
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  day: { o: number; h: number; l: number; c: number; v: number };
  prevDay: { o: number; h: number; l: number; c: number; v: number };
  lastTrade?: { p: number };
  min?: { c: number };
}

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

export interface TrendData {
  spy: {
    price: number;
    ma20: number;
    ma50: number;
    ma200: number;
    rsi14: number;
    regime: string;
  };
  qqq: {
    price: number;
    ma50: number;
  };
}

export interface BreadthData {
  above20d: number;
  above50d: number;
  above200d: number;
  advDeclineRatio: number;
  newHighs: number;
  newLows: number;
  nhNlRatio: number;
}

export interface MacroData {
  tnx: { price: number; change5d: number; trend: "rising" | "falling" | "flat" };
  dxy: { price: number; change5d: number; trend: "rising" | "falling" | "flat" };
  fomcProximity: { daysUntil: number; nextDate: string; isToday: boolean };
}

export interface ExecutionData {
  breakoutsHolding: number;
  pullbacksBought: number;
  followThrough: number;
}

export interface CategoryScore {
  score: number;
  weight: number;
  details: string;
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
  momentum: CategoryScore & { sectors: SectorData[]; topBottomSpread: number; pctPositive: number };
  trend: CategoryScore & TrendData;
  breadth: CategoryScore & BreadthData;
  macro: CategoryScore & MacroData;
  execution: CategoryScore & ExecutionData;

  tickerPrices: Array<{ ticker: string; price: number; change: number; changePercent: number }>;
}

export type TradingMode = "swing" | "day";
