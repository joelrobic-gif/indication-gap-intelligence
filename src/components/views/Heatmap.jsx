"use client";
// ═══ HEATMAP VIEW ═══
// Observable Plot-powered heatmap: indication × country, color = composite score.
// Phase 6 full build. Currently: interactive table with color-encoded cells.
// TODO Phase 6: swap to Plot.cell() with mark-based rendering.

import { useMemo } from "react";
import { COUNTRIES } from "../../lib/data/countries";
import { seqColor, SURFACE, TEXT } from "../primitives/tokens";

export function Heatmap({ gaps, company, homeCountry }) {
  // Group gaps by indication, collect country scores
  const matrix = useMemo(() => {
    const byInd = {};
    gaps.forEach(g => {
      if (!byInd[g.indication]) byInd[g.indication] = { indication: g.indication, molecule: g.molecule, scores: {} };
      byInd[g.indication].scores[g.notApprovedIn] = g.scores.composite;
    });
    return Object.values(byInd).sort((a, b) => {
      const aMax = Math.max(...Object.values(a.scores));
      const bMax = Math.max(...Object.values(b.scores));
      return bMax - aMax;
    }).slice(0, 30); // top 30 indications
  }, [gaps]);

  const displayCountries = COUNTRIES.slice(0, 12); // first 12 for legibility

  if (matrix.length === 0) {
    return (
      <div style={{ padding: "var(--space-8)", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
        No gap data to display.
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-6)", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", fontOpticalSizing: "auto" }}>
          Whitespace Heatmap
        </h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", letterSpacing: 1 }}>
          INDICATION × COUNTRY · COLOR = COMPOSITE SCORE
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>LOW</span>
        {[0, 20, 40, 60, 80, 100].map(v => (
          <div key={v} style={{ width: 28, height: 10, background: seqColor(v), borderRadius: 1 }} />
        ))}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>HIGH</span>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 200, textAlign: "left" }}>Indication</th>
            <th style={{ ...thStyle, width: 100, textAlign: "left" }}>Molecule</th>
            {displayCountries.map(c => (
              <th key={c.code} style={{ ...thStyle, width: 44, textAlign: "center" }}>
                <span title={c.name}>{c.flag}</span>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--text-tertiary)", letterSpacing: 0.3 }}>{c.code}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={row.indication} style={{ borderBottom: "1px solid var(--surface-border-subtle)" }}>
              <td style={{ padding: "6px var(--space-3)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-primary)", maxWidth: 200 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.indication}</div>
              </td>
              <td style={{ padding: "6px var(--space-3)", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>
                {row.molecule}
              </td>
              {displayCountries.map(c => {
                const score = row.scores[c.code];
                const isHome = c.code === homeCountry;
                return (
                  <td key={c.code} title={score ? `${c.name}: ${score}` : `${c.name}: approved`}
                    style={{
                      width: 44, height: 32, textAlign: "center", padding: 0,
                      background: score ? seqColor(score) : "transparent",
                      border: isHome ? "2px solid var(--brand-gold)" : "1px solid var(--surface-border-subtle)",
                      position: "relative", cursor: score ? "pointer" : "default",
                    }}
                  >
                    {score && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: score > 50 ? "#fff" : "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                        {score}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "var(--space-4)", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
        EMPTY CELLS = APPROVED IN THAT MARKET (NOT A GAP) · HOME MARKET OUTLINED IN GOLD
      </p>
    </div>
  );
}

const thStyle = {
  padding: "6px var(--space-3)",
  fontFamily: "var(--font-mono)", fontSize: 9,
  color: "var(--text-tertiary)", letterSpacing: 0.5,
  textTransform: "uppercase", fontWeight: 500,
  borderBottom: "1px solid var(--surface-border)",
  whiteSpace: "nowrap",
};
