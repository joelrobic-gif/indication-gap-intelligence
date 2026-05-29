"use client";
// ═══ FUNNEL VIEW — "How we find the opportunity" ═══
// The ELI5 landing surface. Explains the whole process in plain language, shows
// the 7-agent assembly line, then a live narrowing funnel from the full drug
// universe down to a ranked set of business cases.

import { DEPARTMENTS } from "../../lib/engine/departments";

export function Funnel({ tiers, processedCount, universe, onGotoCases, onGotoDepartments }) {
  const maxCount = tiers[0]?.count || 1;

  return (
    <div style={{ padding: "var(--space-8) var(--space-5)", maxWidth: 1100, margin: "0 auto" }}>
      {/* Intro */}
      <div style={{ marginBottom: "var(--space-8)", animation: "fadeIn var(--duration-enter) var(--ease-out) both" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: "var(--brand-gold)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>
          How we find the opportunity
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, lineHeight: 1.1, color: "var(--text-primary)", marginBottom: "var(--space-4)", maxWidth: 800 }}>
          A drug already approved somewhere is a drug we can approve here.
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-lg)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 760 }}>
          Around the world, medicines are quietly approved for new diseases — but those approvals
          don&apos;t arrive everywhere at once. That delay is the opportunity. A swarm of seven AI
          agents scans every drug in the portfolio, finds where each use is approved abroad but
          <strong style={{ color: "var(--text-primary)" }}> still missing at home</strong>, weighs the
          science, the competition and the prize, then writes a ranked business case — automatically,
          around the clock.
        </p>
      </div>

      {/* The assembly line */}
      <SectionLabel>The 7-agent assembly line — a molecule flows left → right</SectionLabel>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-8)" }}>
        {DEPARTMENTS.map((d, i) => (
          <div key={d.id}
            onClick={onGotoDepartments}
            title={d.eli5}
            style={{
              flex: "1 1 130px", minWidth: 130, background: "var(--surface-raised)",
              border: "1px solid var(--surface-border)", borderTop: `2px solid ${d.color}`,
              borderRadius: "var(--radius-md)", padding: "var(--space-3)", cursor: "pointer",
              animation: `fadeIn var(--duration-standard) var(--ease-out) ${i * 40}ms both`,
              transition: "border-color var(--duration-fast), transform var(--duration-fast)",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ color: d.color, fontSize: 16 }}>{d.glyph}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 0.5, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 6 }}>{d.role}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.45 }}>{d.eli5}</div>
          </div>
        ))}
      </div>

      {/* The funnel */}
      <SectionLabel>The funnel — {universe.candidateCount.toLocaleString()} candidates narrowing to the best bets</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
        {tiers.map((t, i) => {
          const w = Math.max(18, Math.sqrt(t.count / maxCount) * 100);
          const dept = DEPARTMENTS.find(d => d.id === t.dept);
          return (
            <div key={t.id} style={{
              width: `${w}%`, minWidth: 240,
              background: "var(--surface-raised)", border: `1px solid var(--surface-border)`,
              borderLeft: `3px solid ${t.color}`, borderRadius: "var(--radius-md)",
              padding: "var(--space-3) var(--space-4)", display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "var(--space-4)", animation: `fadeIn var(--duration-standard) var(--ease-out) ${i * 70}ms both`,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: t.color, fontSize: 13 }}>{dept?.glyph}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{t.label}</span>
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{t.desc}</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", fontWeight: 700, color: t.color, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {t.count.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={onGotoCases} style={ctaBtn(true)}>★ See the ranked business cases →</button>
        <button onClick={onGotoDepartments} style={ctaBtn(false)}>◎ Watch the agents work live →</button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)" }}>
          {processedCount.toLocaleString()} analyses run so far
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1, color: "var(--text-tertiary)",
      textTransform: "uppercase", marginBottom: "var(--space-4)", paddingBottom: "var(--space-2)",
      borderBottom: "1px solid var(--surface-border-subtle)",
    }}>{children}</div>
  );
}

const ctaBtn = (primary) => ({
  background: primary ? "var(--brand-gold-dim)" : "transparent",
  border: `1px solid ${primary ? "var(--brand-gold)" : "var(--surface-border)"}`,
  borderRadius: "var(--radius-md)", padding: "10px 18px",
  color: primary ? "var(--brand-gold)" : "var(--text-secondary)",
  fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer",
  transition: "all var(--duration-fast)",
});
