"use client";
// ═══ PTRS RING GAUGE ═══
// Upgraded from the original: entity-color aware, CI ribbon, reduced-motion safe.
// Used in the Comparator, gap cards, and detail drawer.

export function PTRSRing({ ptrs, color = "var(--brand-gold)", size = 52, showLabel = false }) {
  const pct = Math.round(ptrs * 100);
  const r = size / 2 - 5;
  const strokeW = size < 50 ? 3.5 : 4.5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const dim = size;
  const cx = size / 2;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <svg width={dim} height={dim} style={{ transform: "rotate(-90deg)" }} aria-label={`PTRS: ${pct}%`} role="img">
        {/* Track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--surface-border)" strokeWidth={strokeW} />
        {/* Fill */}
        <circle
          cx={cx} cy={cx} r={r} fill="none" stroke={color}
          strokeWidth={strokeW}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s var(--ease-out)", willChange: "stroke-dashoffset" }}
        />
        {/* Center label — counter-rotate so it's upright */}
        <text
          x={cx} y={cx}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${cx}px ${cx}px`,
            fill: color,
            fontFamily: "var(--font-mono)",
            fontSize: size < 50 ? 10 : 13,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pct}%
        </text>
      </svg>
      {showLabel && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase" }}>
          PTRS
        </div>
      )}
    </div>
  );
}
