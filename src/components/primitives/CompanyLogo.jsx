// ═══ COMPANY LOGO ═══
// Dependency-free brand badges for the portfolio companies. We render a
// monogram in each company's real brand colour rather than fetching trademarked
// logo images (no network dependency, deploy-safe, on-theme). Optional wordmark.

export const COMPANY_BRAND = {
  pharmascience: { mono: "ps", color: "#0E8C5A", name: "Pharmascience" },
  apotex:        { mono: "ap", color: "#0067B1", name: "Apotex" },
  teva:          { mono: "te", color: "#1B3DA6", name: "Teva" },
  sandoz:        { mono: "sz", color: "#E2571E", name: "Sandoz" },
  sun:           { mono: "su", color: "#E03A2F", name: "Sun Pharma" },
  mylan:         { mono: "vt", color: "#F0613C", name: "Viatris" },
  aurobindo:     { mono: "au", color: "#C2410C", name: "Aurobindo" },
  drreddys:      { mono: "dr", color: "#7C2D8B", name: "Dr. Reddy's" },
  cipla:         { mono: "ci", color: "#1D9BB8", name: "Cipla" },
  lupin:         { mono: "lu", color: "#C81D6B", name: "Lupin" },
  zydus:         { mono: "zy", color: "#D2143C", name: "Zydus" },
  hikma:         { mono: "hk", color: "#0E7C66", name: "Hikma" },
  accord:        { mono: "ac", color: "#2A6FB0", name: "Accord" },
  glenmark:      { mono: "gl", color: "#E0691A", name: "Glenmark" },
  torrent:       { mono: "to", color: "#1E73BE", name: "Torrent" },
  amneal:        { mono: "am", color: "#5A53A8", name: "Amneal" },
  endo:          { mono: "en", color: "#0F766E", name: "Endo" },
  freseniuskabi: { mono: "fk", color: "#E26A1E", name: "Fresenius Kabi" },
  stada:         { mono: "st", color: "#0E5FA8", name: "STADA" },
  krka:          { mono: "kk", color: "#2E8B57", name: "Krka" },
  alkem:         { mono: "ak", color: "#B23A8E", name: "Alkem" },
  mankind:       { mono: "mk", color: "#C0392B", name: "Mankind" },
  natco:         { mono: "na", color: "#6D28A8", name: "Natco" },
  biocon:        { mono: "bi", color: "#C81D5B", name: "Biocon" },
  organon:       { mono: "or", color: "#C0392B", name: "Organon" },
  taro:          { mono: "ta", color: "#1F7A8C", name: "Taro" },
  bausch:        { mono: "bh", color: "#D14619", name: "Bausch Health" },
  knight:        { mono: "kn", color: "#1B3DA6", name: "Knight" },
  jamp:          { mono: "jp", color: "#0E8C5A", name: "Jamp Pharma" },
  sivem:         { mono: "sv", color: "#4B6CB7", name: "Sivem" },
  marcan:        { mono: "mc", color: "#9A3B8E", name: "Marcan" },
  sanis:         { mono: "sa", color: "#11857A", name: "Sanis Health" },
  strides:       { mono: "sd", color: "#C2410C", name: "Strides" },
  alembic:       { mono: "al", color: "#2563A8", name: "Alembic" },
  hetero:        { mono: "he", color: "#B7203C", name: "Hetero" },
  lannett:       { mono: "la", color: "#5A53A8", name: "Lannett" },
  nichiiko:      { mono: "ni", color: "#C0392B", name: "Nichi-Iko" },
  towa:          { mono: "tw", color: "#1D7BA8", name: "Towa" },
  polpharma:     { mono: "po", color: "#0E7C5A", name: "Polpharma" },
  alvogen:       { mono: "av", color: "#7C3AED", name: "Alvogen" },
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
