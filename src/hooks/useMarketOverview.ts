// Ocean View — useMarketOverview Hook
// Fetches live analysis for all tracked tickers to build a cross-asset market overview

import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ocean-view-api-production.up.railway.app';

export interface TickerSnapshot {
  symbol: string;
  label: string;
  group: 'crypto' | 'stocks' | 'etfs';
  price: number | null;
  change_24h: number | null;
  trend: string;
  strength: number;
  confidence: number;
  zone_color: string;
  signal: string;
}

export interface SectorSummary {
  group: string;
  label: string;
  emoji: string;
  count: number;
  bullish: number;
  bearish: number;
  neutral: number;
  avgStrength: number;
  avgConfidence: number;
  dominantTrend: 'uptrend' | 'downtrend' | 'neutral';
}

export interface RiskRadar {
  score: number;            // 0-100, where 0=risk-off, 50=neutral, 100=risk-on
  label: 'Risk-On' | 'Risk-Off' | 'Neutral';
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  crossAssetDivergence: boolean;  // true when crypto & stocks diver
  cryptoTrend: 'uptrend' | 'downtrend' | 'neutral';
  stocksTrend: 'uptrend' | 'downtrend' | 'neutral';
  etfsTrend: 'uptrend' | 'downtrend' | 'neutral';
}

export interface MarketOverviewData {
  tickers: TickerSnapshot[];
  sectors: SectorSummary[];
  marketMood: 'bullish' | 'bearish' | 'neutral';
  trendingTickers: TickerSnapshot[];  // highest confidence
  riskRadar: RiskRadar;
  lastUpdated: Date | null;
}

const TICKER_CONFIG = [
  // Crypto
  { symbol: 'BTC-USD', label: 'BTC', group: 'crypto' as const },
  { symbol: 'ETH-USD', label: 'ETH', group: 'crypto' as const },
  { symbol: 'SOL-USD', label: 'SOL', group: 'crypto' as const },
  { symbol: 'DOGE-USD', label: 'DOGE', group: 'crypto' as const },
  { symbol: 'ADA-USD', label: 'ADA', group: 'crypto' as const },
  // Stocks
  { symbol: 'AAPL', label: 'AAPL', group: 'stocks' as const },
  { symbol: 'MSFT', label: 'MSFT', group: 'stocks' as const },
  { symbol: 'NVDA', label: 'NVDA', group: 'stocks' as const },
  { symbol: 'TSLA', label: 'TSLA', group: 'stocks' as const },
  { symbol: 'GOOGL', label: 'GOOGL', group: 'stocks' as const },
  { symbol: 'AMZN', label: 'AMZN', group: 'stocks' as const },
  { symbol: 'META', label: 'META', group: 'stocks' as const },
  // ETFs
  { symbol: 'SPY', label: 'SPY', group: 'etfs' as const },
  { symbol: 'QQQ', label: 'QQQ', group: 'etfs' as const },
  { symbol: 'IWM', label: 'IWM', group: 'etfs' as const },
];

function computeSectors(tickers: TickerSnapshot[]): SectorSummary[] {
  const groups: Record<string, { label: string; emoji: string }> = {
    crypto: { label: 'Crypto', emoji: '🪙' },
    stocks: { label: 'Stocks', emoji: '📈' },
    etfs: { label: 'ETFs', emoji: '📊' },
  };

  return Object.entries(groups).map(([group, meta]) => {
    const groupTickers = tickers.filter(t => t.group === group);
    const bullish = groupTickers.filter(t => t.trend === 'uptrend').length;
    const bearish = groupTickers.filter(t => t.trend === 'downtrend').length;
    const neutral = groupTickers.length - bullish - bearish;
    const strengths = groupTickers.map(t => t.strength).filter(s => s > 0);
    const confidences = groupTickers.map(t => t.confidence).filter(c => c > 0);

    let dominantTrend: 'uptrend' | 'downtrend' | 'neutral' = 'neutral';
    if (bullish > bearish) dominantTrend = 'uptrend';
    else if (bearish > bullish) dominantTrend = 'downtrend';

    return {
      group,
      label: meta.label,
      emoji: meta.emoji,
      count: groupTickers.length,
      bullish,
      bearish,
      neutral,
      avgStrength: strengths.length ? Math.round(strengths.reduce((a, b) => a + b, 0) / strengths.length) : 0,
      avgConfidence: confidences.length ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length) : 0,
      dominantTrend,
    };
  });
}

function computeMarketMood(sectors: SectorSummary[]): 'bullish' | 'bearish' | 'neutral' {
  const bullish = sectors.filter(s => s.dominantTrend === 'uptrend').length;
  const bearish = sectors.filter(s => s.dominantTrend === 'downtrend').length;
  if (bullish > bearish) return 'bullish';
  if (bearish > bullish) return 'bearish';
  return 'neutral';
}

