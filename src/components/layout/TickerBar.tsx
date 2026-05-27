// Ocean View — Ticker Bar Component
// Horizontal scrollable ticker selector

import type { AnalysisResult } from '../../lib/types';

interface TickerBarProps {
  tickers: { symbol: string; label: string; analysis?: AnalysisResult }[];
  activeTicker: string;
  onSelect: (symbol: string) => void;
}

export function TickerBar({ tickers, activeTicker, onSelect }: TickerBarProps) {
  const zoneColors: Record<string, string> = {
    green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    yellow: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    red: 'border-red-500/50 bg-red-500/10 text-red-400',
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tickers.map(({ symbol, label, analysis }) => {
        const isActive = symbol === activeTicker;
        const zone = analysis?.zone_color || 'yellow';
        const colorClass = isActive ? zoneColors[zone] : 'border-gray-700 bg-gray-800/50 text-gray-400';

        return (
          <button
            key={symbol}
            onClick={() => onSelect(symbol)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all hover:scale-105 ${
              isActive ? colorClass : colorClass
            }`}
          >
            <span className="font-mono">{label}</span>
            {analysis && (
              <span className="text-xs opacity-70">
                {analysis.strength}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}