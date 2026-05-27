// Ocean View — Ocean Metaphor Component

import type { OceanMetaphor as OceanMetaphorType, AnalysisResult } from '../../lib/types';

interface OceanMetaphorProps {
  metaphor: OceanMetaphorType;
  analysis: AnalysisResult;
}

export function OceanMetaphor({ metaphor, analysis }: OceanMetaphorProps) {
  const waveEmoji = analysis.trend === 'uptrend' ? '🌊' : analysis.trend === 'downtrend' ? '⛈️' : '🌅';
  const windEmoji = analysis.trend === 'uptrend' ? '💨' : analysis.trend === 'downtrend' ? '🌪️' : '🍃';
  const signalEmoji = analysis.trend === 'uptrend' ? '⛵' : analysis.trend === 'downtrend' ? '⚓' : '🏕️';

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-base">{waveEmoji}</span>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Ocean State</div>
          <div className="text-xs text-gray-300">{metaphor.state}</div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-base">{windEmoji}</span>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Wind</div>
          <div className="text-xs text-gray-300">{metaphor.wind}</div>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-base">{signalEmoji}</span>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Signal</div>
          <div className="text-xs text-gray-300">{metaphor.signal}</div>
        </div>
      </div>
    </div>
  );
}