"use client";
// ═══ INLINE SPARKLINE ═══
// 80×24px inline trend line. Used in comparator column headers and gap cards.
// data: number[] (values to plot, auto-scaled)
// color: CSS color string

export function Sparkline({ data = [], color = "var(--brand-gold)", width = 80, height = 24, baseline = true }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const lastX = width;
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;

  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }} aria-hidden="true">
      {baseline && (
        <line x1={0} y1={height - 1} x2={width} y2={height - 1} stroke="var(--surface-border)" strokeWidth={1} />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* Terminal dot */}
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}
