// Ocean View — useAnalysis Hook
// Fetches market analysis from the FastAPI backend using SWR
// Falls back to demo data when backend is unavailable

import useSWR from 'swr';
import type { AnalysisResult, BarAnalysis, SRResult, APIResponse } from '../lib/types';
import { getDemoScenarios } from '../lib/nonuple';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ocean-view-api.railway.app';
const CACHE_KEY = '/api/v1/analyze';

interface AnalysisData {
  analysis: AnalysisResult;
  bars: BarAnalysis[];
  sr: SRResult;
  isDemo: boolean;
  cached?: boolean;
  stale?: boolean;
  warning?: string;
}

// Fetcher for SWR
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Transform API response to our format
function transformAPIResponse(data: any): AnalysisData {
  return {
    analysis: {
      trend: data.trend || 'neutral',
      strength: data.strength || 0,
      zone_color: data.zone_color || 'yellow',
      signal: data.signal || 'Neutral →',
      confidence: data.confidence || 0,
      details: data.details || {},
    },
    bars: data.history || data.bars || [],
    sr: data.support_resistance || data.sr || {
      levels: [],
      nearest_support: null,
      nearest_resistance: null,
      support_zone: null,
      resistance_zone: null,
      current_position: 'between',
    },
    isDemo: data._synthetic || false,
    cached: data._cached || false,
    stale: data._stale || false,
    warning: data._warning,
  };
}

// Generate demo data with bars
function getDemoAnalysisData(ticker: string): AnalysisData {
  const scenarios = getDemoScenarios();
  // Pick scenario based on ticker name for variety
  const idx = ['BTC', 'ETH', 'AAPL', 'NVDA', 'TSLA', 'SPY'].indexOf(ticker.toUpperCase());
  const scenario = scenarios[idx >= 0 && idx < 3 ? idx : 0];
  
  return {
    analysis: scenario.analysis,
    bars: scenario.bars,
    sr: scenario.sr,
    isDemo: true,
  };
}

export function useAnalysis(ticker: string = 'BTC') {
  const url = `${API_BASE}${CACHE_KEY}/${ticker}`;
  
  const { data, error, isLoading, mutate } = useSWR<APIResponse<any>>(
    url,
    (url: string) => fetcher(url),
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // Refresh every 60s
      dedupingInterval: 30000, // Dedupe requests within 30s
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // If API fails or is loading, use demo data
  if (error || isLoading || !data) {
    const demoData = getDemoAnalysisData(ticker);
    
    return {
      analysis: demoData.analysis,
      bars: demoData.bars,
      sr: demoData.sr,
      isDemo: true,
      isLoading,
      error: error?.message || null,
      refetch: mutate,
      warning: error ? 'Using demo data — live API unavailable' : undefined,
    };
  }

  const transformed = transformAPIResponse(data.data || data);

  return {
    analysis: transformed.analysis,
    bars: transformed.bars,
    sr: transformed.sr,
    isDemo: transformed.isDemo || false,
    isLoading: false,
    error: null,
    refetch: mutate,
    warning: transformed.warning || (transformed.stale ? 'Using cached data' : undefined),
  };
}

// Fetch price history with per-bar analysis
export function useHistory(ticker: string = 'BTC', period: string = '3mo', interval: string = '1d') {
  const url = `${API_BASE}/api/v1/history/${ticker}?period=${period}&interval=${interval}`;
  
  const { data, error, isLoading, mutate } = useSWR<APIResponse<any>>(
    url,
    (url: string) => fetcher(url),
    {
      revalidateOnFocus: false,
      refreshInterval: 120000, // Refresh every 2 min
      dedupingInterval: 60000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
    }
  );

  if (error || isLoading || !data) {
    const demoData = getDemoAnalysisData(ticker);
    return {
      bars: demoData.bars,
      isDemo: true,
      isLoading,
      error: error?.message || null,
      refetch: mutate,
    };
  }

  return {
    bars: data.data?.bars || data.data?.history || [],
    isDemo: data.data?._synthetic || false,
    isLoading: false,
    error: null,
    refetch: mutate,
  };
}