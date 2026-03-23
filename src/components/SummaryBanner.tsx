interface Props {
  summary: string;
  decision: "YES" | "CAUTION" | "NO";
}

export function SummaryBanner({ summary, decision }: Props) {
  const borderColor =
    decision === "YES" ? "border-t-green/40" :
    decision === "CAUTION" ? "border-t-amber/40" :
    "border-t-red/40";

  return (
    <div className={`bg-t-card border ${borderColor} rounded p-5 flex flex-col justify-center`}>
      <div
        className="text-sm uppercase tracking-widest text-t-text mb-3 font-bold"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Market Analysis
      </div>
      <p
        className="text-sm text-t-text leading-relaxed"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
      >
        {summary}
      </p>
    </div>
  );
}
