import type { Candle } from "./types.js";

const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooChartResult {
  meta: {
    regularMarketPrice: number;
    chartPreviousClose: number;
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: (number | null)[];
      high: (number | null)[];
      low: (number | null)[];
      close: (number | null)[];
      volume: (number | null)[];
    }>;
  };
}

interface YahooResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: unknown;
  };
}

async function fetchYahooChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<{ price: number; prevClose: number; bars: Candle[] }> {
  const url = `${BASE_URL}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) {
    return { price: 0, prevClose: 0, bars: [] };
  }

  const data = (await res.json()) as YahooResponse;
  if (!data.chart.result || data.chart.result.length === 0) {
    return { price: 0, prevClose: 0, bars: [] };
  }

  const result = data.chart.result[0];
  const price = result.meta.regularMarketPrice;
  const prevClose = result.meta.chartPreviousClose;

  const bars: Candle[] = [];
  const q = result.indicators.quote[0];
  const timestamps = result.timestamp;

  if (timestamps && q) {
    for (let i = 0; i < timestamps.length; i++) {
      const o = q.open[i];
      const h = q.high[i];
      const l = q.low[i];
      const c = q.close[i];
      const v = q.volume[i];
      if (o != null && h != null && l != null && c != null) {
        bars.push({ o, h, l, c, v: v ?? 0, t: timestamps[i] * 1000 });
      }
    }
  }

  return { price, prevClose, bars };
}

// ─── VIX ──────────────────────────────────────────────────────

export async function fetchVixData(): Promise<{
  level: number;
  change: number;
  bars: Candle[];
}> {
  const { price, prevClose, bars } = await fetchYahooChart("^VIX", "1y", "1d");
  return {
    level: price,
    change: price - prevClose,
    bars,
  };
}

// ─── TNX (10-Year Treasury Yield) ─────────────────────────────

export async function fetchTnxData(): Promise<{
  price: number;
  bars: Candle[];
}> {
  const { price, bars } = await fetchYahooChart("^TNX", "1mo", "1d");
  return { price, bars };
}

// ─── DXY (US Dollar Index) ────────────────────────────────────

export async function fetchDxyData(): Promise<{
  price: number;
  bars: Candle[];
}> {
  const { price, bars } = await fetchYahooChart("DX-Y.NYB", "1mo", "1d");
  return { price, bars };
}
