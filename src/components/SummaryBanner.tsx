interface Props {
  summary: string;
  decision: "YES" | "CAUTION" | "NO";
}

export function SummaryBanner({ summary, decision }: Props) {
  const borderColor =
    decision === "YES" ? "border-t-green/30" :
    decision === "CAUTION" ? "border-t-amber/30" :
    "border-t-red/30";

  return (
    <div className={`bg-t-card border ${borderColor} rounded-lg p-5 flex flex-col justify-center`}>
      <div className="text-xs uppercase tracking-wider text-t-muted mb-3">Terminal Analysis</div>
      <p className="text-sm text-t-text leading-relaxed">{summary}</p>
    </div>
  );
}
