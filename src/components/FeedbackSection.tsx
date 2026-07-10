import { useState } from "react";
import type { MarketScoreResponse } from "../types.js";
import { useTrades } from "../hooks/useTrades.js";
import { PosturePanel } from "./PosturePanel.js";
import { CalibrationPanel } from "./CalibrationPanel.js";
import { TradesPanel } from "./TradesPanel.js";
import { LogTradeModal } from "./LogTradeModal.js";

interface Props {
  data: MarketScoreResponse;
}

// The full side rail: the "what to trade" answer on top, the feedback loop below.
export function FeedbackSection({ data }: Props) {
  const { trades, calibration, logTrade, finishTrade } = useTrades();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <aside className="w-[20%] min-w-[190px] shrink-0 space-y-2">
      <PosturePanel posture={data.posture} mode={data.mode} />
      <CalibrationPanel calibration={calibration} />
      <TradesPanel
        trades={trades}
        onLogClick={() => setModalOpen(true)}
        onClose={(id, outcome) => finishTrade(id, outcome)}
      />

      {modalOpen && (
        <LogTradeModal data={data} onSubmit={logTrade} onClose={() => setModalOpen(false)} />
      )}
    </aside>
  );
}
