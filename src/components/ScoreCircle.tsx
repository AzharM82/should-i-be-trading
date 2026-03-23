interface ScoreCircleProps {
  score: number;
  size?: number;
  label?: string;
}

export function ScoreCircle({ score, size = 180, label }: ScoreCircleProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  let color: string;
  if (score >= 65) color = "#1a6b3c";
  else if (score >= 40) color = "#8a6d1b";
  else color = "#a8221a";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#d4cfc6"
          strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-4xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-t-muted text-xs mt-1">/ 100</span>
      </div>
      {label && (
        <span className="text-t-muted text-xs mt-2 uppercase tracking-wider">{label}</span>
      )}
    </div>
  );
}
