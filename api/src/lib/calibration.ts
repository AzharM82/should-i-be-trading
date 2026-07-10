import type { TradeRecord } from "./types.js";

// How many size-% points over the recommendation still counts as "followed".
const SIZE_TOLERANCE = 5;

export interface BucketStat {
  count: number;
  totalPnl: number;
  avgPnl: number;
  winRate: number; // 0-100, over trades that recorded win/loss
  avgR: number | null;
}

export interface RegimeBucket extends BucketStat {
  key: string;          // e.g. "swing·BULLISH"
  mode: "swing" | "day";
  bias: TradeRecord["recBias"];
  edge: "GOOD" | "POOR" | "NEUTRAL" | "INSUFFICIENT";
}

export interface CalibrationResult {
  totalClosed: number;
  followed: BucketStat;   // you sized at or under the recommended cap
  exceeded: BucketStat;   // you went bigger than recommended
  byRegime: RegimeBucket[];
  headlines: string[];
}

// Minimum closed trades in a regime bucket before we trust its edge.
export const MIN_SAMPLE = 10;

function didFollow(t: TradeRecord): boolean {
  // Tool said sit out (rec 0) but you traded → not followed.
  return t.sizeUsedPct <= t.recSizePct + SIZE_TOLERANCE;
}

function emptyStat(): { count: number; pnl: number; wins: number; decided: number; rSum: number; rCount: number } {
  return { count: 0, pnl: 0, wins: 0, decided: 0, rSum: 0, rCount: 0 };
}

function finalize(acc: ReturnType<typeof emptyStat>): BucketStat {
  return {
    count: acc.count,
    totalPnl: Math.round(acc.pnl),
    avgPnl: acc.count ? Math.round(acc.pnl / acc.count) : 0,
    winRate: acc.decided ? Math.round((acc.wins / acc.decided) * 100) : 0,
    avgR: acc.rCount ? Math.round((acc.rSum / acc.rCount) * 100) / 100 : null,
  };
}

function accumulate(acc: ReturnType<typeof emptyStat>, t: TradeRecord): void {
  acc.count++;
  if (typeof t.pnl === "number") acc.pnl += t.pnl;
  if (typeof t.win === "boolean") {
    acc.decided++;
    if (t.win) acc.wins++;
  }
  if (typeof t.rMultiple === "number") {
    acc.rSum += t.rMultiple;
    acc.rCount++;
  }
}

export function computeCalibration(trades: TradeRecord[]): CalibrationResult {
  const closed = trades.filter((t) => t.status === "CLOSED");

  const followedAcc = emptyStat();
  const exceededAcc = emptyStat();
  const regimeAccs = new Map<string, { mode: "swing" | "day"; bias: TradeRecord["recBias"]; acc: ReturnType<typeof emptyStat> }>();

  for (const t of closed) {
    accumulate(didFollow(t) ? followedAcc : exceededAcc, t);

    const key = `${t.mode}·${t.recBias}`;
    if (!regimeAccs.has(key)) regimeAccs.set(key, { mode: t.mode, bias: t.recBias, acc: emptyStat() });
    accumulate(regimeAccs.get(key)!.acc, t);
  }

  const followed = finalize(followedAcc);
  const exceeded = finalize(exceededAcc);

  const byRegime: RegimeBucket[] = [...regimeAccs.entries()]
    .map(([key, v]) => {
      const stat = finalize(v.acc);
      let edge: RegimeBucket["edge"];
      if (stat.count < MIN_SAMPLE) edge = "INSUFFICIENT";
      else if (stat.avgPnl > 0 && stat.winRate >= 50) edge = "GOOD";
      else if (stat.avgPnl < 0 || stat.winRate < 40) edge = "POOR";
      else edge = "NEUTRAL";
      return { key, mode: v.mode, bias: v.bias, edge, ...stat };
    })
    .sort((a, b) => b.count - a.count);

  const headlines = buildHeadlines(followed, exceeded);

  return { totalClosed: closed.length, followed, exceeded, byRegime, headlines };
}

function money(n: number): string {
  const sign = n < 0 ? "−" : "+";
  return `${sign}$${Math.abs(n).toLocaleString("en-US")}`;
}

function buildHeadlines(followed: BucketStat, exceeded: BucketStat): string[] {
  const out: string[] = [];
  if (exceeded.count > 0) {
    out.push(
      `When you went BIGGER than the tool recommended: ${exceeded.count} trade${exceeded.count === 1 ? "" : "s"}, ${money(exceeded.totalPnl)}, ${exceeded.winRate}% win rate.`,
    );
  }
  if (followed.count > 0) {
    out.push(
      `When you FOLLOWED the size cap: ${followed.count} trade${followed.count === 1 ? "" : "s"}, ${money(followed.totalPnl)}, ${followed.winRate}% win rate.`,
    );
  }
  if (exceeded.count > 0 && followed.count > 0) {
    const diff = followed.avgPnl - exceeded.avgPnl;
    if (diff > 0) {
      out.push(`On average, following the cap earned ${money(diff)} more per trade than overriding it.`);
    }
  }
  if (out.length === 0) {
    out.push("No closed trades yet — log a few and the mirror will show what your habits cost or earn.");
  }
  return out;
}
