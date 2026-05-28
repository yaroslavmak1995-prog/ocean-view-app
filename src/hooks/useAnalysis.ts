// Ocean View — useAnalysis Hook
// Fetches market analysis from the FastAPI backend using SWR
// Falls back to demo data when backend is unavailable

import useSWR from 'swr';
import type { AnalysisResult, BarAnalysis, SRResult, APIResponse } from '../lib/types';
import { getDemoScenarios } from '../lib/nonuple';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ocean-view-api-production.up.railway.app';
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
  // Normalize zone_color: API may return light_green, strong_green, etc.
  const normalizeZoneColor = (zc: string): string => {
    if (!zc) return 'yellow';
    if (zc.includes('green')) return 'green';
    if (zc.includes('red')) return 'red';
    return zc; // yellow stays yellow
  };

  // Normalize trend: API may return UPTREND, DOWNTREND
  const normalizeTrend = (t: string): string => {
    if (!t) return 'neutral';
    return t.toLowerCase();
  };

  // Map API ocean_metaphor (kept for future use)
  const oceanMetaphor = data.ocean_metaphor || {};
  void oceanMetaphor;

  // Map API sr_levels to component format
  const srLevels = data.sr_levels || {};
  const mappedSR = {
    levels: srLevels.levels || [],
    nearest_support: srLevels.nearest_support || null,
    nearest_resistance: srLevels.nearest_resistance || null,
    support_zone: srLevels.support_zone || null,
    resistance_zone: srLevels.resistance_zone || null,
    current_position: (srLevels.position || 'between').replace('_', ' ') as any,
  };

  // Map factors to details
  const factors = data.factors || [];
  const factorMap: Record<string, any> = {};
  for (const f of factors) {
    factorMap[f.name] = f;
  }

  // Extract MACD details
  const macdFactor = factorMap['MACD'] || {};
  const bbFactor = factorMap['Bollinger Bands'] || {};
  const stochFactor = factorMap['Stochastic'] || {};
  const atrFactor = factorMap['ATR'] || {};
  const rsiFactor = factorMap['RSI'] || {};
  const adxFactor = factorMap['ADX'] || {};
  const momFactor = factorMap['Momentum'] || {};
  const volFactor = factorMap['Volume'] || {};
  const maFactor = factorMap['MA Crossover'] || {};

  // Parse MACD description
  const macdMatch = (macdFactor.description || '').match(/MACD=([\-\d.]+),\s*Signal=([\-\d.]+),\s*Crossover=(\w+)/);
  const bbMatch = (bbFactor.description || '').match(/%B=([\d.]+)%?,\s*Squeeze=(\w+),\s*Width=([\d.]+)/);
  const stochMatch = (stochFactor.description || '').match(/%K=([\d.]+),\s*%D=([\d.]+),\s*Crossover=(\w+)/);
  const rsiMatch = (rsiFactor.description || '').match(/RSI=([\d.]+)/);
  const adxMatch = (adxFactor.description || '').match(/ADX=([\d.]+)\s*\((\w+)\),\s*(\w+)/);
  const atrMatch = (atrFactor.description || '').match(/ATR=([\d.]+)\s*\((\w+)\),\s*Trend=(\w+)/);
  const maMatch = (maFactor.description || '').match(/MA20=([\d.]+)\s*vs\s*MA50=([\d.]+)/);
  const volMatch = (volFactor.description || '').match(/Volume ratio:\s*([\d.]+)x/);
  // momMatch reserved for future momentum percentage parsing

  // Build details from API factors
  const details = {
    ma_fast: maMatch ? parseFloat(maMatch[1]) : data.details?.ma_fast || 0,
    ma_slow: maMatch ? parseFloat(maMatch[2]) : data.details?.ma_slow || 0,
    rsi: rsiMatch ? parseFloat(rsiMatch[1]) : (data.details?.rsi || 50),
    rsi_signal: rsiFactor.signal || 'neutral',
    adx: adxMatch ? parseFloat(adxMatch[1]) : (data.details?.adx || 25),
    adx_direction: adxMatch ? adxMatch[3] : (data.details?.adx_direction || 'neutral'),
    macd_line: macdMatch ? parseFloat(macdMatch[1]) : (data.details?.macd_line || 0),
    macd_signal: macdMatch ? parseFloat(macdMatch[2]) : (data.details?.macd_signal || 0),
    macd_crossover: macdMatch ? macdMatch[3] : (data.details?.macd_crossover || 'none'),
    atr: atrMatch ? parseFloat(atrMatch[1]) : (data.details?.atr || 0),
    atr_volatility: atrMatch ? atrMatch[2].toLowerCase() : (data.details?.atr_volatility || 'normal'),
    atr_trend: atrMatch ? atrMatch[3].toLowerCase() : (data.details?.atr_trend || 'stable'),
    atr_bonus: atrFactor.bonus || 0,
    atr_stop_suggestions: data.atr_stop_suggestions || data.details?.atr_stop_suggestions || {},
    bb_upper: data.details?.bb_upper || 0,
    bb_lower: data.details?.bb_lower || 0,
    bb_percent_b: bbMatch ? parseFloat(bbMatch[1]) / 100 : (data.details?.bb_percent_b || 0.5),
    bb_squeeze: bbMatch ? bbMatch[2].toLowerCase() : (data.details?.bb_squeeze || 'normal'),
    bb_position: bbFactor.signal || 'normal',
    bb_bonus: bbFactor.bonus || 0,
    bb_bandwidth: bbMatch ? parseFloat(bbMatch[3]) : (data.details?.bb_bandwidth || 0),
    volume_ratio: volMatch ? parseFloat(volMatch[1]) : (data.details?.volume_ratio || 1),
    momentum_pct: data.details?.momentum_pct || (momFactor.value as number) || 0,
    stoch_k: stochMatch ? parseFloat(stochMatch[1]) : (data.details?.stoch_k || 50),
    stoch_d: stochMatch ? parseFloat(stochMatch[2]) : (data.details?.stoch_d || 50),
    stoch_signal: stochFactor.signal || 'neutral',
    stoch_crossover: stochMatch ? stochMatch[3] : (data.details?.stoch_crossover || 'none'),
    stoch_bonus: stochFactor.bonus || 0,
    synergy_bonus: data.synergy_bonus || data.details?.synergy_bonus || 0,
  };

  return {
    analysis: {
      trend: normalizeTrend(data.trend) as any,
      strength: data.strength || 0,
      zone_color: normalizeZoneColor(data.zone_color) as any,
      signal: (data.signal || 'Neutral →') as any,
      confidence: data.confidence || 0,
      details,
    },
    bars: data.history || data.bars || [],
    sr: mappedSR as any,
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