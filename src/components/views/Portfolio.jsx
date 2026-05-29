"use client";
// ═══ PORTFOLIO VIEW ═══
// Aggregate analytics for the selected company's indication gaps.
// Phase 6: TA distribution replaced with Observable Plot treemap (d3-hierarchy layout → Plot.rect).

import { useEffect, useRef, useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { hierarchy, treemap as d3Treemap } from "d3-hierarchy";
import { SEQ_SCALE, SURFACE, TEXT } from "../primitives/tokens";

// ── TaTreemap ─────────────────────────────────────────────────────────────────
// Renders a squarified treemap using d3-hierarchy for layout and Plot.rect/text
// for rendering. Area = gap count; fill = avg composite score (SEQ_SCALE).
function TaTreemap({ taData }) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || taData.length === 0) return;

    const W = container.offsetWidth || 440;
    const H = 280;

    // Build hierarchy and apply treemap layout (squarify is the default tile).
    const root = hierarchy({ children: taData })
      .sum(d => d.count ?? 0)
      .sort((a, b) => b.value - a.value);

    d3Treemap()
      .size([W, H])
      .paddingInner(3)
      .paddingOuter(1)(root);

    // d3 treemap: y=0 at top. Plot's quantitative y scale: y=0 at bottom (range [H,0]).
    // Flip: plot_y = H - treemap_y so cells render top-down correctly.
    const leaves = root.leaves().map(d => {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      return {
        ta: d.data.ta,
        count: d.data.count,
        avgScore: d.data.avgScore,
        x1: d.x0,
        x2: d.x1,
        y1: H - d.y1,  // plot lower-bound (domain) = treemap bottom, flipped
        y2: H - d.y0,  // plot upper-bound (domain) = treemap top, flipped
        cx: (d.x0 + d.x1) / 2,
        cy: H - (d.y0 + d.y1) / 2, // center in flipped domain
        w,
        h,
      };
    });

    const bigLeaves   = leaves.filter(d => d.w > 44 && d.h > 20);
    const biggerLeaves = leaves.filter(d => d.w > 80 && d.h > 46);

    const plot = Plot.plot({
      width: W,
      height: H,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      x: { axis: null, domain: [0, W] },
      y: { axis: null, domain: [0, H] },
      color: {
        type: "linear",
        domain: [0, 100],
        range: SEQ_SCALE,
      },
      style: { background: "transparent", overflow: "visible" },
      marks: [
        // Rectangles — area encodes gap count, fill encodes avg composite score
        Plot.rect(leaves, {
          x1: "x1", y1: "y1", x2: "x2", y2: "y2",
          fill: "avgScore",
          stroke: SURFACE.base,
          strokeWidth: 2,
          title: d => `${d.ta}\n${d.count} gap${d.count !== 1 ? "s" : ""}\nAvg score: ${Math.round(d.avgScore)}/99`,
        }),

        // Large count label — visible in cells wide enough to hold a number
        Plot.text(biggerLeaves, {
          x: "cx",
          y: d => d.h > 54 ? d.cy - 10 : d.cy,
          text: d => String(d.count),
          fill: d => d.avgScore > 70 ? SURFACE.base : TEXT.primary,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          textAnchor: "middle",
          lineAnchor: "middle",
        }),

        // TA name label — truncated to fit cell width
        Plot.text(bigLeaves, {
          x: "cx",
          y: d => (d.w > 80 && d.h > 54) ? d.cy + 11 : d.cy,
          text: d => {
            const maxChars = Math.floor(d.w / 6);
            const label = d.ta.toUpperCase();
            return label.length > maxChars
              ? label.slice(0, Math.max(3, maxChars - 1)) + "…"
              : label;
          },
          fill: d => d.avgScore > 70 ? "rgba(8,8,13,0.65)" : TEXT.secondary,
          fontSize: 8,
          fontFamily: "var(--font-mono)",
          textAnchor: "middle",
          lineAnchor: "middle",
        }),
      ],
    });

    container.appendChild(plot);
    return () => plot.remove();
  }, [taData]);

  return <div ref={ref} style={{ width: "100%", lineHeight: 0 }} />;
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
export function Portfolio({ gaps, company, stats, homeCountry }) {
  if (!stats || gaps.length === 0) {
    return (
      <div style={{ padding: "var(--space-8)", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
        No gap data available.
      </div>
    );
  }

  const { total, excellent, strong, moderate, avgPTRS, avgComposite, whitespace } = stats;
  const topGaps = [...gaps].slice(0, 10);

  // Compute TA groups: count + avg composite score — derived from gaps directly
  // so treemap color (avg score) stays in sync without extra stat props.
  const taData = useMemo(() => {
    const map = new Map();
    gaps.forEach(g => {
      const key = g.ta || "Other";
      if (!map.has(key)) map.set(key, { ta: key, count: 0, scoreSum: 0 });
      const d = map.get(key);
      d.count += 1;
      d.scoreSum += g.scores?.composite ?? 0;
    });
    return Array.from(map.values())
      .map(d => ({ ta: d.ta, count: d.count, avgScore: d.count > 0 ? d.scoreSum / d.count : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [gaps]);

  return (
    <div style={{ padding: "var(--space-6)", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", fontOpticalSizing: "auto" }}>
          Portfolio Overview
        </h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", letterSpacing: 1 }}>
          {company.name.toUpperCase()} · {total} GAPS
        </span>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
        {[
          { label: "Total Gaps",  value: total,                             color: "var(--text-primary)" },
          { label: "Excellent",   value: excellent,                         color: "var(--viability-excellent)" },
          { label: "Strong",      value: strong,                            color: "var(--viability-strong)" },
          { label: "Moderate",    value: moderate,                          color: "var(--viability-moderate)" },
          { label: "Whitespace",  value: whitespace,                        color: "var(--viability-excellent)" },
          { label: "Avg PTRS",    value: `${Math.round(avgPTRS * 100)}%`,   color: "var(--text-primary)", mono: true },
          { label: "Avg Score",   value: `${Math.round(avgComposite)}/99`,  color: "var(--text-primary)", mono: true },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: "var(--surface-raised)", border: "1px solid var(--surface-border)",
            borderRadius: "var(--radius-lg)", padding: "var(--space-4)",
          }}>
            <div style={{
              fontFamily: kpi.mono ? "var(--font-mono)" : "var(--font-display)",
              fontSize: "var(--text-2xl)", fontWeight: 700, color: kpi.color,
              fontVariantNumeric: "tabular-nums", lineHeight: 1,
              fontOpticalSizing: kpi.mono ? "normal" : "auto",
              marginBottom: "var(--space-2)",
            }}>
              {kpi.value}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase" }}>
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: treemap + top gaps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>

        {/* Therapeutic Area treemap */}
        <section>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
            By Therapeutic Area
          </h3>
          <TaTreemap taData={taData} />
          {/* Score color legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)" }}>0</span>
            <div style={{
              flex: 1, height: 5, borderRadius: 2,
              background: `linear-gradient(to right, ${SEQ_SCALE.join(", ")})`,
            }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)" }}>100</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", marginLeft: "var(--space-3)" }}>
              AVG SCORE
            </span>
          </div>
        </section>

        {/* Top 10 opportunities */}
        <section>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase", marginBottom: "var(--space-4)" }}>
            Top Opportunities
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {topGaps.map((gap, i) => {
              const vColor = `var(--viability-${gap.viability})`;
              return (
                <div key={gap.id} style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-2) var(--space-3)",
                  background: "var(--surface-raised)", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--surface-border-subtle)",
                  borderLeft: `3px solid ${vColor}`,
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)", minWidth: 18, fontVariantNumeric: "tabular-nums" }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {gap.indication}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>
                      {gap.molecule}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontWeight: 700, color: vColor, fontVariantNumeric: "tabular-nums" }}>
                    {gap.scores.composite}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
