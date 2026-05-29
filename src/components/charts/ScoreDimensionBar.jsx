"use client";
// ═══ SCORE DIMENSION BARS ═══
// Horizontal faceted bar chart for the 7 IGI scoring dimensions.
// Each dimension gets its own bar with a shared 0-100 x-axis.
// Ref. line at 50 marks the "median" baseline.
// color: entity color from the comparator column assignment.

const DIMENSIONS = [
  { key: "evidence",    label: "Evidence",    weight: "20%" },
  { key: "breadth",     label: "Breadth",     weight: "15%" },
  { key: "regulatory",  label: "Regulatory",  weight: "15%" },
  { key: "commercial",  label: "Commercial",  weight: "15%" },
  { key: "ptrs",        label: "PTRS",        weight: "15%" },
  { key: "unmet",       label: "Unmet Need",  weight: "10%" },
  { key: "competitive", label: "Whitespace",  weight: "10%" },
];

export function ScoreDimensionBar({ scores, color = "var(--brand-gold)", compact = false }) {
  const height = compact ? 4 : 5;
  const gap = compact ? 8 : 10;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap }}>
      {DIMENSIONS.map(dim => {
        // ptrs is stored as 0-1; normalize to 0-100 for display
        const rawValue = scores[dim.key] ?? 0;
        const displayValue = dim.key === "ptrs" ? Math.round(rawValue * 100) : rawValue;
        const barWidth = Math.min(Math.max(displayValue, 0), 100);

        return (
          <div key={dim.key}>
            {!compact && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8,
                  color: "var(--text-tertiary)", letterSpacing: 0.5, textTransform: "uppercase",
                }}>
                  {dim.label}
                  <span style={{ marginLeft: 4, color: "var(--surface-border)" }}>{dim.weight}</span>
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9, color,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {displayValue}
                </span>
              </div>
            )}
            {/* Bar track */}
            <div style={{ position: "relative", height, background: "var(--surface-border)", borderRadius: height / 2, overflow: "visible" }}>
              {/* Median reference line at 50% */}
              <div style={{
                position: "absolute", left: "50%", top: -2, bottom: -2, width: 1,
                background: "var(--reference-line-color)",
                zIndex: 1,
              }} />
              {/* Fill */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${barWidth}%`,
                background: color, opacity: 0.8,
                borderRadius: height / 2,
                transition: "width 0.5s var(--ease-out)",
                zIndex: 2,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
