// Ocean View — Loading Skeleton Components
// Pulse animation for loading states

export function WaveChartSkeleton({ width = 800, height = 300 }: { width?: number; height?: number }) {
  return (
    <div
      className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50 animate-pulse"
      style={{ width: '100%', maxWidth: width, height }}
    >
      {/* Fake wave line */}
      <div className="h-3 bg-gray-700/50 rounded w-1/3 mb-6" />
      <svg width="100%" height={height - 40} viewBox={`0 0 ${width} ${height - 40}`}>
        {/* Grid skeleton */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <line
            key={i}
            x1={60}
            y1={20 + frac * (height - 80)}
            x2={width - 40}
            y2={20 + frac * (height - 80)}
            stroke="#1e293b"
            strokeWidth={0.5}
          />
        ))}
        {/* Fake wave path */}
        <path
          d={`M 60 ${height * 0.5} C ${width * 0.2} ${height * 0.3} ${width * 0.3} ${height * 0.6} ${width * 0.4} ${height * 0.4} C ${width * 0.5} ${height * 0.2} ${width * 0.6} ${height * 0.5} ${width * 0.7} ${height * 0.35} C ${width * 0.8} ${height * 0.55} ${width * 0.85} ${height * 0.3} ${width - 40} ${height * 0.4}`}
          fill="none"
          stroke="#374151"
          strokeWidth={2}
          strokeDasharray="8 6"
          opacity={0.5}
        />
      </svg>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Signal badge */}
      <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
        <div className="h-6 bg-gray-700/50 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-700/50 rounded w-3/4" />
      </div>
      {/* Confidence meter */}
      <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
        <div className="h-3 bg-gray-700/50 rounded w-1/3 mb-3" />
        <div className="h-2 bg-gray-700/50 rounded-full w-full" />
      </div>
      {/* Ocean conditions */}
      <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
        <div className="h-3 bg-gray-700/50 rounded w-1/2 mb-3" />
        <div className="h-4 bg-gray-700/50 rounded w-full mb-2" />
        <div className="h-4 bg-gray-700/50 rounded w-3/4" />
      </div>
    </div>
  );
}

export function FactorGridSkeleton() {
  return (
    <div className="mt-4 bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50 animate-pulse">
      <div className="h-3 bg-gray-700/50 rounded w-1/4 mb-4" />
      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-gray-800/30 rounded-lg p-3 space-y-2">
            <div className="h-2 bg-gray-700/50 rounded w-3/4" />
            <div className="h-4 bg-gray-700/50 rounded w-1/2" />
            <div className="h-2 bg-gray-700/50 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#060b18] text-white flex flex-col">
      {/* Header skeleton */}
      <div className="border-b border-gray-800/50 px-4 py-4 animate-pulse">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="h-6 bg-gray-700/50 rounded w-32" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-700/50 rounded w-14" />
            <div className="h-8 bg-gray-700/50 rounded w-14" />
            <div className="h-8 bg-gray-700/50 rounded w-14" />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WaveChartSkeleton />
          </div>
          <SidebarSkeleton />
        </div>
        <FactorGridSkeleton />
      </main>
    </div>
  );
}