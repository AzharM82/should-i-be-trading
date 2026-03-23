import type { TradingMode } from "../types.js";

interface ModeToggleProps {
  mode: TradingMode;
  onChange: (mode: TradingMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex border border-t-border rounded overflow-hidden">
      <button
        className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
          mode === "swing"
            ? "bg-t-text text-t-bg border-r border-t-border"
            : "bg-t-card text-t-muted border-r border-t-border hover:text-t-text"
        }`}
        onClick={() => onChange("swing")}
      >
        Swing
      </button>
      <button
        className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
          mode === "day"
            ? "bg-t-text text-t-bg"
            : "bg-t-card text-t-muted hover:text-t-text"
        }`}
        onClick={() => onChange("day")}
      >
        Day
      </button>
    </div>
  );
}
