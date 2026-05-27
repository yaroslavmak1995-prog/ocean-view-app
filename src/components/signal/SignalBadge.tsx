// Ocean View — Signal Badge Component

import type { AnalysisResult } from '../../lib/types';

interface SignalBadgeProps {
  analysis: AnalysisResult;
}

export function SignalBadge({ analysis }: SignalBadgeProps) {
  const colorMap: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
    green: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', emoji: '🟢' },
    yellow: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', emoji: '🟡' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', emoji: '🔴' },
  };

  const style = colorMap[analysis.zone_color];

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg px-4 py-3`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{style.emoji}</span>
        <span className={`${style.text} font-semibold text-sm`}>{analysis.signal}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
        <span>Confidence: {analysis.confidence}%</span>
        <span>•</span>
        <span>Strength: {analysis.strength}%</span>
      </div>
    </div>
  );
}