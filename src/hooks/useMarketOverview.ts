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

export interface MarketOverviewData {
  tickers: TickerSnapshot[];
  sectors: SectorSummary[];
  marketMood: 'bullish' | 'bearish' | 'neutral';
  trendingTickers: TickerSnapshot[];  // highest confidence
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

export function useMarketOverview() {
  const [data, setData] = useState<MarketOverviewData>({
    tickers: [],
    sectors: [],
    marketMood: 'neutral',
    trendingTickers: [],
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
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
          }
        } catch {
          // Silently fail for individual tickers
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

      setData({
        tickers,
        sectors,
        marketMood,
        trendingTickers,
        lastUpdated: new Date(),
      });
      setError(null);
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

  return { ...data, loading, error, refetch: fetchOverview };
}