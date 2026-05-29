"use client";
// ═══ 5-UP INDICATION COMPARATOR ═══
// The hero surface. Column-equality grid — Bloomberg-for-pharma.
// Every metric on the same row. Every column the same width.
// Aligned sparklines, PTRS gauges, score dimensions, competitive density.
// Up to 5 indications side-by-side.
// Entity colors: Okabe-Ito from CSS custom properties.

import { useCallback, useRef } from "react";
import { PTRSRing } from "../primitives/PTRSRing";

const COL_WIDTH = 220;
const LABEL_WIDTH = 140;

// Stable Okabe-Ito entity assignment — first slot gets entity-1, etc.
const ENTITY_VARS = [
  "var(--entity-1)", "var(--entity-2)", "var(--entity-3)",
  "var(--entity-4)", "var(--entity-5)",
];

export function Comparator({ selection, onRemove, onOpen, allGaps }) {
  // selection: Gap[] (up to 5)
  const empty = selection.length === 0;

  return (
    <div style={{ padding: "var(--space-6)", minHeight: "calc(100vh - 52px)", overflowX: "auto" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700,
          color: "var(--text-primary)", fontOpticalSizing: "auto",
        }}>
          Indication Comparator
        </h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-secondary)", letterSpacing: 1 }}>
          {selection.length}/5 SELECTED
        </span>
        {selection.length > 0 && (
          <button onClick={() => selection.forEach(g => onRemove(g.id))} style={{
            marginLeft: "auto", background: "none", border: "1px solid var(--surface-border)",
            borderRadius: "var(--radius-sm)", padding: "3px 10px", color: "var(--text-secondary)",
            fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", cursor: "pointer",
          }}>
            Clear all
          </button>
        )}
      </div>

      {empty ? (
        <EmptyState allGaps={allGaps} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: LABEL_WIDTH + COL_WIDTH * selection.length }}>
          {/* Column headers */}
          <ColumnHeaders selection={selection} onRemove={onRemove} />

          {/* ── Metric rows ── */}
          <MetricSection label="COMPOSITE SCORE">
            {selection.map((gap, i) => (
              <CompositeCell key={gap.id} gap={gap} color={ENTITY_VARS[i]} />
            ))}
          </MetricSection>

          <MetricSection label="PTRS">
            {selection.map((gap, i) => (
              <PTRSCell key={gap.id} gap={gap} color={ENTITY_VARS[i]} />
            ))}
          </MetricSection>

          <MetricSection label="SCORE BREAKDOWN" tall>
            {selection.map((gap, i) => (
              <DimensionsCell key={gap.id} gap={gap} color={ENTITY_VARS[i]} />
            ))}
          </MetricSection>

          <MetricSection label="EVIDENCE">
            {selection.map((gap) => (
              <TextCell key={gap.id} value={gap.evidence} mono />
            ))}
          </MetricSection>

          <MetricSection label="PATIENT POPULATION">
            {selection.map((gap) => (
              <TextCell key={gap.id} value={gap.patientPop} mono large />
            ))}
          </MetricSection>

          <MetricSection label="UNMET NEED">
            {selection.map((gap) => (
              <UnmetCell key={gap.id} gap={gap} />
            ))}
          </MetricSection>

          <MetricSection label="COMPETITIVE DENSITY" tall>
            <CompetitorHeader count={Math.max(...selection.map(g => g.competitors.length))} />
            {selection.map((gap, i) => (
              <CompetitorsCell key={gap.id} gap={gap} color={ENTITY_VARS[i]} />
            ))}
          </MetricSection>

          <MetricSection label="APPROVED IN">
            {selection.map((gap) => (
              <ApprovedCell key={gap.id} gap={gap} />
            ))}
          </MetricSection>

          <MetricSection label="VIABILITY">
            {selection.map((gap) => (
              <ViabilityCell key={gap.id} gap={gap} />
            ))}
          </MetricSection>

          {/* ── Actions row ── */}
          <div style={{ display: "flex", marginTop: "var(--space-4)" }}>
            <div style={{ width: LABEL_WIDTH, flexShrink: 0 }} />
            {selection.map((gap) => (
              <div key={gap.id} style={{ width: COL_WIDTH, flexShrink: 0, padding: "0 var(--space-3)" }}>
                <button
                  onClick={() => onOpen(gap)}
                  style={{
                    width: "100%", padding: "9px 0", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--brand-gold)", background: "var(--brand-gold-dim)",
                    color: "var(--brand-gold)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                    letterSpacing: 1, cursor: "pointer", transition: "background var(--duration-fast) var(--ease-standard)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--brand-gold-mid)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--brand-gold-dim)"; }}
                >
                  RUN L99 ANALYSIS →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Column headers ──
function ColumnHeaders({ selection, onRemove }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--surface-border)", paddingBottom: "var(--space-4)", marginBottom: 0 }}>
      {/* Label column */}
      <div style={{ width: LABEL_WIDTH, flexShrink: 0 }} />
      {/* Entity columns */}
      {selection.map((gap, i) => (
        <div key={gap.id} style={{
          width: COL_WIDTH, flexShrink: 0, padding: "0 var(--space-3)",
          borderLeft: `2px solid ${ENTITY_VARS[i]}`,
          animation: `slideIn var(--duration-enter) var(--ease-spring)`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{
                fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600,
                color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "var(--space-1)",
              }}>
                {gap.indication}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-secondary)", letterSpacing: 0.5 }}>
                {gap.molecule}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5, marginTop: 2 }}>
                {gap.atc || gap.moleculeClass}
              </div>
            </div>
            <button
              onClick={() => onRemove(gap.id)}
              style={{
                background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)",
                fontSize: 16, lineHeight: 1, padding: "2px 4px", marginTop: -2, flexShrink: 0,
              }}
              title="Remove from comparison"
              aria-label={`Remove ${gap.indication}`}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Metric row wrapper ──
function MetricSection({ label, children, tall = false }) {
  return (
    <div style={{
      display: "flex",
      borderBottom: "1px solid var(--surface-border-subtle)",
      minHeight: tall ? 120 : 64,
    }}>
      {/* Row label */}
      <div style={{
        width: LABEL_WIDTH, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "var(--space-3) var(--space-4) var(--space-3) 0",
        fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)",
        letterSpacing: 1, textTransform: "uppercase",
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Cell primitives ──
function Cell({ children, style = {} }) {
  return (
    <div style={{
      width: COL_WIDTH, flexShrink: 0, display: "flex", alignItems: "center",
      padding: "var(--space-3)", borderLeft: "1px solid var(--surface-border-subtle)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function TextCell({ value, mono, large }) {
  return (
    <Cell>
      <span style={{
        fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
        fontSize: large ? "var(--text-lg)" : "var(--text-sm)",
        fontVariantNumeric: "tabular-nums",
        color: "var(--text-primary)",
        fontWeight: large ? 700 : 400,
      }}>
        {value}
      </span>
    </Cell>
  );
}

function CompositeCell({ gap, color }) {
  const { composite } = gap.scores;
  return (
    <Cell style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: "var(--space-1)" }}>
      {/* Big number */}
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700,
        color, fontVariantNumeric: "tabular-nums", lineHeight: 1,
        fontOpticalSizing: "auto",
      }}>
        {composite}
      </div>
      {/* Progress bar */}
      <div style={{ width: "100%", height: 3, background: "var(--surface-border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${composite}%`, height: "100%",
          background: color,
          borderRadius: 2,
          transition: "width 0.6s var(--ease-out)",
        }} />
      </div>
    </Cell>
  );
}

function PTRSCell({ gap, color }) {
  const pct = Math.round(gap.ptrs.ptrs * 100);
  const [ciLow, ciHigh] = gap.ptrs.ci80 || [gap.ptrs.ptrs * 0.8, Math.min(gap.ptrs.ptrs * 1.2, 0.99)];
  return (
    <Cell style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--space-1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <PTRSRing ptrs={gap.ptrs.ptrs} color={color} size={48} />
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
            {gap.ptrs.phase}
          </div>
        </div>
      </div>
      {/* 80% CI ribbon */}
      <div style={{ width: "100%", position: "relative", height: 6, background: "var(--surface-border)", borderRadius: 3 }}>
        <div style={{
          position: "absolute",
          left: `${Math.round(ciLow * 100)}%`,
          width: `${Math.round((ciHigh - ciLow) * 100)}%`,
          height: "100%",
          background: color,
          opacity: 0.5,
          borderRadius: 3,
        }} />
        <div style={{
          position: "absolute",
          left: `${pct}%`,
          transform: "translateX(-50%)",
          width: 2,
          height: "100%",
          background: color,
          borderRadius: 1,
        }} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>
        80% CI: {Math.round(ciLow * 100)}–{Math.round(ciHigh * 100)}%
      </div>
    </Cell>
  );
}

function DimensionsCell({ gap, color }) {
  const dims = [
    { key: "evidence",    label: "Evidence",   value: gap.scores.evidence },
    { key: "breadth",     label: "Breadth",    value: gap.scores.breadth },
    { key: "regulatory",  label: "Regulatory", value: gap.scores.regulatory },
    { key: "commercial",  label: "Commercial", value: gap.scores.commercial },
    { key: "unmet",       label: "Unmet Need", value: gap.scores.unmet },
  ];
  return (
    <Cell style={{ flexDirection: "column", alignItems: "stretch", justifyContent: "center", padding: "var(--space-3)" }}>
      {dims.map(d => (
        <div key={d.key} style={{ marginBottom: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5, textTransform: "uppercase" }}>{d.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color, fontVariantNumeric: "tabular-nums" }}>{d.value}</span>
          </div>
          <div style={{ height: 3, background: "var(--surface-border)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              width: `${d.value}%`, height: "100%", background: color, opacity: 0.75, borderRadius: 2,
              transition: "width 0.5s var(--ease-out)",
            }} />
          </div>
        </div>
      ))}
    </Cell>
  );
}

function UnmetCell({ gap }) {
  const unmet = gap.unmetNeed;
  if (!unmet) return <TextCell value="—" />;
  const scoreColor = unmet.score >= 80 ? "var(--viability-excellent)"
    : unmet.score >= 65 ? "var(--viability-strong)"
    : unmet.score >= 50 ? "var(--viability-moderate)"
    : "var(--text-secondary)";
  return (
    <Cell style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--space-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)", fontWeight: 700, color: scoreColor, fontVariantNumeric: "tabular-nums" }}>
        {unmet.score}<span style={{ fontSize: 10, fontWeight: 400, color: "var(--text-tertiary)" }}>/100</span>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.4 }}>
        {unmet.gaps}
      </div>
    </Cell>
  );
}

function CompetitorHeader() { return null; } // placeholder — row width handled by MetricSection

function CompetitorsCell({ gap, color }) {
  const n = gap.competitors.length;
  return (
    <Cell style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--space-1)" }}>
      {n === 0 ? (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--viability-excellent)", fontWeight: 700 }}>
          WHITESPACE ✓
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {n} competitor{n !== 1 ? "s" : ""}
          </div>
          {gap.competitors.slice(0, 3).map((c, i) => (
            <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--text-secondary)", display: "flex", gap: 4, alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", minWidth: 60 }}>{c.phase}</span>
              {c.company} · {c.molecule}
            </div>
          ))}
          {n > 3 && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>+{n - 3} more</div>
          )}
        </>
      )}
    </Cell>
  );
}

