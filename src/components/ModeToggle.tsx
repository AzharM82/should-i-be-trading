import type { TradingMode } from "../types.js";

interface ModeToggleProps {
  mode: TradingMode;
  onChange: (mode: TradingMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex border border-t-border rounded overflow-hidden">
      <button
        className={`px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors ${
          mode === "swing"
            ? "bg-t-blue/20 text-t-blue border-r border-t-border"
            : "bg-t-surface text-t-muted border-r border-t-border hover:text-t-text"
        }`}
        onClick={() => onChange("swing")}
      >
        Swing
      </button>
      <button
        className={`px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors ${
          mode === "day"
            ? "bg-t-blue/20 text-t-blue"
            : "bg-t-surface text-t-muted hover:text-t-text"
        }`}
        onClick={() => onChange("day")}
      >
        Day
      </button>
    </div>
  );
}
