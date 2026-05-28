// Ocean View — Dashboard Page
// Full analysis dashboard with real API data (falls back to demo)

import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { WaveChart } from '../components/wave/WaveChart';
import { SignalBadge } from '../components/signal/SignalBadge';
import { ConfidenceMeter } from '../components/signal/ConfidenceMeter';
import { FactorGrid } from '../components/factors/FactorGrid';
import { OceanMetaphor } from '../components/ocean/OceanMetaphor';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { WaveChartSkeleton, SidebarSkeleton, FactorGridSkeleton } from '../components/ui/LoadingSkeleton';
import { ShareAnalysis } from '../components/ui/ShareAnalysis';
import { useAnalysis } from '../hooks/useAnalysis';
import { useTicker } from '../hooks/useTicker';
import { getFactorBreakdown, getOceanMetaphor } from '../lib/nonuple';

const TICKER_LIST = [
  { symbol: 'BTC-USD', label: 'BTC' },
  { symbol: 'ETH-USD', label: 'ETH' },
  { symbol: 'AAPL', label: 'AAPL' },
  { symbol: 'NVDA', label: 'NVDA' },
  { symbol: 'TSLA', label: 'TSLA' },
  { symbol: 'SPY', label: 'SPY' },
];

export function DashboardPage() {
  const { activeTicker, displayTicker, selectTicker } = useTicker('BTC-USD');
  const { analysis, bars, sr, isDemo, isLoading, error: analysisError, warning, refetch } = useAnalysis(activeTicker);

  const factors = getFactorBreakdown(analysis);
  const metaphor = getOceanMetaphor(analysis);

  // Build tickers with analysis data
  const tickersWithAnalysis = TICKER_LIST.map(t => ({
    ...t,
    analysis: t.symbol === activeTicker ? analysis : undefined,
  }));

  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      refetch();
    }, 60000);
    return () => clearInterval(timer);
  }, [autoRefresh, refetch]);

  return (
    <div className="min-h-screen bg-[#060b18] text-white flex flex-col">
      <Header
        tickers={tickersWithAnalysis}
        activeTicker={activeTicker}
        onTickerSelect={selectTicker}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">← Home</a>
            <h1 className="text-lg font-semibold">{displayTicker}</h1>
            {analysisError && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                API Error
              </span>
            )}
            {isDemo && !analysisError && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                Demo Mode
              </span>
            )}
            {warning && (
              <span className="text-xs text-gray-500">{warning}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3 h-3 accent-emerald-500"
              />
              Auto-refresh
            </label>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Wave Chart — 2 columns wide */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              {isLoading ? (
                <WaveChartSkeleton />
              ) : (
                <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-medium text-gray-300">Ocean Wave</h2>
                    <span className="text-xs text-gray-500">{bars.length} bars</span>
                  </div>
                  <WaveChart
                    bars={bars}
                    supportLevel={sr?.nearest_support}
                    resistanceLevel={sr?.nearest_resistance}
                  />
                </div>
              )}
            </ErrorBoundary>
          </div>

          {/* Sidebar — Signal + Confidence + Ocean */}
          <div className="space-y-4">
            {isLoading ? (
              <SidebarSkeleton />
            ) : (
              <>
                <SignalBadge analysis={analysis} />
                <ConfidenceMeter analysis={analysis} />
                <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Ocean Conditions</h3>
                  <OceanMetaphor metaphor={metaphor} analysis={analysis} />
                </div>

                {/* S/R Levels */}
                {sr && (sr.nearest_support || sr.nearest_resistance) && (
                  <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
                    <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Key Levels</h3>
                    <div className="space-y-2">
                      {sr.nearest_resistance && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-red-400">Resistance</span>
                          <span className="text-xs font-mono text-red-400">{sr.nearest_resistance.toLocaleString()}</span>
                        </div>
                      )}
                      {sr.nearest_support && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-400">Support</span>
                          <span className="text-xs font-mono text-emerald-400">{sr.nearest_support.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Position</span>
                        <span className="capitalize">{sr.current_position?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Analysis */}
                <ShareAnalysis analysis={analysis} ticker={displayTicker} />
              </>
            )}
          </div>
        </div>

        {/* Factor Grid */}
        <div className="mt-4 bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
          {isLoading ? (
            <FactorGridSkeleton />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider">9 Factor Breakdown</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-emerald-400">✓ Aligned</span>
                  <span className="text-xs text-gray-600">|</span>
                  <span className="text-xs text-red-400">✗ Divergent</span>
                </div>
              </div>
              <FactorGrid factors={factors} />
            </>
          )}
        </div>

        {/* Details Table */}
        <div className="mt-4 bg-[#0a0f1e] rounded-xl p-3 sm:p-4 border border-gray-800/50">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Indicator Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <DetailItem label="MA Fast" value={analysis.details.ma_fast?.toLocaleString()} />
            <DetailItem label="MA Slow" value={analysis.details.ma_slow?.toLocaleString()} />
            <DetailItem label="RSI" value={analysis.details.rsi?.toFixed(1)} highlight={analysis.details.rsi > 70 || analysis.details.rsi < 30} />
            <DetailItem label="ADX" value={analysis.details.adx?.toFixed(1)} />
            <DetailItem label="MACD" value={analysis.details.macd_crossover} />
            <DetailItem label="ATR" value={analysis.details.atr?.toFixed(1)} />
            <DetailItem label="BB %B" value={`${((analysis.details.bb_percent_b || 0) * 100).toFixed(1)}%`} />
            <DetailItem label="Stoch K/D" value={`${analysis.details.stoch_k?.toFixed(1)} / ${analysis.details.stoch_d?.toFixed(1)}`} />
            <DetailItem label="Volatility" value={analysis.details.atr_volatility} />
            <DetailItem label="BB Squeeze" value={analysis.details.bb_squeeze} />
            <DetailItem label="Synergy" value={`${analysis.details.synergy_bonus > 0 ? '+' : ''}${analysis.details.synergy_bonus}`} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-xs text-gray-600">
          Ocean View is for informational purposes only. Not financial advice. Past performance does not guarantee future results.
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DetailItem({ label, value, highlight }: { label: string; value?: string | number | null; highlight?: boolean }) {
  return (
    <div className="bg-gray-800/30 rounded-lg px-3 py-2">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-mono ${highlight ? 'text-amber-400' : 'text-gray-300'}`}>
        {value ?? '—'}
      </div>
    </div>
  );
}