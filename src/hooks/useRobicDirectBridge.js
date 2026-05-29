"use client";
// ═══ ROBICIDIRECT LIVE BRIDGE ═══
// Fetches live gap + molecule data from RobicDirect Express API.
// Falls back to null (stale data badge shown in UI) if RobicDirect is offline.
// SWR refreshes every 5 minutes — aligns with RobicDirect agent cadence.

import useSWR from "swr";

const RD_BASE = process.env.NEXT_PUBLIC_ROBICIDIRECT_URL || "http://localhost:3003";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 min

async function fetcher(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`RobicDirect API error: ${res.status}`);
  return res.json();
}

/**
 * Returns live gap data from RobicDirect for a given company's molecule IDs.
 * moleculeIds: string[] (RobicDirect molecule IDs, e.g. ["mol-metformin"])
 * homeCountry: "CA" | "US" | etc.
 */
export function useRDGaps({ moleculeIds = [], homeCountry = "CA", enabled = true } = {}) {
  const params = new URLSearchParams({ country: homeCountry, limit: "200" });
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? `${RD_BASE}/api/gaps?${params}` : null,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL, revalidateOnFocus: false }
  );

  // Filter to the specific molecules if IDs provided
  const filtered = data && moleculeIds.length > 0
    ? data.filter(g => moleculeIds.includes(g.moleculeId))
    : data;

  return {
    gaps: filtered || null,
    isLoading,
    isOffline: !!error,
    error,
    refresh: mutate,
    dataAge: data ? new Date() : null, // approximation
  };
}

/**
 * Returns live portfolio summary from RobicDirect.
 */
export function useRDPortfolio() {
  const { data, error, isLoading } = useSWR(
    `${RD_BASE}/api/portfolio`,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL, revalidateOnFocus: false }
  );
  return { portfolio: data || null, isLoading, isOffline: !!error };
}

/**
 * Returns live country market values from RobicDirect.
 */
export function useRDCountries() {
  const { data, error, isLoading } = useSWR(
    `${RD_BASE}/api/countries`,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL, revalidateOnFocus: false }
  );
  return { countries: data?.countries || null, isLoading, isOffline: !!error };
}

/**
 * Returns RobicDirect status — used to show the bridge health badge.
 */
export function useRDStatus() {
  const { data, error, isLoading } = useSWR(
    `${RD_BASE}/api/status`,
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: true }
  );
  return {
    status: data || null,
    online: !error && !isLoading,
    isLoading,
    error,
  };
}
