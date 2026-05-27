// Ocean View — Header Component

import { TickerBar } from './TickerBar';
import type { AnalysisResult } from '../../lib/types';

interface HeaderProps {
  tickers: { symbol: string; label: string; analysis?: AnalysisResult }[];
  activeTicker: string;
  onTickerSelect: (symbol: string) => void;
}

export function Header({ tickers, activeTicker, onTickerSelect }: HeaderProps) {
  return (
    <header className="border-b border-gray-800/50 bg-[#060b18]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Brand row */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Ocean View
              </span>
              <span className="text-xs text-gray-500 ml-2 hidden sm:inline">Beta</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">9 indicators. 1 wave. 0 candles.</div>
        </div>
        {/* Ticker bar */}
        <div className="pb-2">
          <TickerBar tickers={tickers} activeTicker={activeTicker} onSelect={onTickerSelect} />
        </div>
      </div>
    </header>
  );
}