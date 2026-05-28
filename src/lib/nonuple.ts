// Ocean View — Nonuple Confirmation Algorithm (TypeScript Port)
// Ported from Python v6.1 — 9 indicators fused into 1 signal

import type {
  TrendDirection,
  ZoneColor,
  SignalType,
  AnalysisResult,
  FactorResult,
  PriceBar,
  BarAnalysis,
  OceanMetaphor,
  DemoScenario,
} from './types';

// ─── Constants ─────────────────────────────────────────────────

const MA_FAST_PERIOD = 20;
const MA_SLOW_PERIOD = 50;
const RSI_PERIOD = 14;
const ADX_PERIOD = 14;
const MACD_FAST = 12;
const MACD_SLOW = 26;
const MACD_SIGNAL = 9;
const BB_PERIOD = 20;
const BB_STD_DEV = 2;
const STOCH_K_PERIOD = 14;
// Stochastic %D smoothing is handled inline in calculateStochastic
const ATR_PERIOD = 14;

// ─── Helper Functions ─────────────────────────────────────────

// SMA helper reserved for future enhancements (e.g., smoothed Stochastic %D)

function ema(data: number[], period: number): number[] {
  const result: number[] = [data[0]];
  const k = 2 / (period + 1);
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

// ─── Indicator Calculators ────────────────────────────────────

export function calculateSMA(closes: number[], period: number): number {
  if (closes.length < period) return NaN;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function calculateRSI(closes: number[], period = RSI_PERIOD): number {
  if (closes.length < period + 1) return 50; // neutral default

  let gains = 0;
  let losses = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateADX(highs: number[], lows: number[], closes: number[], period = ADX_PERIOD): { adx: number; plusDI: number; minusDI: number } {
  if (closes.length < period * 2) return { adx: 25, plusDI: 25, minusDI: 25 };

  let plusDM = 0;
  let minusDM = 0;
  let tr = 0;

  for (let i = closes.length - period; i < closes.length; i++) {
    const highDiff = highs[i] - highs[i - 1];
    const lowDiff = lows[i - 1] - lows[i];

    if (highDiff > lowDiff && highDiff > 0) plusDM += highDiff;
    if (lowDiff > highDiff && lowDiff > 0) minusDM += lowDiff;

    tr += Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
  }

  const plusDI = tr > 0 ? (plusDM / tr) * 100 : 25;
  const minusDI = tr > 0 ? (minusDM / tr) * 100 : 25;

  return { adx: (plusDI + minusDI) / 2, plusDI, minusDI };
}

export function calculateMACD(closes: number[]): { macdLine: number; signalLine: number; histogram: number } {
  if (closes.length < MACD_SLOW + MACD_SIGNAL) {
    return { macdLine: 0, signalLine: 0, histogram: 0 };
  }

  const fastEMA = ema(closes, MACD_FAST);
  const slowEMA = ema(closes, MACD_SLOW);
  const macdLine = fastEMA.map((f, i) => f - slowEMA[i]);
  const signalLine = ema(macdLine, MACD_SIGNAL);
  const histogram = macdLine.map((m, i) => m - signalLine[i]);

  const last = closes.length - 1;
  return {
    macdLine: macdLine[last],
    signalLine: signalLine[last],
    histogram: histogram[last],
  };
}

export function calculateBollingerBands(closes: number[]): { upper: number; middle: number; lower: number; percentB: number; bandwidth: number } {
  if (closes.length < BB_PERIOD) {
    return { upper: 0, middle: 0, lower: 0, percentB: 0.5, bandwidth: 0 };
  }

  const slice = closes.slice(-BB_PERIOD);
  const middle = slice.reduce((a, b) => a + b, 0) / BB_PERIOD;
  const variance = slice.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / BB_PERIOD;
  const stdDev = Math.sqrt(variance);

  const upper = middle + BB_STD_DEV * stdDev;
  const lower = middle - BB_STD_DEV * stdDev;
  const bandwidth = upper !== lower ? (upper - lower) / middle : 0;
  const percentB = upper !== lower ? (closes[closes.length - 1] - lower) / (upper - lower) : 0.5;

  return { upper, middle, lower, percentB, bandwidth };
}

export function calculateStochastic(highs: number[], lows: number[], closes: number[]): { k: number; d: number } {
  if (closes.length < STOCH_K_PERIOD) return { k: 50, d: 50 };

  const slice = closes.length >= STOCH_K_PERIOD
    ? { h: highs.slice(-STOCH_K_PERIOD), l: lows.slice(-STOCH_K_PERIOD), c: closes.slice(-STOCH_K_PERIOD) }
    : { h: highs, l: lows, c: closes };

  const highestHigh = Math.max(...slice.h);
  const lowestLow = Math.min(...slice.l);
  const currentClose = closes[closes.length - 1];

  const rawK = highestHigh !== lowestLow
    ? ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
    : 50;

  // Simple %D = SMA of last 3 %K values (simplified)
  const d = rawK; // simplified for demo

  return { k: rawK, d };
}

export function calculateATR(highs: number[], lows: number[], closes: number[], period = ATR_PERIOD): number {
  if (closes.length < period + 1) return 0;

  let atr = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    atr += tr;
  }

  return atr / period;
}

// ─── Nonuple Confirmation Algorithm ────────────────────────────

export function analyzeMarket(bars: PriceBar[]): AnalysisResult {
  if (bars.length < MA_SLOW_PERIOD) {
    return getDefaultAnalysis();
  }

  const closes = bars.map(b => b.close);
  const highs = bars.map(b => b.high);
  const lows = bars.map(b => b.low);
  const volumes = bars.map(b => b.volume);

  // 1. MA Crossover
  const maFast = calculateSMA(closes, MA_FAST_PERIOD);
  const maSlow = calculateSMA(closes, MA_SLOW_PERIOD);
  let maBonus = 0;
  if (maFast > maSlow) maBonus = 20;
  else if (maFast < maSlow) maBonus = -20;

  // 2. Volume Confirmation
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentVolume = volumes[volumes.length - 1];
  let volumeBonus = 0;
  if (currentVolume > avgVolume * 1.5) volumeBonus = 15;
  else if (currentVolume < avgVolume * 0.5) volumeBonus = -5;

  // 3. Momentum Check
  const currentPrice = closes[closes.length - 1];
  let momentumBonus = 0;
  if (currentPrice > maFast) momentumBonus = 10;
  else if (currentPrice < maFast) momentumBonus = -10;

  // 4. RSI
  const rsi = calculateRSI(closes);
  let rsiBonus = 0;
  if (rsi > 70) rsiBonus = -10;
  else if (rsi < 30) rsiBonus = 15;
  else if (rsi > 50) rsiBonus = 5;

  // 5. ADX
  const { adx, plusDI, minusDI } = calculateADX(highs, lows, closes);
  let adxBonus = 0;
  if (adx > 25) adxBonus = plusDI > minusDI ? 25 : -15;
  else adxBonus = -5;

  // 6. MACD
  const macd = calculateMACD(closes);
  const macdBonus = macd.histogram > 0 ? 10 : macd.histogram < 0 ? -10 : 0;
  const macdCrossover: 'bullish' | 'bearish' | 'none' =
    macd.macdLine > macd.signalLine ? 'bullish' : macd.macdLine < macd.signalLine ? 'bearish' : 'none';

  // 7. ATR
  const atr = calculateATR(highs, lows, closes);
  const avgATR = atr;
  let atrBonus = 0;
  if (atr > avgATR * 1.5) atrBonus = -5; // High volatility = risk
  else if (atr < avgATR * 0.5) atrBonus = 5; // Low volatility = stable trend

  // 8. Bollinger Bands
  const bb = calculateBollingerBands(closes);
  let bbBonus = 0;
  if (bb.percentB > 1) bbBonus = -8; // Above upper band
  else if (bb.percentB < 0) bbBonus = -8; // Below lower band
  else if (bb.percentB > 0.8) bbBonus = -3;
  else if (bb.percentB < 0.2) bbBonus = -3;
  else if (bb.percentB > 0.5 && bb.bandwidth > 0.04) bbBonus = 4; // Expanding + price in upper half
  else if (bb.percentB < 0.5 && bb.bandwidth > 0.04) bbBonus = -4;

  // 9. Stochastic
  const stoch = calculateStochastic(highs, lows, closes);
  let stochBonus = 0;
  if (stoch.k > 80) stochBonus = -5; // Overbought
  else if (stoch.k < 20) stochBonus = 5; // Oversold
  else if (stoch.k > 50) stochBonus = 3;
  else stochBonus = -3;
  const stochCrossover: 'bullish' | 'bearish' | 'none' = stoch.k > stoch.d ? 'bullish' : stoch.k < stoch.d ? 'bearish' : 'none';

  // Calculate total score
  const totalScore = maBonus + volumeBonus + momentumBonus + rsiBonus + adxBonus + macdBonus + atrBonus + bbBonus + stochBonus;

  // Synergy Bonus: when 4+ factors align
  const factors = [maBonus, volumeBonus, momentumBonus, rsiBonus, adxBonus, macdBonus, atrBonus, bbBonus, stochBonus];
  const positiveCount = factors.filter(f => f > 0).length;
  const negativeCount = factors.filter(f => f < 0).length;
  let synergyBonus = 0;
  if (positiveCount >= 4) synergyBonus = 10;
  else if (negativeCount >= 4) synergyBonus = -10;

  const adjustedScore = Math.max(-100, Math.min(100, totalScore + synergyBonus));

  // Determine trend
  let trend: TrendDirection;
  if (adjustedScore > 15) trend = 'uptrend';
  else if (adjustedScore < -15) trend = 'downtrend';
  else trend = 'neutral';

  // Determine zone color
  let zoneColor: ZoneColor;
  if (adjustedScore > 25) zoneColor = 'green';
  else if (adjustedScore < -25) zoneColor = 'red';
  else zoneColor = 'yellow';

  // Determine strength (0-100)
  const strength = Math.min(100, Math.abs(adjustedScore) + 20);

  // Determine confidence (0-100)
  const confidence = Math.min(100, Math.abs(adjustedScore) + 30);

  // Determine signal text
  const signal: SignalType = getSignalText(adjustedScore);

  return {
    trend,
    strength: Math.round(strength),
    zone_color: zoneColor,
    signal,
    confidence: Math.round(confidence),
    details: {
      ma_fast: Math.round(maFast * 100) / 100,
      ma_slow: Math.round(maSlow * 100) / 100,
      rsi: Math.round(rsi * 100) / 100,
      rsi_signal: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral',
      adx: Math.round(adx * 100) / 100,
      adx_direction: plusDI > minusDI ? 'Bullish' : 'Bearish',
      macd_line: Math.round(macd.macdLine * 100) / 100,
      macd_signal: Math.round(macd.signalLine * 100) / 100,
      macd_crossover: macdCrossover,
      atr: Math.round(atr * 100) / 100,
      atr_volatility: atr > avgATR * 1.5 ? 'high' : atr < avgATR * 0.5 ? 'low' : 'normal',
      atr_trend: atr > avgATR ? 'expanding' : 'contracting',
      atr_bonus: atrBonus,
      atr_stop_suggestions: {
        long_stop: Math.round((currentPrice - 2 * atr) * 100) / 100,
        short_stop: Math.round((currentPrice + 2 * atr) * 100) / 100,
      },
      bb_upper: Math.round(bb.upper * 100) / 100,
      bb_lower: Math.round(bb.lower * 100) / 100,
      bb_percent_b: Math.round(bb.percentB * 100) / 100,
      bb_squeeze: bb.bandwidth < 0.02 ? 'tight' : bb.bandwidth > 0.06 ? 'expanding' : 'normal',
      bb_position: bb.percentB > 0.8 ? 'near upper' : bb.percentB < 0.2 ? 'near lower' : 'middle',
      bb_bonus: bbBonus,
      bb_bandwidth: Math.round(bb.bandwidth * 1000) / 1000,
      stoch_k: Math.round(stoch.k * 100) / 100,
      stoch_d: Math.round(stoch.d * 100) / 100,
      stoch_signal: stoch.k > 80 ? 'Overbought' : stoch.k < 20 ? 'Oversold' : 'Neutral',
      stoch_crossover: stochCrossover,
      stoch_bonus: stochBonus,
      synergy_bonus: synergyBonus,
    },
  };
}

function getSignalText(score: number): SignalType {
  if (score > 60) return 'Strong Uptrend ↑';
  if (score > 35) return 'Moderate Uptrend ↗';
  if (score > 15) return 'Weak Uptrend ⬆';
  if (score > -15) return 'Neutral →';
  if (score > -35) return 'Weak Downtrend ⬇';
  if (score > -60) return 'Moderate Downtrend ↘';
  return 'Strong Downtrend ↓';
}

function getDefaultAnalysis(): AnalysisResult {
  return {
    trend: 'neutral',
    strength: 0,
    zone_color: 'yellow',
    signal: 'Neutral →',
    confidence: 0,
    details: {
      ma_fast: 0, ma_slow: 0,
      rsi: 50, rsi_signal: 'Neutral',
      adx: 25, adx_direction: 'Neutral',
      macd_line: 0, macd_signal: 0, macd_crossover: 'none',
      atr: 0, atr_volatility: 'normal', atr_trend: 'neutral',
      atr_bonus: 0, atr_stop_suggestions: { long_stop: 0, short_stop: 0 },
      bb_upper: 0, bb_lower: 0, bb_percent_b: 0.5,
      bb_squeeze: 'normal', bb_position: 'middle',
      bb_bonus: 0, bb_bandwidth: 0,
      stoch_k: 50, stoch_d: 50,
      stoch_signal: 'Neutral', stoch_crossover: 'none',
      stoch_bonus: 0, synergy_bonus: 0,
    },
  };
}

// ─── Factor Breakdown ──────────────────────────────────────────

export function getFactorBreakdown(analysis: AnalysisResult): FactorResult[] {
  const d = analysis.details as any;
  if (!d) return [];

  // Helper to safely access numeric values
  const num = (v: any, fallback: number = 0): number => typeof v === 'number' ? v : fallback;

  return [
    { name: 'MA Crossover', value: d.ma_fast != null ? `${num(d.ma_fast).toFixed(0)} / ${num(d.ma_slow).toFixed(0)}` : '—', signal: d.ma_fast > d.ma_slow ? 'Bullish' : 'Bearish', bonus: d.ma_fast > d.ma_slow ? 20 : -20, aligned: (d.ma_fast > d.ma_slow) === (analysis.trend === 'uptrend') },
    { name: 'Volume', value: d.volume_ratio ? `${d.volume_ratio}x avg` : '—', signal: d.volume_ratio > 1.5 ? 'Confirmed' : 'Normal', bonus: 15, aligned: true },
    { name: 'Momentum', value: d.momentum_pct != null ? `${d.momentum_pct}%` : `${num(d.rsi).toFixed(1)}`, signal: d.rsi > 50 ? 'Bullish' : 'Bearish', bonus: num(d.rsi) > 50 ? 5 : -5, aligned: (num(d.rsi) > 50) === (analysis.trend === 'uptrend') },
    { name: 'RSI', value: `${num(d.rsi).toFixed(1)}`, signal: d.rsi_signal || (num(d.rsi) > 70 ? 'Overbought' : num(d.rsi) < 30 ? 'Oversold' : 'Neutral'), bonus: num(d.rsi) > 70 ? -10 : num(d.rsi) < 30 ? 15 : 5, aligned: num(d.rsi) > 30 && num(d.rsi) < 70 },
    { name: 'ADX', value: `${num(d.adx).toFixed(1)}`, signal: d.adx_direction || 'Neutral', bonus: num(d.adx) > 25 ? (d.adx_direction === 'Bullish' || d.adx_direction === 'bullish' ? 25 : -15) : -5, aligned: d.adx_direction === (analysis.trend === 'uptrend' ? 'Bullish' : 'Bearish') },
    { name: 'MACD', value: d.macd_crossover || 'none', signal: d.macd_crossover || 'none', bonus: d.macd_crossover === 'bullish' || d.macd_crossover === 'Bullish' ? 10 : d.macd_crossover === 'bearish' || d.macd_crossover === 'Bearish' ? -10 : 0, aligned: (d.macd_crossover === 'bullish' || d.macd_crossover === 'Bullish') === (analysis.trend === 'uptrend') },
    { name: 'ATR', value: `${num(d.atr).toFixed(0)}`, signal: d.atr_volatility || 'normal', bonus: num(d.atr_bonus, 0), aligned: num(d.atr_bonus, 0) >= 0 },
    { name: 'Bollinger Bands', value: d.bb_percent_b != null ? `${(num(d.bb_percent_b, 0.5) * 100).toFixed(1)}%` : '—', signal: d.bb_position || 'normal', bonus: num(d.bb_bonus, 0), aligned: num(d.bb_bonus, 0) > 0 },
    { name: 'Stochastic', value: d.stoch_k != null ? `K:${num(d.stoch_k).toFixed(1)} D:${num(d.stoch_d).toFixed(1)}` : '—', signal: d.stoch_signal || 'neutral', bonus: num(d.stoch_bonus, 0), aligned: num(d.stoch_bonus, 0) > 0 },
  ];
}

// ─── Ocean Metaphor ────────────────────────────────────────────

export function getOceanMetaphor(analysis: AnalysisResult): OceanMetaphor {
  switch (analysis.trend) {
    case 'uptrend':
      if (analysis.strength > 70) {
        return {
          state: 'Powerful current, rising tide',
          wind: 'Strong tailwind — the ocean moves with you',
          signal: 'Full sails — conditions strongly favor long positions',
        };
      }
      return {
        state: 'Gentle waves, rising water',
        wind: 'Light tailwind — the current is favorable',
        signal: 'Set sail — conditions favor long positions',
      };
    case 'downtrend':
      if (analysis.strength > 70) {
        return {
          state: 'Storm surge, falling tide',
          wind: 'Strong headwind — the ocean pushes against you',
          signal: 'Shelter in harbor — stay out of the market or go short',
        };
      }
      return {
        state: 'Rough waters, receding tide',
        wind: 'Headwind — caution advised',
        signal: 'Seek shelter — conditions favor caution or short positions',
      };
    default:
      return {
        state: 'Calm waters, no clear tide',
        wind: 'No wind — the ocean waits',
        signal: 'Anchor down — wait for a clear signal',
      };
  }
}

// ─── Demo Scenarios ────────────────────────────────────────────

export function getDemoScenarios(): DemoScenario[] {
  return [
    {
      name: 'Uptrend',
      description: 'Strong bullish momentum across multiple indicators',
      analysis: {
        trend: 'uptrend',
        strength: 82,
        zone_color: 'green',
        signal: 'Strong Uptrend ↑',
        confidence: 85,
        details: {
          ma_fast: 45230, ma_slow: 44500,
          rsi: 62, rsi_signal: 'Neutral',
          adx: 35, adx_direction: 'Bullish',
          macd_line: 150, macd_signal: 120, macd_crossover: 'bullish',
          atr: 850, atr_volatility: 'normal', atr_trend: 'expanding',
          atr_bonus: 5, atr_stop_suggestions: { long_stop: 43530, short_stop: 46930 },
          bb_upper: 46000, bb_lower: 44000,
          bb_percent_b: 0.62, bb_squeeze: 'normal',
          bb_position: 'middle', bb_bonus: 4, bb_bandwidth: 0.044,
          stoch_k: 68, stoch_d: 55,
          stoch_signal: 'Neutral', stoch_crossover: 'bullish',
          stoch_bonus: 3, synergy_bonus: 10,
        },
      },
      bars: generateDemoBars('uptrend'),
      sr: { levels: [], nearest_support: 44500, nearest_resistance: 46000, support_zone: [44000, 44500], resistance_zone: [45800, 46200], current_position: 'between' },
      ocean: { state: 'Powerful current, rising tide', wind: 'Strong tailwind', signal: 'Full sails — long positions' },
    },
    {
      name: 'Range',
      description: 'Indecisive market with mixed signals',
      analysis: {
        trend: 'neutral',
        strength: 25,
        zone_color: 'yellow',
        signal: 'Neutral →',
        confidence: 30,
        details: {
          ma_fast: 45000, ma_slow: 45100,
          rsi: 48, rsi_signal: 'Neutral',
          adx: 18, adx_direction: 'Neutral',
          macd_line: -20, macd_signal: -15, macd_crossover: 'none',
          atr: 500, atr_volatility: 'low', atr_trend: 'contracting',
          atr_bonus: 5, atr_stop_suggestions: { long_stop: 44000, short_stop: 46000 },
          bb_upper: 45800, bb_lower: 44200,
          bb_percent_b: 0.5, bb_squeeze: 'tight',
          bb_position: 'middle', bb_bonus: 0, bb_bandwidth: 0.036,
          stoch_k: 45, stoch_d: 48,
          stoch_signal: 'Neutral', stoch_crossover: 'none',
          stoch_bonus: 0, synergy_bonus: 0,
        },
      },
      bars: generateDemoBars('neutral'),
      sr: { levels: [], nearest_support: 44200, nearest_resistance: 45800, support_zone: [44000, 44500], resistance_zone: [45500, 46000], current_position: 'between' },
      ocean: { state: 'Calm waters, no clear tide', wind: 'No wind', signal: 'Anchor down — wait' },
    },
    {
      name: 'Downtrend',
      description: 'Strong bearish momentum with multiple confirmations',
      analysis: {
        trend: 'downtrend',
        strength: 78,
        zone_color: 'red',
        signal: 'Strong Downtrend ↓',
        confidence: 80,
        details: {
          ma_fast: 44200, ma_slow: 44800,
          rsi: 32, rsi_signal: 'Oversold',
          adx: 38, adx_direction: 'Bearish',
          macd_line: -180, macd_signal: -120, macd_crossover: 'bearish',
          atr: 920, atr_volatility: 'high', atr_trend: 'expanding',
          atr_bonus: -5, atr_stop_suggestions: { long_stop: 42360, short_stop: 45840 },
          bb_upper: 45800, bb_lower: 43500,
          bb_percent_b: 0.15, bb_squeeze: 'expanding',
          bb_position: 'near lower', bb_bonus: -3, bb_bandwidth: 0.052,
          stoch_k: 22, stoch_d: 35,
          stoch_signal: 'Oversold', stoch_crossover: 'bearish',
          stoch_bonus: 5, synergy_bonus: -10,
        },
      },
      bars: generateDemoBars('downtrend'),
      sr: { levels: [], nearest_support: 43500, nearest_resistance: 44800, support_zone: [43200, 43800], resistance_zone: [44500, 45000], current_position: 'near_support' },
      ocean: { state: 'Storm surge, falling tide', wind: 'Strong headwind', signal: 'Shelter in harbor' },
    },
  ];
}

function generateDemoBars(trend: 'uptrend' | 'neutral' | 'downtrend'): BarAnalysis[] {
  const bars: BarAnalysis[] = [];
  const basePrice = 45000;
  const count = 50;

  for (let i = 0; i < count; i++) {
    const progress = i / count;
    let price: number;
    let zoneColor: ZoneColor;
    let barTrend: TrendDirection;
    let strength: number;

    switch (trend) {
      case 'uptrend':
        price = basePrice + (progress * 2000) + (Math.sin(i * 0.3) * 200);
        zoneColor = progress > 0.3 ? 'green' : 'yellow';
        barTrend = 'uptrend';
        strength = 40 + progress * 50;
        break;
      case 'downtrend':
        price = basePrice - (progress * 2000) - (Math.sin(i * 0.3) * 200);
        zoneColor = progress > 0.3 ? 'red' : 'yellow';
        barTrend = 'downtrend';
        strength = 40 + progress * 50;
        break;
      default:
        price = basePrice + Math.sin(i * 0.2) * 500;
        zoneColor = 'yellow';
        barTrend = 'neutral';
        strength = 20 + Math.abs(Math.sin(i * 0.2)) * 30;
    }

    bars.push({
      date: new Date(2026, 4, i + 1).toISOString().split('T')[0],
      close: Math.round(price),
      zone_color: zoneColor,
      trend: barTrend,
      strength: Math.round(strength),
    });
  }

  return bars;
}