function ApprovedCell({ gap }) {
  const total = gap.approvedIn.length;
  return (
    <Cell style={{ flexDirection: "column", alignItems: "flex-start", gap: "var(--space-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
        {total} {total === 1 ? "country" : "countries"}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
        {gap.approvedIn.slice(0, 8).join(" · ")}{total > 8 ? ` · +${total - 8}` : ""}
      </div>
    </Cell>
  );
}

function ViabilityCell({ gap }) {
  const colorMap = {
    excellent: "var(--viability-excellent)",
    strong:    "var(--viability-strong)",
    moderate:  "var(--viability-moderate)",
    low:       "var(--viability-low)",
  };
  const color = colorMap[gap.viability] || "var(--text-secondary)";
  return (
    <Cell>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: 1,
        textTransform: "uppercase", fontWeight: 700,
        background: `${color}18`, color,
        padding: "3px 8px", borderRadius: "var(--radius-sm)",
        border: `1px solid ${color}30`,
      }}>
        {gap.viabilityLabel}
      </span>
    </Cell>
  );
}

// ── Empty state ──
function EmptyState({ allGaps }) {
  const top5 = allGaps ? allGaps.slice(0, 5) : [];
  return (
    <div style={{ maxWidth: 560, paddingTop: "var(--space-8)" }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", color: "var(--text-primary)", marginBottom: "var(--space-4)", fontOpticalSizing: "auto" }}>
        Select up to 5 indications to compare side-by-side.
      </p>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "var(--space-6)" }}>
        Use the compare toggle ( <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--brand-gold)" }}>⊕</code> ) on any gap card in the dashboard, or start from these top-ranked opportunities:
      </p>
      {top5.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {top5.map((gap, i) => {
            const entityColor = ENTITY_VARS[i];
            return (
              <div key={gap.id} style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                background: "var(--surface-raised)", borderRadius: "var(--radius-md)",
                border: "1px solid var(--surface-border)",
                borderLeft: `3px solid ${entityColor}`,
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: entityColor, fontWeight: 700, minWidth: 24, fontVariantNumeric: "tabular-nums" }}>{gap.scores.composite}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{gap.indication}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>{gap.molecule}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
