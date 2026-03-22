import type { MarketScoreResponse, TradingMode } from "../types.js";

export function computeDecision(
  qualityScore: number,
  volatilityScore: number,
  vixLevel: number,
  spyPrice: number,
  spyMa200: number,
  breadthScore: number,
): { decision: "YES" | "CAUTION" | "NO"; qualityScore: number } {
  let decision: "YES" | "CAUTION" | "NO";

  // Override rules
  if (vixLevel > 35) {
    return { decision: "NO", qualityScore: Math.min(qualityScore, 35) };
  }

  if (spyPrice < spyMa200 && breadthScore < 30) {
    return { decision: "NO", qualityScore: Math.min(qualityScore, 35) };
  }

  // Standard thresholds
  if (qualityScore >= 65) {
    decision = "YES";
  } else if (qualityScore >= 40) {
    decision = "CAUTION";
  } else {
    decision = "NO";
  }

  return { decision, qualityScore };
}

export function computeQualityScore(
  volatility: number,
  momentum: number,
  trend: number,
  breadth: number,
  macro: number,
  _mode: TradingMode,
): number {
  return Math.round(
    volatility * 0.25 +
    momentum * 0.25 +
    trend * 0.20 +
    breadth * 0.20 +
    macro * 0.10
  );
}

export type { MarketScoreResponse };
