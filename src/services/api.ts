import type { MarketScoreResponse, TradingMode } from "../types.js";

const BASE = "/api";

async function request<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
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
