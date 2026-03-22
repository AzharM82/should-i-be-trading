import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import * as cache from "../lib/cache.js";
import { isMarketOpen } from "../lib/marketHours.js";
import { fetchSnapshot, fetchDailyBars } from "../lib/polygon.js";
import { fetchVixData, fetchTnxData, fetchDxyData } from "../lib/yahoo.js";
import { fetchBreadthData } from "../lib/finviz.js";
import { KEY_TICKERS, SECTOR_TICKERS } from "../lib/constants.js";
import { computeVixData, scoreVolatility } from "../lib/scoring/volatility.js";
import { buildSectorData, scoreMomentum } from "../lib/scoring/momentum.js";
import { computeTrendData, scoreTrend } from "../lib/scoring/trend.js";
import { scoreBreadth } from "../lib/scoring/breadth.js";
import { computeMacroData, scoreMacro } from "../lib/scoring/macro.js";
import { computeExecutionData, scoreExecution } from "../lib/scoring/executionWindow.js";
import { computeQualityScore, computeDecision } from "../lib/scoring/composite.js";
import { generateSummary } from "../lib/scoring/summary.js";
import type { MarketScoreResponse, TradingMode, BreadthData } from "../lib/types.js";

async function marketScoreHandler(
  req: HttpRequest,
  ctx: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const mode = (req.query.get("mode") === "day" ? "day" : "swing") as TradingMode;
    const cacheKey = `market-score-${mode}`;

    // Check cache
    const cached = cache.get<MarketScoreResponse>(cacheKey);
    if (cached) {
      return { jsonBody: cached };
    }

    ctx.log(`Computing market score (mode=${mode})...`);

    // ─── Parallel data fetching ────────────────────────────────
    // Polygon for stocks, Yahoo Finance for indices (VIX, TNX, DXY)

    const [
      stockSnapshots,
      vixYahoo,
      tnxYahoo,
      dxyYahoo,
      spyBars,
      qqqBars,
      breadthData,
    ] = await Promise.all([
      fetchSnapshot(KEY_TICKERS),
      fetchVixData(),
      fetchTnxData(),
      fetchDxyData(),
      fetchDailyBars("SPY", 250),
      fetchDailyBars("QQQ", 60),
      fetchBreadthData().catch((_e): BreadthData => {
        ctx.log("FinViz breadth fetch failed, using defaults");
        return {
          above20d: 50, above50d: 50, above200d: 50,
          advDeclineRatio: 1, newHighs: 0, newLows: 0, nhNlRatio: 0.5,
        };
      }),
    ]);

    // ─── VIX (from Yahoo) ─────────────────────────────────────

    const vixData = computeVixData(vixYahoo.level, vixYahoo.change, vixYahoo.bars);

    // ─── Sectors ───────────────────────────────────────────────

    const sectorData = buildSectorData(stockSnapshots);

    // ─── Trend ─────────────────────────────────────────────────

    const trendData = computeTrendData(spyBars, qqqBars);
    const spyCloses = spyBars.map((b) => b.c);

    // ─── Macro (TNX + DXY from Yahoo) ─────────────────────────

    const macroData = computeMacroData(tnxYahoo.bars, dxyYahoo.bars);
    // Override prices with live Yahoo data
    if (tnxYahoo.price > 0) macroData.tnx.price = Math.round(tnxYahoo.price * 100) / 100;
    if (dxyYahoo.price > 0) macroData.dxy.price = Math.round(dxyYahoo.price * 100) / 100;

    // ─── Execution Window ──────────────────────────────────────

    const executionData = computeExecutionData(spyBars);

    // ─── Scoring ───────────────────────────────────────────────

    const volatilityResult = scoreVolatility(vixData);
    const momentumResult = scoreMomentum(sectorData);
    const trendResult = scoreTrend(trendData, spyCloses, mode);
    const breadthResult = scoreBreadth(breadthData);
    const macroResult = scoreMacro(macroData, mode);
    const executionResult = scoreExecution(executionData);

    const qualityScore = computeQualityScore(
      volatilityResult.score,
      momentumResult.score,
      trendResult.score,
      breadthResult.score,
      macroResult.score,
      mode,
    );

    const { decision, qualityScore: adjustedScore } = computeDecision(
      qualityScore,
      volatilityResult.score,
      vixData.level,
      trendData.spy.price,
      trendData.spy.ma200,
      breadthResult.score,
    );

    // ─── Ticker prices for top bar ─────────────────────────────

    const tickerPrices: MarketScoreResponse["tickerPrices"] = [];
    const displayTickers = ["SPY", "QQQ", ...SECTOR_TICKERS];
    for (const ticker of displayTickers) {
      const snap = stockSnapshots.get(ticker);
      if (snap) {
        tickerPrices.push({
          ticker,
          price: snap.day?.c ?? snap.prevDay?.c ?? 0,
          change: snap.todaysChange ?? 0,
          changePercent: snap.todaysChangePerc ?? 0,
        });
      }
    }
    // Add VIX, TNX, DXY to ticker tape
    tickerPrices.unshift(
      {
        ticker: "VIX",
        price: vixData.level,
        change: vixData.change,
        changePercent: vixData.change5d,
      },
      {
        ticker: "TNX",
        price: macroData.tnx.price,
        change: 0,
        changePercent: macroData.tnx.change5d,
      },
      {
        ticker: "DXY",
        price: macroData.dxy.price,
        change: 0,
        changePercent: macroData.dxy.change5d,
      },
    );

    // ─── Build response ────────────────────────────────────────

    const response: MarketScoreResponse = {
      decision,
      qualityScore: adjustedScore,
      executionScore: executionResult.score,
      mode,
      summary: "",
      lastUpdated: new Date().toISOString(),
      marketOpen: isMarketOpen(),

      volatility: volatilityResult,
      momentum: momentumResult,
      trend: trendResult,
      breadth: breadthResult,
      macro: macroResult,
      execution: executionResult,

      tickerPrices,
    };

    response.summary = generateSummary(response);

    // Cache the result
    cache.set(cacheKey, response);

    return { jsonBody: response };
  } catch (err) {
    ctx.error("market-score error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: 500, jsonBody: { error: message } };
  }
}

app.http("marketScore", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "market-score",
  handler: marketScoreHandler,
});
