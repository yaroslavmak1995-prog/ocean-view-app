// Ocean View — Landing Page Component (React version)
// Portable from standalone-landing.html

import { useState, useEffect, useCallback } from 'react';
import type { DemoScenario } from '../../lib/types';
import { WaveChart } from '../wave/WaveChart';
import { SignalBadge } from '../signal/SignalBadge';
import { ConfidenceMeter } from '../signal/ConfidenceMeter';
import { FactorGrid } from '../factors/FactorGrid';
import { OceanMetaphor } from '../ocean/OceanMetaphor';
import { getDemoScenarios, getFactorBreakdown, getOceanMetaphor } from '../../lib/nonuple';

export function LandingPage() {
  const scenarios: DemoScenario[] = getDemoScenarios();
  const [activeScenario, setActiveScenario] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check localStorage for duplicate
    const stored = JSON.parse(localStorage.getItem('ov_subscribers') || '[]');
    if (stored.includes(email.toLowerCase())) {
      setEmailError('This email is already registered!');
      return;
    }

    // Try Formspree, fallback to mailto
    const formspreeEndpoint = 'https://formspree.io/f/xpwzgkdl';

    fetch(formspreeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'landing-react', interest: 'early-access' }),
    })
      .then(res => {
        if (res.ok) {
          setSubscribed(true);
          stored.push(email.toLowerCase());
          localStorage.setItem('ov_subscribers', JSON.stringify(stored));
        } else {
          // Fallback: mailto
          window.location.href = `mailto:oceanview.trading@gmail.com?subject=Early%20Access%20Request&body=Hi%2C%20I%27d%20like%20early%20access%20to%20Ocean%20View.%20My%20email%3A%20${encodeURIComponent(email)}`;
          setSubscribed(true);
        }
      })
      .catch(() => {
        // Fallback: mailto
        window.location.href = `mailto:oceanview.trading@gmail.com?subject=Early%20Access%20Request&body=Hi%2C%20I%27d%20like%20early%20access%20to%20Ocean%20View.%20My%20email%3A%20${encodeURIComponent(email)}`;
        setSubscribed(true);
      });
  }, [email]);

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
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          9 technical indicators fused into a single ocean wave. See market direction in 2 seconds — not 2 minutes.
        </p>

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

      {/* Email Capture */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Early Access</h2>
        <p className="text-gray-400 mb-8">Be among the first to trade with ocean waves, not candlesticks.</p>

        {!subscribed ? (
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
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
            {emailError && <p className="text-red-400 text-xs mt-2">{emailError}</p>}
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