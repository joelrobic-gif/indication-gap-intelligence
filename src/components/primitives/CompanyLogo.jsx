// ═══ COMPANY LOGO ═══
// Dependency-free brand badges for the portfolio companies. We render a
// monogram in each company's real brand colour rather than fetching trademarked
// logo images (no network dependency, deploy-safe, on-theme). Optional wordmark.

export const COMPANY_BRAND = {
  pharmascience: { mono: "ps", color: "#0E8C5A", name: "Pharmascience" }, // green
  apotex:        { mono: "ap", color: "#0067B1", name: "Apotex" },        // blue
  teva:          { mono: "te", color: "#1B3DA6", name: "Teva" },          // deep blue
  sandoz:        { mono: "sz", color: "#E2571E", name: "Sandoz" },        // orange
  sun:           { mono: "su", color: "#E03A2F", name: "Sun Pharma" },    // red
  mylan:         { mono: "vt", color: "#F0613C", name: "Viatris" },       // coral
};

function brandFor(companyId, companyName) {
  return COMPANY_BRAND[companyId] || { mono: (companyName || "?").slice(0, 2).toLowerCase(), color: "#6b7280", name: companyName || companyId };
}

/**
 * <CompanyLogo companyId="pharmascience" size={22} showName />
 * Renders the brand badge, optionally followed by the wordmark.
 */
export function CompanyLogo({ companyId, companyName, size = 22, showName = false, light = false }) {
  const b = brandFor(companyId, companyName);
  const r = Math.round(size * 0.28);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: showName ? 7 : 0, verticalAlign: "middle" }}>
      <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={`${b.name} logo`} style={{ flexShrink: 0 }}>
        <rect x="1" y="1" width="38" height="38" rx={r * 1.4} fill={b.color} />
        <rect x="1" y="1" width="38" height="38" rx={r * 1.4} fill="url(#cl-sheen)" opacity="0.18" />
        <defs>
          <linearGradient id="cl-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text x="20" y="21" textAnchor="middle" dominantBaseline="central"
          style={{ font: `700 19px var(--font-body)`, fill: "#fff", letterSpacing: "-0.5px" }}>
          {b.mono}
        </text>
      </svg>
      {showName && (
        <span style={{ font: `600 ${Math.round(size * 0.6)}px var(--font-body)`, color: light ? "#12161f" : "var(--text-primary)", whiteSpace: "nowrap" }}>
          {b.name}
        </span>
      )}
    </span>
  );
}
