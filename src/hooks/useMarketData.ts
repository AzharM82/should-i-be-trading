import { useState, useEffect, useCallback, useRef } from "react";
import type { MarketScoreResponse, TradingMode } from "../types.js";
import { fetchMarketScore } from "../services/api.js";

const REFRESH_INTERVAL = 45_000; // 45 seconds

export function useMarketData(mode: TradingMode) {
  const [data, setData] = useState<MarketScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingRef = useRef(false);

  const doFetch = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setError(null);
      const result = await fetchMarketScore(mode);
      setData(result);

      // If market is closed, don't auto-refresh
      if (!result.marketOpen && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [mode]);

  const refresh = useCallback(() => {
    setLoading(true);
    doFetch();
  }, [doFetch]);

  useEffect(() => {
    setLoading(true);
    doFetch();

    // Set up auto-refresh
    intervalRef.current = setInterval(doFetch, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [doFetch]);

  return { data, loading, error, refresh };
}