function computeRiskRadar(sectors: SectorSummary[]): RiskRadar {
  // Risk Radar: cross-asset risk score
  // High risk-on = all sectors bullish (investors seeking risk)
  // High risk-off = crypto bearish + stocks/ETFs mixed or bullish (money fleeing risky assets)
  // Neutral = mixed signals

  const crypto = sectors.find(s => s.group === 'crypto');
  const stocks = sectors.find(s => s.group === 'stocks');
  const etfs = sectors.find(s => s.group === 'etfs');

  if (!crypto || !stocks || !etfs) {
    return {
      score: 50, label: 'Neutral', emoji: '🟡',
      color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30',
      description: 'Insufficient data for risk assessment.',
      crossAssetDivergence: false,
      cryptoTrend: 'neutral', stocksTrend: 'neutral', etfsTrend: 'neutral',
    };
  }

  // Calculate risk score (0-100)
  // Each sector contributes to the score based on its bullish/bearish ratio
  const cryptoScore = crypto.bullish > crypto.bearish ? 70 + (crypto.avgConfidence * 0.3) : 30 - (crypto.avgConfidence * 0.2);
  const stocksScore = stocks.bullish > stocks.bearish ? 65 + (stocks.avgConfidence * 0.3) : 35 - (stocks.avgConfidence * 0.2);
  const etfsScore = etfs.bullish > etfs.bearish ? 60 + (etfs.avgConfidence * 0.3) : 40 - (etfs.avgConfidence * 0.2);

  // Crypto divergence: when crypto is bearish but stocks/ETFs are bullish = risk-off
  const crossAssetDivergence =
    (crypto.dominantTrend === 'downtrend' && (stocks.dominantTrend === 'uptrend' || etfs.dominantTrend === 'uptrend')) ||
    (crypto.dominantTrend === 'uptrend' && (stocks.dominantTrend === 'downtrend' || etfs.dominantTrend === 'downtrend'));

  // Weighted average: crypto matters most for risk appetite
  const rawScore = (cryptoScore * 0.4) + (stocksScore * 0.35) + (etfsScore * 0.25);
  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  // Divergence penalty: if crypto & stocks diverge, push toward risk-off
  const divergencePenalty = crossAssetDivergence ? -15 : 0;
  const finalScore = Math.round(Math.max(0, Math.min(100, score + divergencePenalty)));

  let label: 'Risk-On' | 'Risk-Off' | 'Neutral';
  let emoji: string;
  let color: string;
  let bgColor: string;
  let borderColor: string;
  let description: string;

  if (finalScore >= 65) {
    label = 'Risk-On';
    emoji = '🟢';
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/10';
    borderColor = 'border-emerald-500/30';
    description = 'Investors are seeking risk. Crypto & equities aligned in uptrend. Favorable for long positions.';
  } else if (finalScore <= 35) {
    label = 'Risk-Off';
    emoji = '🔴';
    color = 'text-red-400';
    bgColor = 'bg-red-500/10';
    borderColor = 'border-red-500/30';
    if (crossAssetDivergence && crypto.dominantTrend === 'downtrend') {
      description = 'Capital flowing from crypto to traditional markets. Risk-off divergence detected. Exercise caution with risk assets.';
    } else {
      description = 'Markets are risk-averse. Consider defensive positions and reduced exposure.';
    }
  } else {
    label = 'Neutral';
    emoji = '🟡';
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
    borderColor = 'border-amber-500/30';
    description = 'Mixed signals across asset classes. No strong risk appetite or aversion. Wait for clearer direction.';
  }

  return {
    score: finalScore, label, emoji, color, bgColor, borderColor, description, crossAssetDivergence,
    cryptoTrend: crypto.dominantTrend,
    stocksTrend: stocks.dominantTrend,
    etfsTrend: etfs.dominantTrend,
  };
}

export function useMarketOverview() {
  const [data, setData] = useState<MarketOverviewData>({
    tickers: [],
    sectors: [],
    marketMood: 'neutral',
    trendingTickers: [],
    riskRadar: {
      score: 50,
      label: 'Neutral',
      emoji: '\u{1f7e1}',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      description: 'Loading risk assessment...',
      crossAssetDivergence: false,
      cryptoTrend: 'neutral',
      stocksTrend: 'neutral',
      etfsTrend: 'neutral',
    },
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedTickers, setFailedTickers] = useState<string[]>([]);

  const fetchOverview = useCallback(async () => {
    try {
      const failed: string[] = [];
      const promises = TICKER_CONFIG.map(async (t) => {
        try {
          const res = await fetch(`${API_BASE}/api/v1/analyze/${t.symbol}`);
          if (res.ok) {
            const d = await res.json();
            return {
              symbol: t.symbol,
              label: t.label,
              group: t.group,
              price: d.price ?? null,
              change_24h: d.change_24h ?? null,
              trend: d.trend ?? 'neutral',
              strength: d.strength ?? 0,
              confidence: d.confidence ?? 0,
              zone_color: d.zone_color ?? 'yellow',
              signal: d.signal ?? '',
            } as TickerSnapshot;
          } else {
            failed.push(t.symbol);
          }
        } catch {
          failed.push(t.symbol);
        }
        return {
          symbol: t.symbol,
          label: t.label,
          group: t.group,
          price: null,
          change_24h: null,
          trend: 'neutral',
          strength: 0,
          confidence: 0,
          zone_color: 'yellow',
          signal: '',
        } as TickerSnapshot;
      });

      const tickers = await Promise.all(promises);
      const sectors = computeSectors(tickers);
      const marketMood = computeMarketMood(sectors);

      // Trending = highest confidence tickers with strong signals
      const trendingTickers = [...tickers]
        .filter(t => t.confidence > 0 && t.strength > 0)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      const riskRadar = computeRiskRadar(sectors);

      setData({
        tickers,
        sectors,
        marketMood,
        trendingTickers,
        riskRadar,
        lastUpdated: new Date(),
      });
      setFailedTickers(failed);
      if (failed.length > 0) {
        setError(`${failed.length} ticker(s) unavailable: ${failed.join(', ')}. Crypto data is live. Stocks/ETFs temporarily unavailable.`);
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    // Refresh every 60 seconds
    const interval = setInterval(fetchOverview, 60000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  return { ...data, loading, error, failedTickers, refetch: fetchOverview };
}