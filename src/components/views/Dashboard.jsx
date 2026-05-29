"use client";
// ═══ DASHBOARD VIEW ═══
// Gap card grid. Primary discovery surface.
// Each card: composite score (large), viability tag, PTRS ring, score bars,
// watchlist star, compare toggle, evidence tag, approved-in count.

import { memo } from "react";
import { PTRSRing } from "../primitives/PTRSRing";
import { viabilityColor } from "../primitives/tokens";

export function Dashboard({
  gaps, allGaps, sortBy, onSortChange, filterViability, onFilterChange,
  showWatchlistOnly, onToggleWatchlist, watchlistCount,
  isWatched, onToggleWatchlistItem,
  isInCompare, onToggleCompare, compareCount,
  onOpenGap, homeCountry, portfolioStats,
}) {
  const SORT_OPTIONS = [
    { v: "composite",   l: "Composite" },
    { v: "evidence",    l: "Evidence" },
    { v: "ptrs",        l: "PTRS" },
    { v: "breadth",     l: "Breadth" },
    { v: "unmet",       l: "Unmet Need" },
    { v: "competitive", l: "Whitespace" },
    { v: "molecule",    l: "Molecule" },
  ];

  const FILTER_OPTIONS = [
    { v: "all",      l: "All" },
    { v: "excellent",l: "Excellent" },
    { v: "strong",   l: "Strong" },
    { v: "moderate", l: "Moderate" },
    { v: "low",      l: "Low" },
  ];

  return (
    <div style={{ padding: "var(--space-5)" }}>
      {/* ── Portfolio KPIs ── */}
      {portfolioStats && (
        <KPIStrip stats={portfolioStats} />
      )}

      {/* ── Toolbar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-3)",
        flexWrap: "wrap", marginBottom: "var(--space-5)",
      }}>
        {/* Result count */}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
          {gaps.length} GAPS
        </span>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1 }}>SORT</span>
          <select value={sortBy} onChange={e => onSortChange(e.target.value)} style={controlStyle}>
            {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>

        {/* Filter viability */}
        <div style={{ display: "flex", gap: 2 }}>
          {FILTER_OPTIONS.map(o => {
            const active = filterViability === o.v;
            const color = o.v === "all" ? "var(--text-secondary)" : `var(--viability-${o.v})`;
            return (
              <button
                key={o.v}
                onClick={() => onFilterChange(o.v)}
                style={{
                  background: active ? `${color}18` : "transparent",
                  border: `1px solid ${active ? color : "var(--surface-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "3px 9px",
                  color: active ? color : "var(--text-tertiary)",
                  fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 0.5, cursor: "pointer",
                  transition: "all var(--duration-fast)",
                }}
              >
                {o.l}
              </button>
            );
          })}
        </div>

        {/* Watchlist toggle */}
        <button
          onClick={onToggleWatchlist}
          style={{
            background: showWatchlistOnly ? "rgba(212,168,83,0.12)" : "transparent",
            border: `1px solid ${showWatchlistOnly ? "var(--brand-gold)" : "var(--surface-border)"}`,
            borderRadius: "var(--radius-sm)", padding: "3px 9px",
            color: showWatchlistOnly ? "var(--brand-gold)" : "var(--text-tertiary)",
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 0.5, cursor: "pointer",
          }}
        >
          ★ {watchlistCount > 0 ? watchlistCount : "Watchlist"}
        </button>

        {/* Compare badge */}
        {compareCount > 0 && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 0.5,
            color: "var(--entity-1)", border: "1px solid var(--entity-1)",
            borderRadius: "var(--radius-sm)", padding: "3px 9px",
          }}>
            {compareCount}/5 in compare
          </div>
        )}
      </div>

      {/* ── Gap grid ── */}
      {gaps.length === 0 ? (
        <EmptyFiltered />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "var(--space-4)",
        }}>
          {gaps.map((gap, idx) => (
            <GapCard
              key={gap.id}
              gap={gap}
              isWatched={isWatched(gap.id)}
              onToggleWatch={() => onToggleWatchlistItem(gap.id)}
              inCompare={isInCompare(gap.id)}
              onToggleCompare={() => onToggleCompare(gap)}
              compareCount={compareCount}
              onClick={() => onOpenGap(gap)}
              entryDelay={idx < 24 ? idx * 20 : 0} // stagger first 24 cards
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Portfolio KPI strip ──
function KPIStrip({ stats }) {
  const kpis = [
    { label: "Total Gaps",    value: stats.total,                              unit: "" },
    { label: "Excellent",     value: stats.excellent,                          unit: "", color: "var(--viability-excellent)" },
    { label: "Strong",        value: stats.strong,                             unit: "", color: "var(--viability-strong)" },
    { label: "Avg PTRS",      value: `${Math.round(stats.avgPTRS * 100)}%`,   unit: "", mono: true },
    { label: "Avg Score",     value: Math.round(stats.avgComposite),           unit: "/99", mono: true },
    { label: "Whitespace",    value: stats.whitespace,                         unit: " gaps", color: "var(--viability-excellent)" },
  ];

  return (
    <div style={{
      display: "flex", gap: "var(--space-4)", flexWrap: "wrap",
      marginBottom: "var(--space-5)", paddingBottom: "var(--space-5)",
      borderBottom: "1px solid var(--surface-border-subtle)",
    }}>
      {kpis.map(kpi => (
        <div key={kpi.label} style={{ minWidth: 80 }}>
          <div style={{
            fontFamily: kpi.mono ? "var(--font-mono)" : "var(--font-display)",
            fontSize: kpi.mono ? "var(--text-2xl)" : "var(--text-2xl)",
            fontWeight: 700, color: kpi.color || "var(--text-primary)",
            fontVariantNumeric: "tabular-nums", lineHeight: 1,
            fontOpticalSizing: kpi.mono ? "normal" : "auto",
          }}>
            {kpi.value}<span style={{ fontSize: "var(--text-sm)", fontWeight: 400, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{kpi.unit}</span>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)",
            letterSpacing: 1, textTransform: "uppercase", marginTop: 4,
          }}>
            {kpi.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Gap card ──
const GapCard = memo(function GapCard({ gap, isWatched, onToggleWatch, inCompare, onToggleCompare, compareCount, onClick, entryDelay }) {
  const vColor = `var(--viability-${gap.viability})`;
  const ptrs   = Math.round(gap.ptrs.ptrs * 100);

  return (
    <article
      onClick={onClick}
      style={{
        background: "var(--surface-raised)",
        border: `1px solid ${inCompare ? "var(--entity-1)" : "var(--surface-border)"}`,
        borderLeft: `3px solid ${vColor}`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        cursor: "pointer",
        transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
        animation: entryDelay > 0 ? `fadeIn var(--duration-standard) var(--ease-out) ${entryDelay}ms both` : "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; e.currentTarget.style.borderColor = inCompare ? "var(--entity-1)" : "var(--surface-border)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
      role="button"
      tabIndex={0}
      aria-label={`${gap.indication} — ${gap.molecule}, composite score ${gap.scores.composite}`}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-3)" }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: "var(--space-2)" }}>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: 600,
            color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 4,
          }}>
            {gap.indication}
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
              {gap.molecule}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>·</span>
            <EvidenceTag evidence={gap.evidence} />
          </div>
        </div>

        {/* PTRS ring */}
        <PTRSRing ptrs={gap.ptrs.ptrs} color={vColor} size={44} />
      </div>

      {/* Composite score bar */}
      <div style={{ marginBottom: "var(--space-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1 }}>COMPOSITE</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700,
            color: vColor, fontVariantNumeric: "tabular-nums",
          }}>
            {gap.scores.composite}
          </span>
        </div>
        <div style={{ height: 4, background: "var(--surface-border)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            width: `${gap.scores.composite}%`, height: "100%", background: vColor,
            borderRadius: 2, transition: "width 0.5s var(--ease-out)",
          }} />
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {/* Approved-in count */}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-secondary)" }}>
            {gap.approvedIn.length} countries
          </span>
          {/* Whitespace indicator */}
          {gap.competitors.length === 0 && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--viability-excellent)",
              border: "1px solid var(--viability-excellent)30",
              padding: "1px 5px", borderRadius: 2,
              background: "rgba(52,211,153,0.08)",
              letterSpacing: 0.5,
            }}>
              WHITESPACE
            </span>
          )}
          {/* Viability tag */}
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 8, color: vColor,
            background: `${vColor}12`, border: `1px solid ${vColor}30`,
            padding: "1px 5px", borderRadius: 2, letterSpacing: 0.5, textTransform: "uppercase",
          }}>
            {gap.viabilityLabel}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--space-1)", alignItems: "center" }} onClick={e => e.stopPropagation()}>
          {/* Watchlist */}
          <button
            onClick={onToggleWatch}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
              color: isWatched ? "var(--brand-gold)" : "var(--surface-border)",
              fontSize: 15, lineHeight: 1,
              transition: "color var(--duration-fast)",
            }}
            title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
            aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isWatched ? "★" : "☆"}
          </button>

          {/* Compare toggle */}
          <button
            onClick={onToggleCompare}
            disabled={!inCompare && compareCount >= 5}
            style={{
              background: inCompare ? "rgba(26,127,193,0.15)" : "none",
              border: `1px solid ${inCompare ? "var(--entity-1)" : "var(--surface-border)"}`,
              borderRadius: "var(--radius-sm)", padding: "2px 7px", cursor: "pointer",
              color: inCompare ? "var(--entity-1)" : "var(--text-tertiary)",
              fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 0.5,
              transition: "all var(--duration-fast)",
              opacity: !inCompare && compareCount >= 5 ? 0.3 : 1,
            }}
            title={inCompare ? "Remove from comparison" : "Add to comparison (5-up)"}
            aria-label={inCompare ? "Remove from comparison" : "Add to comparison"}
          >
            {inCompare ? "⊖ COMPARE" : "⊕ COMPARE"}
          </button>
        </div>
      </div>
    </article>
  );
});

function EvidenceTag({ evidence }) {
  const color = evidence.includes("Phase III") || evidence.includes("IV") ? "var(--viability-excellent)"
    : evidence.includes("Phase II") ? "var(--viability-strong)"
    : evidence.includes("Phase I") ? "var(--viability-moderate)"
    : "var(--text-tertiary)";
  const label = evidence.includes("Phase IV") ? "Ph IV"
    : evidence.includes("Phase III") ? "Ph III"
    : evidence.includes("Phase II") ? "Ph II"
    : evidence.includes("Phase I") ? "Ph I"
    : "Pre";
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color, letterSpacing: 0.5 }}>{label}</span>
  );
}

function EmptyFiltered() {
  return (
    <div style={{ padding: "var(--space-12)", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
        No gaps match the current filters.
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
        Try changing the viability filter or clearing the search.
      </div>
    </div>
  );
}

const controlStyle = {
  background: "var(--surface-base)", border: "1px solid var(--surface-border)",
  borderRadius: "var(--radius-sm)", padding: "4px 8px",
  color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: 10,
  outline: "none", cursor: "pointer",
};
