// Ocean View — useMarketPulse Hook
// Fetches live analysis for top tickers for Market Pulse display

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ocean-view-api-production.up.railway.app';

interface PulseData {
  symbol: string;
  label: string;
  price: number | null;
  change: number | null;
  trend: string;
  strength: number;
  confidence: number;
  zone_color: string;
}

// Crypto removed — equity-only dashboard for reliability (Day 88 Sprint 2)
const PULSE_TICKERS = [
  { symbol: 'AAPL', label: 'AAPL' },
  { symbol: 'NVDA', label: 'NVDA' },
  { symbol: 'TSLA', label: 'TSLA' },
  { symbol: 'SPY', label: 'SPY' },
  { symbol: 'GOOGL', label: 'GOOGL' },
];

export function useMarketPulse() {
  const [data, setData] = useState<PulseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPulse() {
      // Fetch all tickers in parallel
      const promises = PULSE_TICKERS.map(async (t) => {
        try {
          const res = await fetch(`${API_BASE}/api/v1/analyze/${t.symbol}`);
          if (res.ok) {
            const d = await res.json();
            return {
              symbol: t.symbol,
              label: t.label,
              price: d.price ?? null,
              change: d.change_24h ?? null,
              trend: d.trend ?? 'neutral',
              strength: d.strength ?? 0,
              confidence: d.confidence ?? 0,
              zone_color: d.zone_color ?? 'yellow',
            };
          }
        } catch {
          // Silently fail for individual tickers
        }
        return {
          symbol: t.symbol,
          label: t.label,
          price: null,
          change: null,
          trend: 'neutral',
          strength: 0,
          confidence: 0,
          zone_color: 'yellow',
        };
      });

      const pulseResults = await Promise.all(promises);
      if (mounted) {
        setData(pulseResults);
        setLoading(false);
      }
    }

    fetchPulse();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPulse, 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading };
}