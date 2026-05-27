// Ocean View — Footer Component

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🌊</span>
            <span className="text-sm text-gray-400">Ocean View © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="mailto:oceanview.trading@gmail.com" className="hover:text-gray-300 transition-colors">
              Contact
            </a>
            <span>•</span>
            <a
              href="https://github.com/yaroslavmak1995-prog/ocean-view-landing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <span>9 indicators. 1 wave. 0 candles.</span>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-600">
          Ocean View is for informational purposes only. Not financial advice. Trade at your own risk.
        </div>
      </div>
    </footer>
  );
}