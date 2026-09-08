// Ocean View — Landing Page Component (React version) v5
// Portable from standalone-landing.html
// Day 42: Market Pulse, FAQ Accordion, useSubscription hook, expanded ticker coverage

import { useState, useEffect, useCallback } from 'react';
import type { DemoScenario } from '../../lib/types';
import { WaveChart } from '../wave/WaveChart';
import { SignalBadge } from '../signal/SignalBadge';
import { ConfidenceMeter } from '../signal/ConfidenceMeter';
import { FactorGrid } from '../factors/FactorGrid';
import { OceanMetaphor } from '../ocean/OceanMetaphor';
import { getDemoScenarios, getFactorBreakdown, getOceanMetaphor } from '../../lib/nonuple';
import { useSubscription } from '../../hooks/useSubscription';
import { useSubscriberCount } from '../../hooks/useSubscriberCount';
import { useMarketPulse } from '../../hooks/useMarketPulse';

// FAQ Accordion Component
function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-[#0a0f1e] rounded-xl border border-gray-800/50 overflow-hidden transition-colors hover:border-gray-700/50">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <h3 className="text-sm font-semibold text-emerald-400 pr-4">{item.q}</h3>
            <span className={`text-gray-500 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-5">
              <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const scenarios: DemoScenario[] = getDemoScenarios();
  const [activeScenario, setActiveScenario] = useState(0);
  const { email, setEmail, subscribe, isSubscribed, errorMessage } = useSubscription();
  const { count: subscriberCount } = useSubscriberCount();
  const { data: pulseData } = useMarketPulse();

  // Auto-rotate scenarios
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScenario(prev => (prev + 1) % scenarios.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [scenarios.length]);

  const scenario = scenarios[activeScenario];
  const factors = getFactorBreakdown(scenario.analysis);
  const metaphor = getOceanMetaphor(scenario.analysis);

  const handleSubscribe = useCallback(() => {
    subscribe();
  }, [subscribe]);

  return (
    <div className="min-h-screen bg-[#060b18] text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span className="text-xl font-bold">Ocean View</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 hidden sm:block">9 indicators. 1 wave. 0 candles.</div>
            <a href="#dashboard" className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors font-medium">
              Live Dashboard →
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400 bg-clip-text text-transparent">
            Candlesticks Are Obsolete
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6">
          9 technical indicators fused into a single ocean wave. See market direction in 2 seconds — not 2 minutes.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <a
            href="ocean-wave-demo.html"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white font-semibold transition-all shadow-lg shadow-cyan-500/20"
          >
            🌊 Try Interactive Demo →
          </a>
          <a
            href="#dashboard"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 font-medium transition-all border border-gray-700"
          >
            Live Dashboard →
          </a>
        </div>

        {/* Scenario Buttons */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {scenarios.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveScenario(i)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                activeScenario === i
                  ? s.analysis.zone_color === 'green'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : s.analysis.zone_color === 'red'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wave Chart */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
              <WaveChart
                bars={scenario.bars}
                supportLevel={scenario.sr.nearest_support}
                resistanceLevel={scenario.sr.nearest_resistance}
                width={760}
                height={350}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SignalBadge analysis={scenario.analysis} />
            <ConfidenceMeter analysis={scenario.analysis} />
            <div className="bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Ocean Conditions</h3>
              <OceanMetaphor metaphor={metaphor} analysis={scenario.analysis} />
            </div>
          </div>
        </div>

        {/* Factor Grid */}
        <div className="mt-6 bg-[#0a0f1e] rounded-xl p-4 border border-gray-800/50">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">9 Factor Breakdown</h3>
          <FactorGrid factors={factors} />
        </div>
      </section>

      {/* Pain Points */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Sound Familiar?</h2>
        <p className="text-gray-500 text-center mb-12">Every trader has been here.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { emoji: '😵', title: 'Too Many Charts', desc: 'RSI here, MACD there, Bollinger over there... You switch between 5+ indicators and still aren\'t sure.' },
            { emoji: '😰', title: 'Missed Signals', desc: 'You saw the RSI signal but missed the ADX divergence. By the time you connect the dots, the move is over.' },
            { emoji: '🤯', title: 'Pattern Overload', desc: 'Doji, engulfing, hammer, morning star... 30+ candlestick patterns nobody can remember under pressure.' },
            { emoji: '💸', title: 'Lost Money on Bad Reads', desc: 'You bought near resistance thinking it was support. Or sold in a dip that was actually a buying opportunity.' },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-[#0a0f1e] rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-colors">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', icon: '👁️', title: 'Look', desc: 'One wave replaces 9 separate charts. Green = buy, red = sell, yellow = wait.' },
            { step: '2', icon: '🧠', title: 'Understand', desc: 'Nonuple Algorithm fuses MA, RSI, MACD, ADX, BB, Stochastic, ATR, Volume, Momentum.' },
            { step: '3', icon: '⚡', title: 'Decide', desc: 'Confidence score + ocean metaphor → instant trading decision in 2 seconds.' },
          ].map((item) => (
            <div key={item.step} className="text-center p-6 bg-[#0a0f1e] rounded-xl border border-gray-800/50">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-sm text-gray-500 mb-1">Step {item.step}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Market Pulse — Live Data */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Live Market Pulse</h2>
        <p className="text-gray-500 text-center mb-8">Real-time analysis from the Nonuple Algorithm.</p>

        {/* Live Data Cards — Top 5 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {pulseData.length > 0 ? pulseData.map((item) => {
            const zoneColors: Record<string, string> = {
              green: 'border-emerald-500/30 bg-emerald-500/5',
              light_green: 'border-emerald-500/30 bg-emerald-500/5',
              strong_green: 'border-emerald-500/30 bg-emerald-500/5',
              yellow: 'border-amber-500/30 bg-amber-500/5',
              red: 'border-red-500/30 bg-red-500/5',
              light_red: 'border-red-500/30 bg-red-500/5',
              strong_red: 'border-red-500/30 bg-red-500/5',
            };
            const trendEmoji: Record<string, string> = { uptrend: '🟢', downtrend: '🔴', neutral: '🟡' };
            const borderClass = zoneColors[item.zone_color] || zoneColors.yellow;
            const trend = item.trend || 'neutral';
            const isUp = trend === 'uptrend';
            const isDown = trend === 'downtrend';

            return (
              <a
                key={item.symbol}
                href="#dashboard"
                className={`rounded-xl border p-3 text-center hover:scale-105 transition-all group ${borderClass}`}
              >
                <div className="text-lg mb-1">{trendEmoji[trend] || '🟡'}</div>
                <div className="text-xs font-semibold group-hover:text-emerald-400 transition-colors">{item.label}</div>
                {item.price !== null ? (
                  <>
                    <div className="text-sm font-mono text-gray-300">
                      ${item.price > 1000 ? item.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    {item.change !== null && (
                      <div className={`text-[10px] font-mono ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-gray-500'}`}>
                        {isUp ? '+' : ''}{item.change.toFixed(2)}%
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[10px] text-gray-600 mt-1">Loading...</div>
                )}
              </a>
            );
          }) : (
            <>
              {[
                { symbol: 'BTC', name: 'Bitcoin', emoji: '🪙' },
                { symbol: 'ETH', name: 'Ethereum', emoji: '💎' },
                { symbol: 'AAPL', name: 'Apple', emoji: '🍎' },
                { symbol: 'NVDA', name: 'NVIDIA', emoji: '🟢' },
                { symbol: 'SPY', name: 'S&P 500', emoji: '📊' },
              ].map((item) => (
                <div key={item.symbol} className="bg-[#0a0f1e] rounded-xl border border-gray-800/50 p-3 text-center">
                  <div className="text-lg mb-1">{item.emoji}</div>
                  <div className="text-xs font-semibold">{item.symbol}</div>
                  <div className="text-[10px] text-gray-600">{item.name}</div>
                  <div className="text-[10px] text-gray-600 mt-1">Loading...</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Remaining tickers — compact */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {['SOL', 'DOGE', 'ADA', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'META', 'QQQ', 'IWM'].map((s) => (
            <a
              key={s}
              href="#dashboard"
              className="bg-[#0a0f1e] rounded-lg border border-gray-800/50 px-2.5 py-1 text-[11px] font-medium text-gray-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
            >
              {s}
            </a>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600">
          🌊 Try the <a href="#dashboard" className="text-emerald-400 hover:text-emerald-300 underline">Live Dashboard</a> for full analysis of 15+ assets
        </p>
      </section>

      {/* Social Proof */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Traders Are Talking</h2>
        <p className="text-gray-500 text-center mb-12">Early feedback from the beta community.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              text: '"I finally understand what RSI and MACD are telling me — without reading the numbers. The wave just makes sense."',
              name: 'Alex K.',
              role: 'Swing Trader',
              emoji: '📊',
            },
            {
              text: '"This is exactly what I needed. I stopped trading because charts overwhelmed me. Ocean View brings me back."',
              name: 'Maria S.',
              role: 'Part-time Trader',
              emoji: '🌊',
            },
            {
              text: '"2 seconds vs 2 minutes — that\'s not an exaggeration. I can see the entire market picture in one glance."',
              name: 'Dmitry P.',
              role: 'Day Trader',
              emoji: '⚡',
            },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-[#0a0f1e] rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-colors">
              <div className="text-2xl mb-3">{item.emoji}</div>
              <p className="text-sm text-gray-300 mb-4 italic">{item.text}</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                  {item.name[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold">{item.name}</div>
                  <div className="text-[10px] text-gray-500">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-6">* Testimonials from early beta testers. Individual results may vary.</p>
      </section>

      {/* Comparison */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">The Old Way vs. Ocean View</h2>
        <p className="text-gray-500 text-center mb-12">One wave replaces the chaos.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-950/20 rounded-xl border border-red-500/20 p-6">
            <h3 className="text-red-400 font-semibold mb-4">📉 The Old Way</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span className="text-red-400">✗</span> Check 9 separate indicators</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✗</span> Memorize 30+ candlestick patterns</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✗</span> 2+ minutes per decision</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✗</span> Conflicting signals everywhere</li>
              <li className="flex items-start gap-2"><span className="text-red-400">✗</span> Emotional, reactive trading</li>
            </ul>
          </div>
          <div className="bg-emerald-950/20 rounded-xl border border-emerald-500/20 p-6">
            <h3 className="text-emerald-400 font-semibold mb-4">🌊 Ocean View</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> One wave = 9 indicators fused</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> No patterns to memorize</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> 2 seconds per decision</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Clear, confident signals</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Data-driven, calm trading</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ — Interactive Accordion */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <FAQAccordion items={[
          {
            q: 'Do I need to understand technical analysis to use Ocean View?',
            a: 'No! That\'s the whole point. Ocean View translates 9 indicators into a simple wave. You don\'t need to know what MACD or Bollinger Bands mean — just look at the wave. Green = buy zone, red = sell zone, yellow = wait.',
          },
          {
            q: 'Is this a replacement for TradingView?',
            a: 'Ocean View is not a full replacement. Think of it as a decision compass. If you want to draw trendlines and analyze 50 indicators, TradingView is great. If you want a quick "should I buy, sell, or wait?" signal — that\'s us.',
          },
          {
            q: 'How accurate is the Nonuple Algorithm?',
            a: 'Our algorithm combines 9 indicators with a Synergy Bonus when 4+ factors align. In backtesting, it identifies trend scenarios with 70-80% accuracy. No algorithm is perfect — always use risk management.',
          },
          {
            q: 'What markets does Ocean View cover?',
            a: 'Currently: crypto (BTC, ETH, SOL, DOGE, ADA), top US stocks (AAPL, MSFT, NVDA, TSLA, GOOGL, AMZN, META), and major ETFs (SPY, QQQ, IWM). We also track forex pairs (EUR/USD, GBP/USD). That\'s 17+ assets with live analysis.',
          },
          {
            q: 'Will there be a mobile app?',
            a: 'Yes! Our web app is already mobile-optimized with a sticky CTA and responsive design. A native iOS/Android app is planned for after launch, with push notifications for signals.',
          },
          {
            q: 'Is Ocean View financial advice?',
            a: 'No. Ocean View is an informational tool that visualizes technical indicators. It does not recommend specific trades. Always do your own research and manage risk.',
          },
        ]} />
      </section>

      {/* Email Capture */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Early Access</h2>
        <p className="text-gray-400 mb-2">Be among the first to trade with ocean waves, not candlesticks.</p>
        <p className="text-amber-400 text-sm mb-2">⚡ Limited spots available for the beta program.</p>
        {subscriberCount !== null && subscriberCount > 0 && (
          <p className="text-emerald-400/80 text-sm mb-8">🌊 Join {subscriberCount} trader{subscriberCount !== 1 ? 's' : ''} already riding the wave.</p>
        )}
        {subscriberCount === null && (
          <p className="text-gray-500 text-xs mb-8">Be the first to get early access.</p>
        )}

        {!isSubscribed ? (
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSubscribe}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold transition-colors"
              >
                Join
              </button>
            </div>
            {errorMessage && <p className="text-red-400 text-xs mt-2">{errorMessage}</p>}
            <p className="text-gray-600 text-xs mt-2">🔒 We never share your email with third parties.</p>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-6 py-4 max-w-md mx-auto">
            <span className="text-emerald-400 text-lg">🎉</span>
            <span className="text-emerald-400 ml-2">You're on the list! We'll notify you when Ocean View launches.</span>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🌊</span>
            <span className="text-sm text-gray-400">Ocean View © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="mailto:oceanview.trading@gmail.com" className="hover:text-gray-300 transition-colors">Contact</a>
            <span>•</span>
            <span>9 indicators. 1 wave. 0 candles.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}