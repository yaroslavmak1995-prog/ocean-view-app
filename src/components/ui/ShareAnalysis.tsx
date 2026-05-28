// Ocean View — Share Analysis Component
// Share current analysis via clipboard or social media

import { useState } from 'react';
import type { AnalysisResult } from '../../lib/types';

interface ShareAnalysisProps {
  analysis: AnalysisResult;
  ticker: string;
}

export function ShareAnalysis({ analysis, ticker }: ShareAnalysisProps) {
  const [copied, setCopied] = useState(false);

  const zoneEmoji = analysis.zone_color === 'green' ? '🟢' : analysis.zone_color === 'red' ? '🔴' : '🟡';
  const trendArrow = analysis.trend === 'uptrend' ? '↑' : analysis.trend === 'downtrend' ? '↓' : '→';

  const shareText = `🌊 Ocean View: ${ticker} ${zoneEmoji} ${trendArrow}
${analysis.signal} | Confidence: ${analysis.confidence}% | Strength: ${analysis.strength}%
9 indicators → 1 wave. 0 candles.
https://yaroslavmak1995-prog.github.io/ocean-view-app/`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback: select a textarea
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#0a0f1e] rounded-xl p-3 border border-gray-800/50">
      <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Share Analysis</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        <button
          onClick={handleTwitter}
          className="flex-1 px-3 py-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg border border-blue-500/30 transition-colors"
        >
          𝕏 Share
        </button>
      </div>
    </div>
  );
}