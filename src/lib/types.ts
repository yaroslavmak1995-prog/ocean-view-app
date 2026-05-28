// Ocean View — TypeScript Types
// Ported from Python Nonuple Confirmation Algorithm v6.1

// ─── Core Types ───────────────────────────────────────────────

export type TrendDirection = 'uptrend' | 'downtrend' | 'neutral';
export type ZoneColor = 'green' | 'yellow' | 'red' | 'light_green' | 'light_red' | 'strong_green' | 'strong_red';
export type SignalType = string;

// ─── Indicator Details ────────────────────────────────────────

export interface MACDDetails {
  macd_line: number;
  macd_signal: number;
  macd_crossover: 'bullish' | 'bearish' | 'none';
  macd_bonus: number;
}

export interface BollingerBandsDetails {
  bb_upper: number;
  bb_lower: number;
  bb_percent_b: number;
  bb_squeeze: 'extreme' | 'tight' | 'normal' | 'expanding';
  bb_position: string;
  bb_bonus: number;
  bb_bandwidth: number;
}

export interface StochasticDetails {
  stoch_k: number;
  stoch_d: number;
  stoch_signal: string;
  stoch_crossover: 'bullish' | 'bearish' | 'none';
  stoch_bonus: number;
}

export interface ATRDetails {
  atr: number;
  atr_volatility: 'extreme' | 'high' | 'normal' | 'low';
  atr_trend: string;
  atr_bonus: number;
  atr_stop_suggestions: {
    long_stop: number;
    short_stop: number;
  };
}

export interface AnalysisDetails {
  ma_fast: number;
  ma_slow: number;
  rsi: number;
  rsi_signal: string;
  adx: number;
  adx_direction: string;
  macd_line: number;
  macd_signal: number;
  macd_crossover: string;
  atr: number;
  atr_volatility: string;
  atr_trend: string;
  atr_bonus: number;
  atr_stop_suggestions: Record<string, number>;
  bb_upper: number;
  bb_lower: number;
  bb_percent_b: number;
  bb_squeeze: string;
  bb_position: string;
  bb_bonus: number;
  bb_bandwidth: number;
  stoch_k: number;
  stoch_d: number;
  stoch_signal: string;
  stoch_crossover: string;
  stoch_bonus: number;
  synergy_bonus: number;
}

// ─── Analysis Result ────────────────────────────────────────────

export interface AnalysisResult {
  trend: TrendDirection;
  strength: number;        // 0-100
  zone_color: ZoneColor;
  signal: SignalType;
  confidence: number;       // 0-100
  details: AnalysisDetails;
}

// ─── Factor Breakdown ──────────────────────────────────────────

export interface FactorResult {
  name: string;
  value: number | string;
  signal: string;
  bonus: number;
  aligned: boolean;       // Is this factor aligned with the overall trend?
}

// ─── Support/Resistance ────────────────────────────────────────

export interface SRLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: 'major' | 'moderate' | 'minor';
  methods: string[];       // Which detection methods found this level
}

export interface SRResult {
  levels: SRLevel[];
  nearest_support: number | null;
  nearest_resistance: number | null;
  support_zone: [number, number] | null;
  resistance_zone: [number, number] | null;
  current_position: 'near_support' | 'near_resistance' | 'between';
}

// ─── Price Bar ─────────────────────────────────────────────────

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── History with Per-Bar Analysis ─────────────────────────────

export interface BarAnalysis {
  date: string;
  close: number;
  zone_color: ZoneColor;
  trend: TrendDirection;
  strength: number;
}

// ─── Ocean Metaphor ────────────────────────────────────────────

export interface OceanMetaphor {
  state: string;      // e.g., "Calm waters, gentle current"
  wind: string;       // e.g., "Tailwind — the market moves with you"
  signal: string;     // e.g., "Set sail — conditions favor long positions"
}

// ─── Demo Scenarios ────────────────────────────────────────────

export interface DemoScenario {
  name: string;
  description: string;
  analysis: AnalysisResult;
  bars: BarAnalysis[];
  sr: SRResult;
  ocean: OceanMetaphor;
}

// ─── API Response ──────────────────────────────────────────────

export interface APIResponse<T> {
  data: T;
  cached?: boolean;
  stale?: boolean;
  warning?: string;
}

// ─── Subscription ──────────────────────────────────────────────

export interface Subscription {
  email: string;
  source: string;
  interest: string;
}