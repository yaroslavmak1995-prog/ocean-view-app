// Ocean View — useTicker Hook
// Manages ticker selection and recently viewed tickers

import { useState, useCallback } from 'react';

const DEFAULT_TICKERS = ['BTC-USD', 'ETH-USD', 'AAPL', 'NVDA', 'TSLA', 'SPY'];

const STORAGE_KEY = 'ov_recent_tickers';

function loadRecentTickers(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_TICKERS;
  } catch {
    return DEFAULT_TICKERS;
  }
}

function saveRecentTickers(tickers: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  } catch {
    // localStorage unavailable, ignore
  }
}

export function useTicker(initialTicker: string = 'BTC-USD') {
  const [activeTicker, setActiveTicker] = useState(initialTicker);
  const [recentTickers, setRecentTickers] = useState<string[]>(loadRecentTickers);

  const selectTicker = useCallback((ticker: string) => {
    setActiveTicker(ticker);
    
    // Add to recent, move to front, dedupe
    setRecentTickers(prev => {
      const updated = [ticker, ...prev.filter(t => t !== ticker)].slice(0, 10);
      saveRecentTickers(updated);
      return updated;
    });
  }, []);

  // Strip -USD suffix for display
  const displayTicker = activeTicker.replace('-USD', '').replace('-EUR', '');

  return {
    activeTicker,
    displayTicker,
    recentTickers,
    selectTicker,
    defaultTickers: DEFAULT_TICKERS,
  };
}