// Ocean View — Confidence Meter Component

import type { AnalysisResult } from '../../lib/types';

interface ConfidenceMeterProps {
  analysis: AnalysisResult;
}

export function ConfidenceMeter({ analysis }: ConfidenceMeterProps) {
  const colorMap: Record<string, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  };

  const barColor = colorMap[analysis.zone_color];
  const confidence = analysis.confidence;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Confidence</span>
        <span className="text-gray-300 font-mono">{confidence}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}