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
    <div className={`${style.bg} border-2 ${style.border} rounded p-4 flex flex-col items-center gap-3 h-full justify-center`}>
      {/* Decision Badge */}
      <div
        className={`${style.text} text-2xl font-black tracking-wider`}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {style.label}
      </div>

      {/* Score Circles */}
      <div className="flex gap-4 items-center">
        <ScoreCircle score={qualityScore} size={120} label="Quality" />
        <ScoreCircle score={executionScore} size={80} label="Execution" />
      </div>

      {/* Decision guidance */}
      <div className="text-t-muted text-[10px] text-center italic" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
        {decision === "YES" && "Full size. Press A+ setups."}
        {decision === "CAUTION" && "Half size. A+ setups, tight stops."}
        {decision === "NO" && "Preserve capital. Wait."}
      </div>
    </div>
  );
}
