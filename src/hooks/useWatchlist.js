"use client";
// ═══ WATCHLIST HOOK ═══
// Persists to localStorage (SSR-safe via hydration guard).

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "igi_watchlist_v2";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate after mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) setWatchlist(stored);
    } catch { /* ignore corrupt data */ }
    setHydrated(true);
  }, []);

  // Persist changes (skip the first render to avoid overwriting with empty)
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist, hydrated]);

  const toggle = useCallback((id) => {
    setWatchlist(prev =>
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  }, []);

  const has = useCallback((id) => watchlist.includes(id), [watchlist]);
  const clear = useCallback(() => setWatchlist([]), []);

  return { watchlist, toggle, has, clear, count: watchlist.length };
}
