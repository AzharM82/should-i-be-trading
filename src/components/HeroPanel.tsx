import { ScoreCircle } from "./ScoreCircle.js";

interface HeroPanelProps {
  decision: "YES" | "CAUTION" | "NO";
  qualityScore: number;
  executionScore: number;
}

const DECISION_STYLES = {
  YES: { bg: "bg-t-green/10", border: "border-t-green", text: "text-t-green", label: "YES — TRADE" },
  CAUTION: { bg: "bg-t-amber/10", border: "border-t-amber", text: "text-t-amber", label: "CAUTION" },
  NO: { bg: "bg-t-red/10", border: "border-t-red", text: "text-t-red", label: "NO — SIT OUT" },
};

export function HeroPanel({ decision, qualityScore, executionScore }: HeroPanelProps) {
  const style = DECISION_STYLES[decision];

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded p-6 flex flex-col items-center gap-4`}>
      {/* Decision Badge */}
      <div
        className={`${style.text} text-3xl font-black tracking-wider`}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
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
      <div className="text-t-muted text-xs text-center italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {decision === "YES" && "Full position sizing. Press risk on A+ setups."}
        {decision === "CAUTION" && "Half size only. A+ setups with tight stops."}
        {decision === "NO" && "Preserve capital. Wait for better conditions."}
      </div>
    </div>
  );
}
