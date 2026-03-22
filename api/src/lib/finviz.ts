import type { BreadthData } from "./types.js";
import * as cache from "./cache.js";

function getApiKey(): string {
  const key = process.env.FINVIZ_API_KEY;
  if (!key) throw new Error("FINVIZ_API_KEY not set");
  return key;
}

const BASE_URL = "https://elite.finviz.com/export.ashx";

async function fetchCount(filters: string): Promise<number> {
  const url = `${BASE_URL}?v=111&f=${filters}&auth=${getApiKey()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    if (res.status === 429) {
      // Rate limited — wait and retry once
      await sleep(3000);
      const retry = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!retry.ok) return 0;
      const text = await retry.text();
      return countCsvRows(text);
    }
    return 0;
  }

  const text = await res.text();
  // Check if we got HTML instead of CSV (auth redirect)
  if (text.includes("<!DOCTYPE") || text.includes("<html")) return 0;
  return countCsvRows(text);
}

function countCsvRows(csv: string): number {
  const lines = csv.trim().split("\n");
  // First line is header, rest are data rows
  return Math.max(0, lines.length - 1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Breadth Data ─────────────────────────────────────────────

export async function fetchBreadthData(): Promise<BreadthData> {
  // Check cache first (5 min TTL)
  const cached = cache.get<BreadthData>("finviz-breadth");
  if (cached) return cached;

  // S&P 500 base filter
  const base = "idx_sp500";

  // Fetch all counts sequentially with delays to avoid rate limits
  const above20d = await fetchCount(`${base},ta_sma20_pa`);
  await sleep(1500);

  const above50d = await fetchCount(`${base},ta_sma50_pa`);
  await sleep(1500);

  const above200d = await fetchCount(`${base},ta_sma200_pa`);
  await sleep(1500);

  const advances = await fetchCount(`${base},ta_change_u`);
  await sleep(1500);

  const declines = await fetchCount(`${base},ta_change_d`);
  await sleep(1500);

  const newHighs = await fetchCount(`${base},ta_highlow20d_nh`);
  await sleep(1500);

  const newLows = await fetchCount(`${base},ta_highlow20d_nl`);

  // Total S&P 500 stocks (approximately 503)
  const total = 503;

  const advDeclineRatio = declines > 0 ? advances / declines : advances > 0 ? 10 : 1;
  const nhNlRatio = (newHighs + newLows) > 0 ? newHighs / (newHighs + newLows) : 0.5;

  const result: BreadthData = {
    above20d: Math.round((above20d / total) * 100),
    above50d: Math.round((above50d / total) * 100),
    above200d: Math.round((above200d / total) * 100),
    advDeclineRatio: Math.round(advDeclineRatio * 100) / 100,
    newHighs,
    newLows,
    nhNlRatio: Math.round(nhNlRatio * 100) / 100,
  };

  cache.set("finviz-breadth", result);
  return result;
}
