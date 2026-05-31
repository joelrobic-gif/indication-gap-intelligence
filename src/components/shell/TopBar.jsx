"use client";
// ═══ TOP BAR ═══
// Company selector, country picker, view tabs, search, watchlist + compare counts.

export function TopBar({
  companies, companyId, onCompanyChange,
  countries, homeCountry, onCountryChange,
  view, onViewChange, onHome,
  watchlistCount, compareCount,
  searchQuery, onSearchChange,
  showCompanyControls = true,
}) {
  const VIEWS = [
    { id: "funnel",        label: "Funnel" },
    { id: "mission",       label: "Mission Control" },
    { id: "opportunities", label: "Opportunities" },
    { id: "explorer",      label: "Explorer" },
    { id: "heatmap",       label: "Heatmap" },
    { id: "portfolio",     label: "Portfolio" },
    { id: "compare",       label: `Compare${compareCount > 0 ? ` (${compareCount})` : ""}` },
  ];

  return (
    <header style={{
      background: "var(--surface-raised)",
      borderBottom: "1px solid var(--surface-border)",
      padding: "0 var(--space-5)",
      display: "flex", alignItems: "center", gap: "var(--space-4)",
      height: 52, position: "sticky", top: 0, zIndex: 100,
      flexWrap: "nowrap",
    }}>
      {/* Logo — click to return to landing */}
      <button
        onClick={onHome}
        title="Home"
        style={{
          fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
          color: "var(--brand-gold)", whiteSpace: "nowrap", letterSpacing: "-0.01em",
          fontOpticalSizing: "auto", flexShrink: 0,
          background: "none", border: "none", padding: 0, cursor: "pointer",
        }}
      >
        ExpandRx
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "var(--surface-border)", flexShrink: 0 }} />

      {/* Company picker (legacy views only) */}
      {showCompanyControls && (
        <select
          value={companyId}
          onChange={e => onCompanyChange(e.target.value)}
          aria-label="Select company"
          style={selectStyle}
        >
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {/* Country picker */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase" }}>Home</span>
        <select
          value={homeCountry}
          onChange={e => onCountryChange(e.target.value)}
          aria-label="Select home market"
          style={{ ...selectStyle, minWidth: 80 }}
        >
          {countries.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
      </div>

      {/* View tabs */}
      <nav style={{ display: "flex", gap: 2, flexShrink: 0 }} role="tablist" aria-label="Application views">
        {VIEWS.map(v => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              onClick={() => onViewChange(v.id)}
              style={{
                background: active ? "var(--brand-gold-dim)" : "transparent",
                border: `1px solid ${active ? "var(--brand-gold)" : "transparent"}`,
                borderRadius: "var(--radius-sm)",
                padding: "4px 10px",
                color: active ? "var(--brand-gold)" : "var(--text-secondary)",
                fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.5,
                textTransform: "uppercase", cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-standard)",
              }}
            >
              {v.label}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search (legacy views only) */}
      {showCompanyControls && (
        <input
          type="search"
          placeholder="Search gaps…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          aria-label="Search indication gaps"
          style={{
            background: "var(--surface-base)", border: "1px solid var(--surface-border)",
            borderRadius: "var(--radius-md)", padding: "5px 10px",
            color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)",
            outline: "none", width: 180, flexShrink: 0,
          }}
        />
      )}

      {/* Watchlist count */}
      {watchlistCount > 0 && (
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-secondary)",
          border: "1px solid var(--surface-border)", borderRadius: "var(--radius-sm)",
          padding: "3px 7px", letterSpacing: 0.5, flexShrink: 0,
        }}>
          ★ {watchlistCount}
        </div>
      )}
    </header>
  );
}

const selectStyle = {
  background: "var(--surface-base)",
  border: "1px solid var(--surface-border)",
  borderRadius: "var(--radius-md)",
  padding: "5px 10px",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  outline: "none",
  cursor: "pointer",
  minWidth: 160,
};
