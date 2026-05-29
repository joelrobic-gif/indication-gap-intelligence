"use client";
// ═══ GAP COMPUTATION HOOK ═══
// Extracts the heavy useMemo gap computation from the monolith.
// Memoizes on [company, homeCountry] — only recomputes when these change.

import { useMemo } from "react";
import { scoreGap } from "../lib/scoring";
import { generateIndicationData } from "../lib/data/indications";

/**
 * Compute all indication gaps for a company + homeCountry.
 * Returns gaps sorted by composite score descending.
 */
export function useGaps(selectedCompany, homeCountry) {
  return useMemo(() => {
    if (!selectedCompany || !homeCountry) return [];
    const allGaps = [];
    selectedCompany.molecules.forEach(mol => {
      generateIndicationData(mol).forEach(ind => {
        const gap = scoreGap(ind, homeCountry, mol);
        if (gap) allGaps.push(gap);
      });
    });
    return allGaps.sort((a, b) => b.scores.composite - a.scores.composite);
  }, [selectedCompany, homeCountry]);
}

/**
 * Filter and sort a gaps array.
 */
export function useProcessedGaps(gaps, { filterViability, showWatchlistOnly, watchlist, searchQuery, sortBy }) {
  return useMemo(() => {
    let result = gaps;
    if (filterViability && filterViability !== "all") {
      result = result.filter(g => g.viability === filterViability);
    }
    if (showWatchlistOnly) {
      result = result.filter(g => watchlist.includes(g.id));
    }
    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.molecule.toLowerCase().includes(q) ||
        g.indication.toLowerCase().includes(q) ||
        g.moleculeClass.toLowerCase().includes(q) ||
        (g.ta || "").toLowerCase().includes(q) ||
        g.evidence.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "composite":   return b.scores.composite   - a.scores.composite;
        case "evidence":    return b.scores.evidence    - a.scores.evidence;
        case "breadth":     return b.scores.breadth     - a.scores.breadth;
        case "ptrs":        return b.ptrs.ptrs          - a.ptrs.ptrs;
        case "competitive": return b.competitiveScore   - a.competitiveScore;
        case "unmet":       return b.scores.unmet       - a.scores.unmet;
        case "molecule":    return a.molecule.localeCompare(b.molecule);
        default:            return b.scores.composite   - a.scores.composite;
      }
    });
  }, [gaps, filterViability, showWatchlistOnly, watchlist, searchQuery, sortBy]);
}

/**
 * Portfolio-level aggregate stats.
 */
export function usePortfolioStats(gaps) {
  return useMemo(() => {
    if (!gaps.length) return null;
    const excellent = gaps.filter(g => g.viability === "excellent").length;
    const strong    = gaps.filter(g => g.viability === "strong").length;
    const moderate  = gaps.filter(g => g.viability === "moderate").length;
    const low       = gaps.filter(g => g.viability === "low").length;
    const avgPTRS   = gaps.reduce((s, g) => s + g.ptrs.ptrs, 0) / gaps.length;
    const avgComposite = gaps.reduce((s, g) => s + g.scores.composite, 0) / gaps.length;

    const taDistribution = {};
    gaps.forEach(g => { taDistribution[g.ta] = (taDistribution[g.ta] || 0) + 1; });
    const topTA = Object.entries(taDistribution).sort((a, b) => b[1] - a[1]);

    const whitespace = gaps.filter(g => g.competitors.length === 0).length;
    const phaseDistribution = { "Phase II": 0, "Phase III": 0, "Approved": 0 };
    gaps.forEach(g => {
      if (g.evidence.includes("Phase III"))            phaseDistribution["Phase III"]++;
      else if (g.evidence.includes("Phase II"))        phaseDistribution["Phase II"]++;
      else if (g.ptrs.phase === "Approved")            phaseDistribution["Approved"]++;
    });

    return {
      total: gaps.length, excellent, strong, moderate, low,
      avgPTRS, avgComposite,
      taDistribution, topTA,
      whitespace,
      phaseDistribution,
    };
  }, [gaps]);
}
