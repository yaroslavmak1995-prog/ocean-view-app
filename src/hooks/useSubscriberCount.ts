// Ocean View — useSubscriberCount Hook
// Fetches subscriber count from API for social proof display

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ocean-view-api-production.up.railway.app';

export function useSubscriberCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCount() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/subscribers/count`);
        if (res.ok && mounted) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch {
        // Silently fail — social proof is nice-to-have
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchCount();
    // Refresh every 5 minutes
    const interval = setInterval(fetchCount, 5 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { count, loading };
}