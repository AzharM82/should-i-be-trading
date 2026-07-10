import type {
  MarketScoreResponse,
  TradingMode,
  TradeRecord,
  CalibrationResult,
} from "../types.js";

const BASE = "/api";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchMarketScore(mode: TradingMode): Promise<MarketScoreResponse> {
  return request<MarketScoreResponse>(`/market-score?mode=${mode}`);
}

// ─── Trade log ─────────────────────────────────────────────────────
export type NewTradeBody = Pick<
  TradeRecord,
  | "ticker" | "dirTaken" | "sizeUsedPct" | "mode"
  | "recSize" | "recSizePct" | "recInstrument" | "recDirection" | "recBias"
  | "decision" | "qualityScore" | "execScore" | "regime" | "vixLevel"
>;

export function fetchTrades(): Promise<{ trades: TradeRecord[] }> {
  return request<{ trades: TradeRecord[] }>("/trades");
}

export function createTrade(body: NewTradeBody): Promise<{ trade: TradeRecord }> {
  return request<{ trade: TradeRecord }>("/trades", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function closeTrade(
  id: string,
  body: { pnl?: number | null; rMultiple?: number | null; win?: boolean | null; notes?: string },
): Promise<{ trade: TradeRecord }> {
  return request<{ trade: TradeRecord }>(`/trades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function fetchCalibration(): Promise<CalibrationResult> {
  return request<CalibrationResult>("/calibration");
}
