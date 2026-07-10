import { useState, useEffect, useCallback } from "react";
import type { TradeRecord, CalibrationResult } from "../types.js";
import {
  fetchTrades,
  fetchCalibration,
  createTrade,
  closeTrade,
  type NewTradeBody,
} from "../services/api.js";

export function useTrades() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [calibration, setCalibration] = useState<CalibrationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const [t, c] = await Promise.all([fetchTrades(), fetchCalibration()]);
      setTrades(t.trades);
      setCalibration(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trades");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const logTrade = useCallback(
    async (body: NewTradeBody) => {
      await createTrade(body);
      await reload();
    },
    [reload],
  );

  const finishTrade = useCallback(
    async (id: string, outcome: { pnl?: number | null; rMultiple?: number | null; win?: boolean | null; notes?: string }) => {
      await closeTrade(id, outcome);
      await reload();
    },
    [reload],
  );

  return { trades, calibration, loading, error, reload, logTrade, finishTrade };
}
