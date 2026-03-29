import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import * as cache from "../lib/cache.js";
import { fetchDailyBars } from "../lib/polygon.js";
import { fetchVixData, fetchTnxData, fetchDxyData } from "../lib/yahoo.js";
import { computeVixData, scoreVolatility } from "../lib/scoring/volatility.js";
import { computeTrendData, scoreTrend } from "../lib/scoring/trend.js";
import { computeMacroData, scoreMacro } from "../lib/scoring/macro.js";
import { scoreBreadth } from "../lib/scoring/breadth.js";
import { computeQualityScore, computeDecision } from "../lib/scoring/composite.js";
import type { Candle, BreadthData, TradingMode } from "../lib/types.js";

interface DayScore {
  date: string;
  decision: "YES" | "CAUTION" | "NO";
  qualityScore: number;
  volatilityScore: number;
  trendScore: number;
  macroScore: number;
  vixLevel: number;
  spyPrice: number;
  regime: string;
}

function findBarIndex(bars: Candle[], targetDate: string): number {
  // Find the bar whose date matches (bars are in ascending order)
  const targetMs = new Date(targetDate + "T00:00:00").getTime();
  for (let i = bars.length - 1; i >= 0; i--) {
    const barDate = new Date(bars[i].t).toISOString().slice(0, 10);
    if (barDate <= targetDate) return i;
  }
  return -1;
}

function getTradingDays(bars: Candle[], count: number): string[] {
  // Get the last N unique trading day dates from bars
  const dates: string[] = [];
  for (let i = bars.length - 1; i >= 0 && dates.length < count; i--) {
    const d = new Date(bars[i].t).toISOString().slice(0, 10);
    if (!dates.includes(d)) dates.push(d);
  }
  return dates.reverse();
}

function computeSMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1] ?? 0;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

async function marketHistoryHandler(
  req: HttpRequest,
  ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const mode = (req.query.get("mode") === "day" ? "day" : "swing") as TradingMode;
    const cacheKey = `market-history-${mode}`;

    const cached = cache.get<DayScore[]>(cacheKey);
    if (cached) return { jsonBody: cached };

    ctx.log("Computing 7-day market history...");

    // Fetch all historical data in parallel
    const [spyBars, qqqBars, vixYahoo, tnxYahoo, dxyYahoo] = await Promise.all([
      fetchDailyBars("SPY", 250),
      fetchDailyBars("QQQ", 60),
      fetchVixData(),
      fetchTnxData(),
      fetchDxyData(),
    ]);

    // Get last 7 trading days from SPY bars
    const tradingDays = getTradingDays(spyBars, 7);
    const results: DayScore[] = [];

    // Neutral breadth (no historical data available)
    const neutralBreadth: BreadthData = {
      above20d: 50, above50d: 50, above200d: 50,
      advDeclineRatio: 1, newHighs: 0, newLows: 0, nhNlRatio: 0.5,
    };

    for (const date of tradingDays) {
      const spyIdx = findBarIndex(spyBars, date);
      const qqqIdx = findBarIndex(qqqBars, date);
      const vixIdx = findBarIndex(vixYahoo.bars, date);
      const tnxIdx = findBarIndex(tnxYahoo.bars, date);
      const dxyIdx = findBarIndex(dxyYahoo.bars, date);

      if (spyIdx < 0 || spyIdx < 200) continue; // need 200 bars for MA200

      // Slice bars up to this day
      const spySlice = spyBars.slice(0, spyIdx + 1);
      const qqqSlice = qqqIdx >= 0 ? qqqBars.slice(0, qqqIdx + 1) : qqqBars;
      const vixSlice = vixIdx >= 0 ? vixYahoo.bars.slice(0, vixIdx + 1) : vixYahoo.bars;
      const tnxSlice = tnxIdx >= 0 ? tnxYahoo.bars.slice(0, tnxIdx + 1) : tnxYahoo.bars;
      const dxySlice = dxyIdx >= 0 ? dxyYahoo.bars.slice(0, dxyIdx + 1) : dxyYahoo.bars;

      // Volatility
      const vixBar = vixSlice[vixSlice.length - 1];
      const vixLevel = vixBar ? vixBar.c : 20;
      const vixPrev = vixSlice.length >= 2 ? vixSlice[vixSlice.length - 2].c : vixLevel;
      const vixData = computeVixData(vixLevel, vixLevel - vixPrev, vixSlice);
      const volResult = scoreVolatility(vixData);

      // Trend
      const trendData = computeTrendData(spySlice, qqqSlice);
      const spyCloses = spySlice.map((b) => b.c);
      const trendResult = scoreTrend(trendData, spyCloses, mode);

      // Macro
      const macroData = computeMacroData(tnxSlice, dxySlice);
      const macroResult = scoreMacro(macroData, mode);

      // Breadth: neutral (no historical data)
      const breadthResult = scoreBreadth(neutralBreadth);

      // Momentum: approximate from SPY daily change
      const spyChange = spySlice.length >= 2
        ? ((spySlice[spySlice.length - 1].c - spySlice[spySlice.length - 2].c) / spySlice[spySlice.length - 2].c) * 100
        : 0;
      const momentumScore = spyChange > 1.0 ? 85 : spyChange > 0.5 ? 70 : spyChange > 0 ? 55 : spyChange > -0.5 ? 35 : 15;

      // Quality score
      const qualityScore = computeQualityScore(
        volResult.score, momentumScore, trendResult.score,
        breadthResult.score, macroResult.score, mode,
      );

      const { decision, qualityScore: adjusted } = computeDecision(
        qualityScore, volResult.score, vixLevel,
        trendData.spy.price, trendData.spy.ma200, breadthResult.score,
      );

      results.push({
        date,
        decision,
        qualityScore: adjusted,
        volatilityScore: volResult.score,
        trendScore: trendResult.score,
        macroScore: macroResult.score,
        vixLevel: Math.round(vixLevel * 100) / 100,
        spyPrice: Math.round(trendData.spy.price * 100) / 100,
        regime: trendData.spy.regime || trendResult.spy.regime,
      });
    }

    cache.set(cacheKey, results);

    return { jsonBody: results };
  } catch (err) {
    ctx.error("market-history error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: 500, jsonBody: { error: message } };
  }
}

app.http("marketHistory", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "market-history",
  handler: marketHistoryHandler,
});
