// Ocean View — Factor Grid Component
// 9 factors breakdown with alignment indicators

import type { FactorResult } from '../../lib/types';

interface FactorGridProps {
  factors: FactorResult[];
}

export function FactorGrid({ factors }: FactorGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2">
      {factors.map((factor, i) => (
        <div
          key={i}
          className={`rounded-lg px-3 py-2 text-xs ${
            factor.aligned
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-400 truncate">{factor.name}</span>
            <span className={factor.bonus > 0 ? 'text-emerald-400' : factor.bonus < 0 ? 'text-red-400' : 'text-gray-500'}>
              {factor.bonus > 0 ? '+' : ''}{factor.bonus}
            </span>
          </div>
          <div className="mt-1 text-gray-300 font-mono text-[10px]">{factor.value}</div>
          <div className={`mt-0.5 ${factor.aligned ? 'text-emerald-500' : 'text-red-500'} text-[10px]`}>
            {factor.aligned ? '✓ Aligned' : '✗ Divergent'}
          </div>
        </div>
      ))}
    </div>
  );
}