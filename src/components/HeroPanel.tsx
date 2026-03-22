import { ScoreCircle } from "./ScoreCircle.js";

interface HeroPanelProps {
  decision: "YES" | "CAUTION" | "NO";
  qualityScore: number;
  executionScore: number;
}

const DECISION_STYLES = {
  YES: { bg: "bg-t-green/15", border: "border-t-green/40", text: "text-t-green", label: "YES — TRADE" },
  CAUTION: { bg: "bg-t-amber/15", border: "border-t-amber/40", text: "text-t-amber", label: "CAUTION" },
  NO: { bg: "bg-t-red/15", border: "border-t-red/40", text: "text-t-red", label: "NO — SIT OUT" },
};

export function HeroPanel({ decision, qualityScore, executionScore }: HeroPanelProps) {
  const style = DECISION_STYLES[decision];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-6 flex flex-col items-center gap-4`}>
      {/* Decision Badge */}
      <div className={`${style.text} text-3xl font-bold tracking-wider`}>
        {style.label}
      </div>

      {/* Score Circles */}
      <div className="flex gap-8 items-center">
        <div className="relative">
          <ScoreCircle score={qualityScore} size={160} label="Market Quality" />
        </div>
        <div className="relative">
          <ScoreCircle score={executionScore} size={100} label="Execution" />
        </div>
      </div>

      {/* Decision guidance */}
      <div className="text-t-muted text-xs text-center">
        {decision === "YES" && "Full position sizing. Press risk on A+ setups."}
        {decision === "CAUTION" && "Half size only. A+ setups with tight stops."}
        {decision === "NO" && "Preserve capital. Wait for better conditions."}
      </div>
    </div>
  );
}
