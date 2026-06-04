// Ocean View — Ticker Bar Component
// Horizontal scrollable ticker selector with group labels

import type { AnalysisResult } from '../../lib/types';

interface TickerBarProps {
  tickers: { symbol: string; label: string; group?: string; analysis?: AnalysisResult }[];
  activeTicker: string;
  onSelect: (symbol: string) => void;
}

const GROUP_LABELS: Record<string, string> = {
  crypto: '🪙 Crypto',
  stocks: '📈 Stocks',
  etfs: '📊 ETFs',
};

export function TickerBar({ tickers, activeTicker, onSelect }: TickerBarProps) {
  const zoneColors: Record<string, string> = {
    green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    light_green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    strong_green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    yellow: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    red: 'border-red-500/50 bg-red-500/10 text-red-400',
    light_red: 'border-red-500/50 bg-red-500/10 text-red-400',
    strong_red: 'border-red-500/50 bg-red-500/10 text-red-400',
  };

  // Group tickers
  const groups: Record<string, typeof tickers> = {};
  for (const t of tickers) {
    const g = t.group || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(t);
  }

  const hasGroups = Object.keys(groups).length > 1;

  if (!hasGroups) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tickers.map(({ symbol, label, analysis }) => {
          const isActive = symbol === activeTicker;
          const zone = analysis?.zone_color || 'yellow';
          const colorClass = isActive ? (zoneColors[zone] || zoneColors.yellow) : 'border-gray-700 bg-gray-800/50 text-gray-400';

          return (
            <button
              key={symbol}
              onClick={() => onSelect(symbol)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all hover:scale-105 ${colorClass}`}
            >
              <span className="font-mono">{label}</span>
              {analysis && (
                <span className="text-xs opacity-70">{analysis.strength}%</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(groups).map(([groupKey, groupTickers]) => (
        <div key={groupKey}>
          <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
            {GROUP_LABELS[groupKey] || groupKey}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {groupTickers.map(({ symbol, label, analysis }) => {
              const isActive = symbol === activeTicker;
              const zone = analysis?.zone_color || 'yellow';
              const colorClass = isActive ? (zoneColors[zone] || zoneColors.yellow) : 'border-gray-700 bg-gray-800/50 text-gray-400';

              return (
                <button
                  key={symbol}
                  onClick={() => onSelect(symbol)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all hover:scale-105 ${colorClass}`}
                >
                  <span className="font-mono">{label}</span>
                  {analysis && (
                    <span className="text-[10px] opacity-70">{analysis.strength}%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}