export const SECTOR_ETFS: Record<string, string> = {
  XLK: "Technology",
  XLF: "Financials",
  XLE: "Energy",
  XLV: "Health Care",
  XLI: "Industrials",
  XLY: "Consumer Disc.",
  XLP: "Consumer Staples",
  XLU: "Utilities",
  XLB: "Materials",
  XLRE: "Real Estate",
  XLC: "Communication",
};

export const SECTOR_TICKERS = Object.keys(SECTOR_ETFS);

export const KEY_TICKERS = ["SPY", "QQQ", "VIX", ...SECTOR_TICKERS];

// Polygon index tickers for macro
export const MACRO_TICKERS = {
  TNX: "I:TNX",   // 10-Year Treasury Yield
  DXY: "I:DXY",   // US Dollar Index
  // Fallbacks if index tickers don't work
  TNX_FALLBACK: "TLT",
  DXY_FALLBACK: "UUP",
};

// FOMC meeting conclusion dates for 2025-2026
export const FOMC_DATES = [
  "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18",
  "2025-07-30", "2025-09-17", "2025-10-29", "2025-12-17",
  "2026-01-28", "2026-03-18", "2026-05-06", "2026-06-17",
  "2026-07-29", "2026-09-16", "2026-10-28", "2026-12-16",
];

export const SP500_COUNT = 503; // approximate number of S&P 500 stocks
