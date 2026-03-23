import type { MarketScoreResponse } from "../types.js";

interface Props {
  data: MarketScoreResponse;
}

export function ScoringBreakdown({ data }: Props) {
  const categories = [
    { name: "Volatility", score: data.volatility.score, weight: data.volatility.weight },
    { name: "Momentum", score: data.momentum.score, weight: data.momentum.weight },
    { name: "Trend", score: data.trend.score, weight: data.trend.weight },
    { name: "Breadth", score: data.breadth.score, weight: data.breadth.weight },
    { name: "Macro", score: data.macro.score, weight: data.macro.weight },
  ];

  return (
    <div className="bg-t-card border border-t-border rounded overflow-hidden">
      <div className="px-4 py-2.5 border-b border-t-border">
        <span
          className="text-xs font-bold uppercase tracking-widest text-t-text"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Scoring Breakdown
        </span>
      </div>
      <div className="p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-t-muted border-b border-t-border">
              <th className="text-left py-1.5 font-semibold">Category</th>
              <th className="text-right py-1.5 font-semibold">Weight</th>
              <th className="text-right py-1.5 font-semibold">Score</th>
              <th className="text-right py-1.5 font-semibold">Contribution</th>
              <th className="text-left py-1.5 pl-3 font-semibold w-1/3">Bar</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const contribution = Math.round(cat.score * cat.weight);
              let barColor: string;
              if (cat.score >= 65) barColor = "bg-t-green/30";
              else if (cat.score >= 40) barColor = "bg-t-amber/30";
              else barColor = "bg-t-red/30";

              return (
                <tr key={cat.name} className="border-b border-t-border/50">
                  <td className="py-2 text-t-text font-semibold">{cat.name}</td>
                  <td className="py-2 text-right text-t-muted">{(cat.weight * 100).toFixed(0)}%</td>
                  <td className="py-2 text-right font-bold text-t-text">{cat.score}</td>
                  <td className="py-2 text-right text-t-muted">{contribution}</td>
                  <td className="py-2 pl-3">
                    <div className="h-3 bg-t-surface rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-500 ${barColor}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td className="py-2 text-t-text">TOTAL</td>
              <td className="py-2 text-right text-t-muted">100%</td>
              <td className="py-2 text-right text-t-text text-sm">{data.qualityScore}</td>
              <td className="py-2 text-right text-t-text">{data.qualityScore}</td>
              <td className="py-2 pl-3">
                <div className="h-3 bg-t-surface rounded overflow-hidden">
                  <div
                    className="h-full rounded bg-t-text/30 transition-all duration-500"
                    style={{ width: `${data.qualityScore}%` }}
                  />
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
