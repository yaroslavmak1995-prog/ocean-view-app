// Ocean View — useSubscription Hook
// Handles email capture with 4-level fallback (API → Formspree → mailto → localStorage)

import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ocean-view-api-production.up.railway.app';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwzgkdl';
const STORAGE_KEY = 'ov_subscribers';

interface SubscriptionState {
  email: string;
  status: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage: string;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    email: '',
    status: 'idle',
    errorMessage: '',
  });

  // Check if email already subscribed
  const isAlreadySubscribed = useCallback((email: string): boolean => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return stored.some((e: string) => e.toLowerCase() === email.toLowerCase());
    } catch {
      return false;
    }
  }, []);

  // Save email to localStorage
  const saveLocally = useCallback((email: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      stored.push(email.toLowerCase());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Fallback: open mailto
  const fallbackToMailto = useCallback((email: string) => {
    const subject = encodeURIComponent('Early Access Request — Ocean View');
    const body = encodeURIComponent(
      `Hi, I'd like early access to Ocean View.\n\nEmail: ${email}\n\nSource: React Landing Page`
    );
    window.location.href = `mailto:oceanview.trading@gmail.com?subject=${subject}&body=${body}`;
  }, []);

  const subscribe = useCallback(async (email?: string) => {
    const emailToUse = email || state.email;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      setState(prev => ({ ...prev, errorMessage: 'Please enter a valid email address', status: 'error' }));
      return { success: false, message: 'Invalid email' };
    }

    // Check duplicate
    if (isAlreadySubscribed(emailToUse)) {
      setState(prev => ({ ...prev, errorMessage: 'This email is already registered!', status: 'error' }));
      return { success: false, message: 'Already subscribed' };
    }

    setState(prev => ({ ...prev, status: 'submitting', errorMessage: '' }));

    try {
      // Level 0: Try our API backend
      const apiRes = await fetch(`${API_BASE}/api/v1/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          source: 'landing-react',
          interest: 'early-access',
        }),
      });

      if (apiRes.ok) {
        saveLocally(emailToUse);
        setState({ email: '', status: 'success', errorMessage: '' });
        return { success: true, message: 'Subscribed successfully!' };
      }

      // Level 1: Try Formspree
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          source: 'landing-react',
          interest: 'early-access',
        }),
      });

      if (res.ok) {
        saveLocally(emailToUse);
        setState({ email: '', status: 'success', errorMessage: '' });
        return { success: true, message: 'Subscribed successfully!' };
      }

      // Level 2: Fallback to mailto
      fallbackToMailto(emailToUse);
      saveLocally(emailToUse);
      setState({ email: '', status: 'success', errorMessage: '' });
      return { success: true, message: 'Email client opened — please send!' };
    } catch {
      // Level 2: Fallback to mailto
      fallbackToMailto(emailToUse);
      saveLocally(emailToUse);
      setState({ email: '', status: 'success', errorMessage: '' });
      return { success: true, message: 'Email client opened — please send!' };
    }
  }, [state.email, isAlreadySubscribed, saveLocally, fallbackToMailto]);

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email, errorMessage: '' }));
  }, []);

  const reset = useCallback(() => {
    setState({ email: '', status: 'idle', errorMessage: '' });
  }, []);

  return {
    email: state.email,
    status: state.status,
    errorMessage: state.errorMessage,
    setEmail,
    subscribe,
    reset,
    isSubscribed: state.status === 'success',
  };
}