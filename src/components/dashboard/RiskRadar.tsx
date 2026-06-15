// Ocean View — Risk Radar Component
// Cross-asset risk-on/risk-off indicator based on sector divergence

import type { RiskRadar } from '../../hooks/useMarketOverview';

interface RiskRadarProps {
  riskRadar: RiskRadar;
}

const sectorEmoji: Record<string, string> = {
  crypto: '🪙',
  stocks: '📈',
  etfs: '📊',
};

const trendLabels: Record<string, { text: string; color: string }> = {
  uptrend: { text: 'Up', color: 'text-emerald-400' },
  downtrend: { text: 'Down', color: 'text-red-400' },
  neutral: { text: 'Flat', color: 'text-amber-400' },
};

export function RiskRadarCard({ riskRadar }: RiskRadarProps) {
  const { score, label, emoji, color, bgColor, borderColor, description, crossAssetDivergence, cryptoTrend, stocksTrend, etfsTrend } = riskRadar;

  // Score gauge gradient
  const scoreColor = score >= 65 ? '#34d399' : score <= 35 ? '#f87171' : '#fbbf24';

  // Sector trends
  const sectors = [
    { key: 'crypto', trend: cryptoTrend, label: 'Crypto' },
    { key: 'stocks', trend: stocksTrend, label: 'Stocks' },
    { key: 'etfs', trend: etfsTrend, label: 'ETFs' },
  ];

  return (
    <div className={`rounded-xl border p-4 ${bgColor} ${borderColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider">⚡ Risk Radar</h3>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${bgColor} ${borderColor} border`}>
          <span className="text-sm">{emoji}</span>
          <span className={`text-xs font-semibold ${color}`}>{label}</span>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="relative mb-3">
        <div className="flex items-end justify-center gap-1 mb-1">
          <span className="text-3xl font-bold font-mono" style={{ color: scoreColor }}>
            {score}
          </span>
          <span className="text-xs text-gray-500 mb-1">/100</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${score}%`,
              background: score >= 65
                ? 'linear-gradient(90deg, #059669, #34d399)'
                : score <= 35
                ? 'linear-gradient(90deg, #dc2626, #f87171)'
                : 'linear-gradient(90deg, #d97706, #fbbf24)',
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
          <span>Risk-Off</span>
          <span>Neutral</span>
          <span>Risk-On</span>
        </div>
      </div>

      {/* Sector Trends */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {sectors.map(({ key, trend, label }) => {
          const trendInfo = trendLabels[trend] || trendLabels.neutral;
          return (
            <div key={key} className="bg-gray-800/40 rounded-lg px-2 py-1.5 text-center">
              <div className="text-[10px] text-gray-500">{sectorEmoji[key]} {label}</div>
              <div className={`text-xs font-semibold ${trendInfo.color}`}>{trendInfo.text}</div>
            </div>
          );
        })}
      </div>

      {/* Divergence Alert */}
      {crossAssetDivergence && (
        <div className={`mb-2 px-2.5 py-2 rounded-lg border ${borderColor} ${bgColor}`}>
          <div className="flex items-start gap-1.5">
            <span className="text-xs">⚠️</span>
            <div>
              <div className="text-[11px] font-semibold text-amber-400">Cross-Asset Divergence Detected</div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {cryptoTrend === 'downtrend'
                  ? 'Crypto is bearish while traditional markets are bullish — capital may be flowing away from risk assets.'
                  : 'Crypto is bullish while traditional markets are bearish — unusual risk appetite in crypto.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-[10px] text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}