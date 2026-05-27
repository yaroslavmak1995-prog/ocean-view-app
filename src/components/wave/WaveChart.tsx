// Ocean View — Wave Chart Component
// SVG wave rendering with zone coloring

import { useMemo } from 'react';
import type { BarAnalysis } from '../../lib/types';

interface WaveChartProps {
  bars: BarAnalysis[];
  width?: number;
  height?: number;
  showSR?: boolean;
  supportLevel?: number | null;
  resistanceLevel?: number | null;
}

export function WaveChart({
  bars,
  width = 800,
  height = 300,
  showSR = true,
  supportLevel,
  resistanceLevel,
}: WaveChartProps) {
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { points, minY, maxY, zoneRects, srLines } = useMemo(() => {
    if (bars.length === 0) return { points: [], minY: 0, maxY: 0, zoneRects: [], srLines: [] };

    const prices = bars.map(b => b.close);
    const minY = Math.min(...prices) * 0.998;
    const maxY = Math.max(...prices) * 1.002;
    const range = maxY - minY || 1;

    const points = bars.map((bar, i) => ({
      x: padding.left + (i / (bars.length - 1)) * chartW,
      y: padding.top + chartH - ((bar.close - minY) / range) * chartH,
      bar,
    }));

    // Zone rectangles — colored bands behind the wave
    const zoneRects: { x: number; width: number; color: string; opacity: number }[] = [];
    let currentZone = bars[0].zone_color;
    let zoneStart = 0;

    for (let i = 1; i <= bars.length; i++) {
      const nextZone = i < bars.length ? bars[i].zone_color : null;
      if (nextZone !== currentZone || i === bars.length) {
        zoneRects.push({
          x: padding.left + (zoneStart / bars.length) * chartW,
          width: ((i - zoneStart) / bars.length) * chartW,
          color: currentZone,
          opacity: 0.08,
        });
        if (i < bars.length) {
          currentZone = nextZone!;
          zoneStart = i;
        }
      }
    }

    // S/R lines
    const srLines: { y: number; type: string; price: number }[] = [];
    if (supportLevel) {
      srLines.push({
        y: padding.top + chartH - ((supportLevel - minY) / range) * chartH,
        type: 'support',
        price: supportLevel,
      });
    }
    if (resistanceLevel) {
      srLines.push({
        y: padding.top + chartH - ((resistanceLevel - minY) / range) * chartH,
        type: 'resistance',
        price: resistanceLevel,
      });
    }

    return { points, minY, maxY, zoneRects, srLines };
  }, [bars, chartW, chartH, padding, supportLevel, resistanceLevel]);

  if (bars.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ width, height }}>
        Loading wave data...
      </div>
    );
  }

  // Build smooth SVG path
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(' ');

  // Area fill path (wave to bottom)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const lastBar = bars[bars.length - 1];
  const lastPoint = points[points.length - 1];

  const zoneColorMap: Record<string, string> = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  };

  const strokeColor = zoneColorMap[lastBar.zone_color] || '#f59e0b';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} fill="#0a0f1e" rx="12" />

      {/* Zone backgrounds */}
      {zoneRects.map((z, i) => (
        <rect
          key={i}
          x={z.x}
          y={padding.top}
          width={z.width}
          height={chartH}
          fill={zoneColorMap[z.color] || '#f59e0b'}
          opacity={z.opacity}
        />
      ))}

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
        const y = padding.top + frac * chartH;
        const price = maxY - frac * (maxY - minY);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="#1e293b" strokeWidth={0.5} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize={10}>
              {price.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* S/R Lines */}
      {showSR &&
        srLines.map((sr, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={sr.y}
              x2={padding.left + chartW}
              y2={sr.y}
              stroke={sr.type === 'support' ? '#10b981' : '#ef4444'}
              strokeWidth={1}
              strokeDasharray="6 4"
              opacity={0.6}
            />
            <text
              x={padding.left + chartW + 5}
              y={sr.y + 4}
              fill={sr.type === 'support' ? '#10b981' : '#ef4444'}
              fontSize={9}
              opacity={0.8}
            >
              {sr.type === 'support' ? 'S' : 'R'} {sr.price.toFixed(0)}
            </text>
          </g>
        ))}

      {/* Wave area fill */}
      <path d={areaD} fill={strokeColor} opacity={0.1} />

      {/* Wave line with glow */}
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={2.5} opacity={0.3} />
      <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={1.5} />

      {/* Current price pulse */}
      {lastPoint && (
        <g>
          <circle cx={lastPoint.x} cy={lastPoint.y} r={8} fill={strokeColor} opacity={0.2}>
            <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill={strokeColor} />
          <text
            x={lastPoint.x + 12}
            y={lastPoint.y + 4}
            fill={strokeColor}
            fontSize={11}
            fontWeight="bold"
          >
            {lastBar.close.toLocaleString()}
          </text>
        </g>
      )}

      {/* X-axis date labels */}
      {points
        .filter((_, i) => i % Math.ceil(points.length / 6) === 0)
        .map((p, i) => (
          <text key={i} x={p.x} y={height - 8} textAnchor="middle" fill="#64748b" fontSize={9}>
            {p.bar.date.slice(5)}
          </text>
        ))}
    </svg>
  );
}