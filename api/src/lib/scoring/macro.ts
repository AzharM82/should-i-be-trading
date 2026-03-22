import type { Candle, MacroData, CategoryScore, TradingMode } from "../types.js";
import { FOMC_DATES } from "../constants.js";

function interpolate(value: number, breakpoints: [number, number][]): number {
  if (value <= breakpoints[0][0]) return breakpoints[0][1];
  if (value >= breakpoints[breakpoints.length - 1][0]) return breakpoints[breakpoints.length - 1][1];

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const [x0, y0] = breakpoints[i];
    const [x1, y1] = breakpoints[i + 1];
    if (value >= x0 && value <= x1) {
      const t = (value - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return 50;
}

function computeTrend(bars: Candle[]): { change5d: number; trend: "rising" | "falling" | "flat" } {
  if (bars.length < 2) return { change5d: 0, trend: "flat" };

  const recent = bars.slice(-6);
  const current = recent[recent.length - 1].c;
  const fiveDaysAgo = recent[0].c;
  const change5d = fiveDaysAgo > 0 ? ((current - fiveDaysAgo) / fiveDaysAgo) * 100 : 0;

  let trend: "rising" | "falling" | "flat" = "flat";
  if (change5d > 1) trend = "rising";
  else if (change5d < -1) trend = "falling";

  return { change5d: Math.round(change5d * 100) / 100, trend };
}

// TNX is quoted as yield * 10 on Polygon (e.g. 45.2 = 4.52%)
// Rising yields = negative for stocks
function tnxTrendScore(change5dPct: number): number {
  // change5dPct is the % change in TNX value
  // Negative = yields falling = bullish
  return interpolate(-change5dPct, [
    [-5, 10],   // yields rising fast
    [-2, 25],
    [-0.5, 40],
    [0, 60],
    [0.5, 70],
    [2, 80],
    [5, 90],    // yields falling fast
  ]);
}

// Strong dollar generally negative for stocks
function dxyTrendScore(change5dPct: number): number {
  return interpolate(-change5dPct, [
    [-2.0, 15],   // DXY rising fast
    [-1.5, 35],
    [-0.5, 45],
    [0, 55],
    [0.5, 70],
    [1.5, 85],
    [2.0, 95],    // DXY falling fast
  ]);
}

function fomcProximityScore(daysUntil: number, mode: TradingMode): number {
  const dayTradeFloor = mode === "day" ? 10 : 20;

  if (daysUntil <= 0) return dayTradeFloor;
  if (daysUntil === 1) return 30;
  if (daysUntil <= 3) return 45;
  if (daysUntil <= 7) return 60;
  if (daysUntil <= 14) return 75;
  return 85;
}

export function computeFomcProximity(): { daysUntil: number; nextDate: string; isToday: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let closestDate = "";
  let closestDays = Infinity;

  for (const dateStr of FOMC_DATES) {
    const fomcDate = new Date(dateStr + "T00:00:00");
    const diff = Math.ceil((fomcDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < closestDays) {
      closestDays = diff;
      closestDate = dateStr;
    }
  }

  return {
    daysUntil: closestDays === Infinity ? 999 : closestDays,
    nextDate: closestDate || "N/A",
    isToday: closestDays === 0,
  };
}

export function computeMacroData(tnxBars: Candle[], dxyBars: Candle[]): MacroData {
  const tnxTrend = computeTrend(tnxBars);
  const dxyTrend = computeTrend(dxyBars);
  const fomc = computeFomcProximity();

  return {
    tnx: {
      price: tnxBars.length > 0 ? Math.round(tnxBars[tnxBars.length - 1].c * 100) / 100 : 0,
      change5d: tnxTrend.change5d,
      trend: tnxTrend.trend,
    },
    dxy: {
      price: dxyBars.length > 0 ? Math.round(dxyBars[dxyBars.length - 1].c * 100) / 100 : 0,
      change5d: dxyTrend.change5d,
      trend: dxyTrend.trend,
    },
    fomcProximity: fomc,
  };
}

export function scoreMacro(data: MacroData, mode: TradingMode): CategoryScore & MacroData {
  const tnx = tnxTrendScore(data.tnx.change5d);
  const dxy = dxyTrendScore(data.dxy.change5d);
  const fomc = fomcProximityScore(data.fomcProximity.daysUntil, mode);

  const score = Math.round(tnx * 0.40 + dxy * 0.30 + fomc * 0.30);

  let details: string;
  if (data.fomcProximity.daysUntil <= 1) {
    details = `FOMC ${data.fomcProximity.isToday ? "TODAY" : "tomorrow"} — expect volatility`;
  } else if (score >= 65) {
    details = "Macro backdrop supportive";
  } else if (score >= 40) {
    details = "Macro conditions neutral";
  } else {
    details = "Macro headwinds — yields/dollar working against equities";
  }

  return {
    score,
    weight: 0.10,
    details,
    ...data,
  };
}
