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

export interface TradePosture {
  size: "FULL" | "HALF" | "QUARTER" | "NONE";
  sizePct: number; // 0 | 25 | 50 | 100
  instrument: "OPTIONS" | "STOCK" | "SPREADS" | "CASH";
  direction: "CALLS" | "PUTS" | "NEITHER";
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  headline: string;
  rationale: string;
}

// ─── Trade log (feedback loop) ─────────────────────────────────────
export interface TradeRecord {
  id: string;
  openedAt: string;
  status: "OPEN" | "CLOSED";

  // What YOU actually did
  ticker: string;
  dirTaken: "CALLS" | "PUTS" | "SHARES";
  sizeUsedPct: number; // 0-100, % of account you deployed
  mode: "swing" | "day";

  // What the TOOL recommended at open (snapshot)
  recSize: TradePosture["size"];
  recSizePct: number;
  recInstrument: TradePosture["instrument"];
  recDirection: TradePosture["direction"];
  recBias: TradePosture["bias"];
  decision: "YES" | "CAUTION" | "NO";
  qualityScore: number;
  execScore: number;
  regime: string;
  vixLevel: number;

  // Outcome (null until closed)
  pnl: number | null;        // dollars
  rMultiple: number | null;  // R
  win: boolean | null;
  notes: string;
  closedAt: string | null;
}

export type NewTradeInput = Omit<TradeRecord, "id" | "openedAt" | "status" | "pnl" | "rMultiple" | "win" | "notes" | "closedAt">;

export interface CloseTradeInput {
  pnl?: number | null;
  rMultiple?: number | null;
  win?: boolean | null;
  notes?: string;
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

  posture: TradePosture;

  tickerPrices: Array<{ ticker: string; price: number; change: number; changePercent: number }>;
}

export type TradingMode = "swing" | "day";
