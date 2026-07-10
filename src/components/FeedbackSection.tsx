import { useState } from "react";
import type { MarketScoreResponse } from "../types.js";
import { useTrades } from "../hooks/useTrades.js";
import { CalibrationPanel } from "./CalibrationPanel.js";
import { TradesPanel } from "./TradesPanel.js";
import { LogTradeModal } from "./LogTradeModal.js";

interface Props {
  data: MarketScoreResponse;
}

export function FeedbackSection({ data }: Props) {
  const { trades, calibration, logTrade, finishTrade } = useTrades();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-7">
          <CalibrationPanel calibration={calibration} />
        </div>
        <div className="col-span-5">
          <TradesPanel
            trades={trades}
            onLogClick={() => setModalOpen(true)}
            onClose={(id, outcome) => finishTrade(id, outcome)}
          />
        </div>
      </div>

      {modalOpen && (
        <LogTradeModal
          data={data}
          onSubmit={logTrade}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
