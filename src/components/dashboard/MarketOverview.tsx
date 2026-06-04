// Ocean View — MarketOverview Component
// Cross-asset market overview showing sector health, trending tickers, and market mood

import type { SectorSummary, TickerSnapshot } from '../../hooks/useMarketOverview';

interface MarketOverviewProps {
  sectors: SectorSummary[];
  trendingTickers: TickerSnapshot[];
  marketMood: 'bullish' | 'bearish' | 'neutral';
  lastUpdated: Date | null;
  loading?: boolean;
  onTickerClick?: (symbol: string) => void;
}

const moodConfig = {
  bullish: { emoji: '🟢', label: 'Bullish', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  bearish: { emoji: '🔴', label: 'Bearish', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  neutral: { emoji: '🟡', label: 'Neutral', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

function SectorCard({ sector }: { sector: SectorSummary }) {
  const trendEmoji = sector.dominantTrend === 'uptrend' ? '🟢' : sector.dominantTrend === 'downtrend' ? '🔴' : '🟡';
  const trendColor = sector.dominantTrend === 'uptrend' ? 'text-emerald-400' : sector.dominantTrend === 'downtrend' ? 'text-red-400' : 'text-amber-400';
  const trendBg = sector.dominantTrend === 'uptrend' ? 'bg-emerald-500/5 border-emerald-500/20' : sector.dominantTrend === 'downtrend' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20';

  return (
    <div className={`rounded-xl border p-3 ${trendBg} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{sector.emoji}</span>
          <span className="text-xs font-semibold">{sector.label}</span>
        </div>
        <span className={`text-xs font-medium ${trendColor}`}>
          {trendEmoji} {sector.dominantTrend === 'uptrend' ? 'Up' : sector.dominantTrend === 'downtrend' ? 'Down' : 'Flat'}
        </span>
      </div>

      {/* Bullish/Bearish split */}
      <div className="flex items-center gap-1 mb-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden flex">
          {sector.count > 0 && (
            <>
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(sector.bullish / sector.count) * 100}%` }} />
              <div className="bg-amber-500 h-full transition-all" style={{ width: `${(sector.neutral / sector.count) * 100}%` }} />
              <div className="bg-red-500 h-full transition-all" style={{ width: `${(sector.bearish / sector.count) * 100}%` }} />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>🟢{sector.bullish} 🟡{sector.neutral} 🔴{sector.bearish}</span>
        <span>Conf: {sector.avgConfidence}%</span>
      </div>
    </div>
  );
}

function TrendingTicker({ ticker, onClick }: { ticker: TickerSnapshot; onClick?: () => void }) {
  const isUp = ticker.trend === 'uptrend';
  const isDown = ticker.trend === 'downtrend';
  const zoneBorder = isUp ? 'border-emerald-500/20' : isDown ? 'border-red-500/20' : 'border-amber-500/20';
  const priceStr = ticker.price !== null
    ? `$${ticker.price > 1000 ? ticker.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : ticker.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '—';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border ${zoneBorder} bg-[#0a0f1e] px-2.5 py-1.5 text-left hover:bg-gray-800/50 transition-all`}
    >
      <span className="text-[10px]">{isUp ? '🟢' : isDown ? '🔴' : '🟡'}</span>
      <span className="text-xs font-semibold min-w-[36px]">{ticker.label}</span>
      <span className="text-[11px] font-mono text-gray-400">{priceStr}</span>
      {ticker.confidence > 0 && (
        <span className={`text-[9px] px-1 py-0.5 rounded ${ticker.confidence >= 80 ? 'bg-emerald-500/20 text-emerald-400' : ticker.confidence >= 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700/50 text-gray-400'}`}>
          {ticker.confidence}%
        </span>
      )}
    </button>
  );
}

export function MarketOverview({ sectors, trendingTickers, marketMood, lastUpdated, loading, onTickerClick }: MarketOverviewProps) {
  const mood = moodConfig[marketMood];

  if (loading) {
    return (
      <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-800 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-800 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider">Market Overview</h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${mood.bg} ${mood.color} border ${mood.border} font-medium`}>
            {mood.emoji} {mood.label}
          </span>
        </div>
        {lastUpdated && (
          <span className="text-[9px] text-gray-600">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Sector Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {sectors.map(sector => (
          <SectorCard key={sector.group} sector={sector} />
        ))}
      </div>

      {/* Trending Tickers */}
      {trendingTickers.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">🔥 Top Signals</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingTickers.map(ticker => (
              <TrendingTicker
                key={ticker.symbol}
                ticker={ticker}
                onClick={() => onTickerClick?.(ticker.symbol)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}