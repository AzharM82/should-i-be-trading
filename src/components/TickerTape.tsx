interface TickerItem {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
}

interface TickerTapeProps {
  tickers: TickerItem[];
}

export function TickerTape({ tickers }: TickerTapeProps) {
  // Duplicate for seamless scrolling
  const items = [...tickers, ...tickers];

  return (
    <div className="bg-t-bg/50 border-b border-t-border overflow-hidden h-7 flex items-center">
      <div className="ticker-tape flex gap-6 whitespace-nowrap">
        {items.map((t, i) => (
          <span key={`${t.ticker}-${i}`} className="flex items-center gap-1.5 text-xs">
            <span className="text-t-muted font-medium">{t.ticker}</span>
            <span className="text-t-text">{t.price.toFixed(2)}</span>
            <span className={t.changePercent >= 0 ? "text-t-green" : "text-t-red"}>
              {t.changePercent >= 0 ? "+" : ""}{t.changePercent.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
