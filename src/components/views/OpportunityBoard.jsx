"use client";
// ═══ OPPORTUNITY BOARD ═══
// The funnel's output: one ranked business case per molecule. Sort, filter,
// search, pin. Click a card to open the full one-page case.

import { memo, useState, useMemo } from "react";
import { PTRSRing } from "../primitives/PTRSRing";
import { CompanyLogo } from "../primitives/CompanyLogo";

function money(n) {
  if (n == null) return "—";
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(0)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(0)}K`;
  return `${s}$${Math.round(a)}`;
}

const STATUS_META = {
  approved:  { label: "Approved",  color: "var(--viability-excellent)" },
  reviewing: { label: "Reviewing", color: "var(--viability-strong)" },
  flagged:   { label: "Flagged",   color: "var(--viability-low)" },
};

export function OpportunityBoard({ cases, onOpenCase, onTogglePin }) {
  const [sortBy, setSortBy] = useState("rank");
  const [company, setCompany] = useState("all");
  const [onlyPriority, setOnlyPriority] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  const companies = useMemo(() => {
    const seen = new Map();
    cases.forEach(c => seen.set(c.companyId, c.companyName));
    return [...seen.entries()];
  }, [cases]);

  const shown = useMemo(() => {
    let r = cases;
    if (company !== "all") r = r.filter(c => c.companyId === company);
    if (onlyPriority) r = r.filter(c => c.priority);
    if (statusFilter !== "all") r = r.filter(c => (statusFilter === "none" ? !c.status : c.status === statusFilter));
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter(c => c.molecule.toLowerCase().includes(s) || c.headline.indication.toLowerCase().includes(s) || c.moleculeClass.toLowerCase().includes(s) || c.ta.includes(s));
    }
    return [...r].sort((a, b) => {
      switch (sortBy) {
        case "rnpv": return (b.financials?.rnpv ?? -Infinity) - (a.financials?.rnpv ?? -Infinity);
        case "composite": return b.bestComposite - a.bestComposite;
        case "whitespace": return b.whitespace - a.whitespace;
        case "gaps": return b.gapCount - a.gapCount;
        case "molecule": return a.molecule.localeCompare(b.molecule);
        case "company": return a.companyName.localeCompare(b.companyName) || b.bestComposite - a.bestComposite;
        default: return (b.pinned - a.pinned) || (a.rank - b.rank);
      }
    });
  }, [cases, company, onlyPriority, statusFilter, q, sortBy]);

  const priorityCount = cases.filter(c => c.priority).length;

  return (
    <div style={{ padding: "var(--space-5)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Opportunity business cases</h2>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {cases.length} molecules ranked · {priorityCount} flagged priority · best case per molecule
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <input type="search" placeholder="Search molecule / indication…" value={q} onChange={e => setQ(e.target.value)}
          style={{ background: "var(--surface-base)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "5px 10px", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 12, outline: "none", width: 220 }} />
        <Ctl label="Sort" value={sortBy} onChange={setSortBy} options={[["rank","Rank"],["rnpv","rNPV"],["composite","Composite"],["whitespace","Whitespace"],["gaps","# Gaps"],["company","Company"],["molecule","Molecule"]]} />
        <Ctl label="Company" value={company} onChange={setCompany} options={[["all","All"], ...companies.map(([id,name]) => [id, name])]} />
        <Ctl label="Status" value={statusFilter} onChange={setStatusFilter} options={[["all","All"],["approved","Approved"],["reviewing","Reviewing"],["flagged","Flagged"],["none","Unreviewed"]]} />
        <button onClick={() => setOnlyPriority(v => !v)} style={{
          background: onlyPriority ? "var(--brand-gold-dim)" : "transparent",
          border: `1px solid ${onlyPriority ? "var(--brand-gold)" : "var(--surface-border)"}`,
          borderRadius: "var(--radius-sm)", padding: "4px 10px", color: onlyPriority ? "var(--brand-gold)" : "var(--text-tertiary)",
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 0.5, cursor: "pointer",
        }}>★ Priority only</button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)", marginLeft: "auto" }}>{shown.length} shown</span>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-4)" }}>
        {shown.map((c, i) => (
          <CaseCard key={c.key} c={c} onClick={() => onOpenCase(c.key)} onPin={() => onTogglePin(c.key)} entryDelay={i < 20 ? i * 25 : 0} />
        ))}
      </div>
      {shown.length === 0 && (
        <div style={{ padding: "var(--space-12)", textAlign: "center", fontFamily: "var(--font-body)", color: "var(--text-tertiary)" }}>No cases match the filters.</div>
      )}
    </div>
  );
}

const CaseCard = memo(function CaseCard({ c, onClick, onPin, entryDelay }) {
  const vColor = `var(--viability-${c.headline.viability})`;
  const status = c.status ? STATUS_META[c.status] : null;
  return (
    <article onClick={onClick} role="button" tabIndex={0}
      style={{
        background: "var(--surface-raised)", border: `1px solid ${c.pinned ? "var(--brand-gold)" : "var(--surface-border)"}`,
        borderLeft: `3px solid ${vColor}`, borderRadius: "var(--radius-lg)", padding: "var(--space-4)", cursor: "pointer",
        transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
        animation: entryDelay > 0 ? `fadeIn var(--duration-standard) var(--ease-out) ${entryDelay}ms both` : "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Rank + company logo + pin */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: 0.5, flexShrink: 0 }}>#{c.rank}</span>
          <CompanyLogo companyId={c.companyId} companyName={c.companyName} size={18} showName />
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} onClick={e => e.stopPropagation()}>
          {c.priority && <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--brand-gold)", border: "1px solid var(--brand-gold)", borderRadius: 2, padding: "1px 4px", letterSpacing: 0.5 }}>PRIORITY</span>}
          <button onClick={onPin} title={c.pinned ? "Unpin" : "Pin to top"} style={{ background: "none", border: "none", cursor: "pointer", color: c.pinned ? "var(--brand-gold)" : "var(--surface-border)", fontSize: 14, padding: 0 }}>⚲</button>
        </div>
      </div>

      {/* Molecule + indication */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.15 }}>{c.molecule}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", marginTop: 2 }}>{c.moleculeClass} · {c.atc}</div>
        </div>
        <PTRSRing ptrs={c.headline.ptrs.ptrs} color={vColor} size={42} />
      </div>

      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", margin: "var(--space-3) 0", lineHeight: 1.4 }}>
        → {c.headline.indication}
      </div>

      {/* Composite bar */}
      <div style={{ marginBottom: "var(--space-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1 }}>BEST COMPOSITE</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: vColor, fontVariantNumeric: "tabular-nums" }}>{c.bestComposite}</span>
        </div>
        <div style={{ height: 4, background: "var(--surface-border)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${c.bestComposite}%`, height: "100%", background: vColor, transition: "width 0.5s var(--ease-out)" }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
        {c.financials && <Stat label="rNPV" value={money(c.financials.rnpv)} color={c.financials.rnpv >= 0 ? "var(--viability-excellent)" : "var(--viability-low)"} />}
        {c.financials && <Stat label="Peak sales" value={money(c.financials.peakSales)} />}
        <Stat label="Gaps" value={c.gapCount} />
        <Stat label="Whitespace" value={c.whitespace} color={c.whitespace ? "var(--viability-excellent)" : undefined} />
      </div>

      {/* Action + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--brand-gold)", lineHeight: 1.3 }}>{c.action}</span>
        {status && <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: status.color, background: `${status.color}14`, border: `1px solid ${status.color}40`, borderRadius: 2, padding: "2px 6px", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{status.label}</span>}
      </div>
    </article>
  );
});

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: color || "var(--text-primary)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Ctl({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ background: "var(--surface-base)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: 10, outline: "none", cursor: "pointer" }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
