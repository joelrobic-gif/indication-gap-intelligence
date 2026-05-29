"use client";
// ═══ AUTONOMOUS ENGINE ═══
// The swarm that never sleeps. It walks the entire drug universe (Pharmascience
// first), pushes each molecule through all 7 departments, and emits a live
// activity feed + per-department "currently viewing" state.
//
// • Needs ZERO human input — if nobody touches it for weeks it keeps scanning,
//   looping the universe over and over (each loop = a fresh monitoring cycle).
// • Humans can jump in any time: pause, change speed, step one at a time, and
//   review / approve / flag / pin / annotate any business case. None of this is
//   required for progress — it's co-work, not a driver.
// • State persists to localStorage, so the swarm resumes where it left off.

import { useReducer, useEffect, useMemo, useRef, useCallback } from "react";
import { computeUniverse } from "../lib/data/universe";
import { DEPARTMENTS } from "../lib/engine/departments";
import { runFunnel, funnelTiers, buildBusinessCases } from "../lib/engine/funnel";

const STORAGE_KEY = "igi-engine-v4";
const FEED_CAP = 64;
const DEFAULT_SPEED = 1200;

function freshDeptStats() {
  return Object.fromEntries(DEPARTMENTS.map(d => [d.id, { processed: 0, current: null }]));
}

function initState() {
  return {
    running: true,
    speedMs: DEFAULT_SPEED,
    cursor: 0,
    cycles: 0,
    processedCount: 0,
    feed: [],
    deptStats: freshDeptStats(),
    humanActions: {},
    startedAt: null,
    hydrated: false,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, hydrated: true };

    case "TICK": {
      const { gap, stages, total } = action.payload;
      const deptStats = { ...state.deptStats };
      const strat = stages[stages.length - 1];
      for (const s of stages) {
        const prev = deptStats[s.dept] || { processed: 0 };
        deptStats[s.dept] = {
          processed: prev.processed + 1,
          current: {
            company: gap.companyName, companyId: gap.companyId, molecule: gap.molecule, indication: gap.indication,
            examined: s.examined, found: s.found, handoff: s.handoff, ok: s.ok,
          },
        };
      }
      const event = {
        id: `${action.payload.ts}-${state.cursor}`,
        ts: action.payload.ts,
        company: gap.companyName,
        companyId: gap.companyId,
        molecule: gap.molecule,
        indication: gap.indication,
        action: strat.found,
        composite: gap.scores.composite,
        viability: gap.viability,
        viabilityLabel: gap.viabilityLabel,
        whitespace: gap.competitors.length === 0,
        moleculeKey: gap.moleculeKey,
      };
      const nextCursor = state.cursor + 1;
      const wrapped = nextCursor >= total;
      return {
        ...state,
        deptStats,
        feed: [event, ...state.feed].slice(0, FEED_CAP),
        cursor: wrapped ? 0 : nextCursor,
        cycles: wrapped ? state.cycles + 1 : state.cycles,
        processedCount: state.processedCount + 1,
        startedAt: state.startedAt || action.payload.ts,
      };
    }

    case "TOGGLE_RUN":   return { ...state, running: !state.running };
    case "SET_SPEED":    return { ...state, speedMs: action.payload };
    case "RESET":
      return { ...initState(), hydrated: true, humanActions: state.humanActions, startedAt: null };

    case "SET_STATUS": {
      const { key, status } = action.payload;
      const cur = state.humanActions[key] || {};
      return { ...state, humanActions: { ...state.humanActions, [key]: { ...cur, status: cur.status === status ? null : status } } };
    }
    case "SET_NOTE": {
      const { key, note } = action.payload;
      const cur = state.humanActions[key] || {};
      return { ...state, humanActions: { ...state.humanActions, [key]: { ...cur, note } } };
    }
    case "TOGGLE_PIN": {
      const { key } = action.payload;
      const cur = state.humanActions[key] || {};
      return { ...state, humanActions: { ...state.humanActions, [key]: { ...cur, pinnedAt: cur.pinnedAt ? null : action.payload.ts } } };
    }
    default: return state;
  }
}

export function useAutonomousEngine(homeCountry) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  // Universe + derived (stable across ticks — only recompute on inputs).
  const universe = useMemo(() => computeUniverse(homeCountry), [homeCountry]);
  const tiers = useMemo(() => funnelTiers(universe), [universe]);
  const cases = useMemo(
    () => buildBusinessCases(universe, homeCountry, state.humanActions),
    [universe, homeCountry, state.humanActions]
  );

  const universeRef = useRef(universe);
  universeRef.current = universe;
  const cursorRef = useRef(state.cursor);
  cursorRef.current = state.cursor;

  // ── Hydrate from localStorage once ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: {
          running: saved.running ?? true,
          speedMs: saved.speedMs ?? DEFAULT_SPEED,
          cycles: saved.cycles ?? 0,
          processedCount: saved.processedCount ?? 0,
          feed: saved.feed ?? [],
          deptStats: saved.deptStats ?? freshDeptStats(),
          humanActions: saved.humanActions ?? {},
          startedAt: saved.startedAt ?? null,
          cursor: saved.cursor ?? 0,
        }});
      } else {
        dispatch({ type: "HYDRATE", payload: {} });
      }
    } catch { dispatch({ type: "HYDRATE", payload: {} }); }
  }, []);

  // ── Persist ──
  useEffect(() => {
    if (typeof window === "undefined" || !state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        running: state.running, speedMs: state.speedMs, cycles: state.cycles,
        processedCount: state.processedCount, feed: state.feed, deptStats: state.deptStats,
        humanActions: state.humanActions, startedAt: state.startedAt, cursor: state.cursor,
      }));
    } catch { /* quota — ignore */ }
  }, [state.running, state.speedMs, state.cycles, state.processedCount, state.feed, state.deptStats, state.humanActions, state.startedAt, state.cursor, state.hydrated]);

  // ── The tick ──
  const tick = useCallback(() => {
    const u = universeRef.current;
    if (!u.gaps.length) return;
    const idx = cursorRef.current % u.gaps.length;
    const gap = u.gaps[idx];
    const stages = runFunnel(gap, homeCountry);
    dispatch({ type: "TICK", payload: { gap, stages, total: u.gaps.length, ts: Date.now() } });
  }, [homeCountry]);

  // ── Heartbeat ──
  useEffect(() => {
    if (!state.hydrated || !state.running) return;
    const h = setInterval(tick, state.speedMs);
    return () => clearInterval(h);
  }, [state.hydrated, state.running, state.speedMs, tick]);

  // ── Controls / co-work ──
  const controls = useMemo(() => ({
    toggleRun: () => dispatch({ type: "TOGGLE_RUN" }),
    setSpeed: (ms) => dispatch({ type: "SET_SPEED", payload: ms }),
    reset: () => dispatch({ type: "RESET" }),
    stepOnce: () => tick(),
    setStatus: (key, status) => dispatch({ type: "SET_STATUS", payload: { key, status } }),
    setNote: (key, note) => dispatch({ type: "SET_NOTE", payload: { key, note } }),
    togglePin: (key) => dispatch({ type: "TOGGLE_PIN", payload: { key, ts: Date.now() } }),
  }), [tick]);

  return {
    universe, tiers, cases,
    running: state.running, speedMs: state.speedMs,
    cycles: state.cycles, processedCount: state.processedCount,
    feed: state.feed, deptStats: state.deptStats, startedAt: state.startedAt,
    hydrated: state.hydrated,
    ...controls,
  };
}
