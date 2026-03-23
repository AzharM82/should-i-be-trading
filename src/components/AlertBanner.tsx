import type { MacroFomc } from "../types.js";

interface Props {
  fomc: MacroFomc;
}

export function AlertBanner({ fomc }: Props) {
  if (fomc.daysUntil > 3) return null;

  let message: string;
  let severity: string;

  if (fomc.isToday) {
    message = `FOMC MEETING CONCLUDES TODAY (${fomc.nextDate}) — EXPECT ELEVATED VOLATILITY`;
    severity = "bg-t-red/10 border-t-red text-t-red";
  } else if (fomc.daysUntil === 1) {
    message = `FOMC MEETING TOMORROW (${fomc.nextDate}) — POSITION ACCORDINGLY`;
    severity = "bg-t-amber/10 border-t-amber text-t-amber";
  } else {
    message = `FOMC MEETING IN ${fomc.daysUntil} DAYS (${fomc.nextDate})`;
    severity = "bg-t-amber/5 border-t-amber/50 text-t-amber";
  }

  return (
    <div className={`${severity} border rounded px-4 py-2 mx-3 mt-2 text-xs font-bold text-center tracking-wider`}>
      {message}
    </div>
  );
}
