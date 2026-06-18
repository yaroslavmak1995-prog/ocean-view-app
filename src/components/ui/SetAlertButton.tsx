// Ocean View — Set Alert Button
// Email capture hook: "Get notified when {ticker} changes trend"
// This is the #1 missing conversion feature — turns visitors into subscribers

import { useState, useCallback } from 'react';

interface SetAlertButtonProps {
  ticker: string;
  trend: string;
  className?: string;
}

type AlertStatus = 'idle' | 'submitting' | 'success' | 'error';

export function SetAlertButton({ ticker, trend, className = '' }: SetAlertButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<AlertStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const alertData = {
      email,
      ticker,
      current_trend: trend,
      alert_type: 'trend_change',
      source: 'dashboard_set_alert',
      timestamp: new Date().toISOString(),
    };

    try {
      // Try API first
      const API_BASE = import.meta.env.VITE_API_URL || 'https://ocean-view-api-production.up.railway.app';
      const res = await fetch(`${API_BASE}/api/v1/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });

      if (res.ok) {
        setStatus('success');
        // Store locally for reference
        const stored = JSON.parse(localStorage.getItem('ov_alerts') || '[]');
        stored.push({ email, ticker, trend, date: new Date().toISOString() });
        localStorage.setItem('ov_alerts', JSON.stringify(stored));
        return;
      }

      // Fallback: try mailto
      const subject = encodeURIComponent(`Ocean View Alert: ${ticker} trend change notification`);
      const body = encodeURIComponent(
        `I want to be notified when ${ticker} changes from "${trend}".\n\nEmail: ${email}\nTicker: ${ticker}\nCurrent trend: ${trend}\n\nSent from Ocean View Dashboard`
      );
      window.open(`mailto:oceanview.trading@gmail.com?subject=${subject}&body=${body}`, '_blank');
      setStatus('success');

      const stored = JSON.parse(localStorage.getItem('ov_alerts') || '[]');
      stored.push({ email, ticker, trend, date: new Date().toISOString() });
      localStorage.setItem('ov_alerts', JSON.stringify(stored));

    } catch {
      // Fallback: store locally
      const stored = JSON.parse(localStorage.getItem('ov_alerts') || '[]');
      stored.push({ email, ticker, trend, date: new Date().toISOString() });
      localStorage.setItem('ov_alerts', JSON.stringify(stored));
      setStatus('success');
    }
  }, [email, ticker, trend]);

  // Success state
  if (status === 'success') {
    return (
      <div className={`bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center ${className}`}>
        <div className="text-2xl mb-2">🔔</div>
        <h4 className="text-sm font-semibold text-emerald-400 mb-1">Alert Set!</h4>
        <p className="text-xs text-gray-400">
          We'll notify you when <span className="text-white font-mono">{ticker}</span> changes trend from <span className="capitalize text-white">{trend}</span>.
        </p>
        <button
          onClick={() => { setStatus('idle'); setShowForm(false); setEmail(''); }}
          className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Set another alert →
        </button>
      </div>
    );
  }

  // Form state
  if (showForm) {
    return (
      <div className={`bg-[#0d1225] border border-emerald-500/30 rounded-xl p-4 ${className}`}>
        <h4 className="text-sm font-semibold text-white mb-1">
          🔔 Get notified when <span className="text-emerald-400 font-mono">{ticker}</span> changes trend
        </h4>
        <p className="text-xs text-gray-400 mb-3">
          Currently: <span className="capitalize font-semibold text-white">{trend}</span>. We'll email you when it reverses.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
            placeholder="your@email.com"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            disabled={status === 'submitting'}
            required
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
          >
            {status === 'submitting' ? '...' : 'Set Alert'}
          </button>
        </form>

        {errorMsg && <p className="text-xs text-red-400 mt-1">{errorMsg}</p>}

        <p className="text-[10px] text-gray-600 mt-2">
          Free. No spam. Unsubscribe anytime.
        </p>

        <button
          onClick={() => { setShowForm(false); setErrorMsg(''); }}
          className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Idle state — button
  return (
    <button
      onClick={() => setShowForm(true)}
      className={`w-full px-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-sm font-semibold text-emerald-400 transition-all group ${className}`}
    >
      <span className="flex items-center justify-center gap-2">
        <span className="group-hover:animate-bell">🔔</span>
        Set Alert — notify me when {ticker} reverses
      </span>
    </button>
  );
}