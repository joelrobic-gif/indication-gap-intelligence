"use client";
// ═══ CASE DRAWER ═══
// The full one-page business case for a molecule. Shows the headline opportunity
// stepped through all 7 agents, the plain-English rationale, supporting gaps,
// the 7-factor score breakdown and competitors — plus the human co-work bar
// (approve / flag / reviewing / pin / note). Humans optional, never required.

import { DEPARTMENT_BY_ID } from "../../lib/engine/departments";
import { runFunnel } from "../../lib/engine/funnel";
import { PTRSRing } from "../primitives/PTRSRing";
import { getDimensionColor } from "../primitives/tokens";

const DIM_LABELS = {
  evidence: "Evidence", breadth: "Global breadth", regulatory: "Reg. precedent",
  commercial: "Commercial", ptrs: "PTRS", unmet: "Unmet need", competitive: "Whitespace",
};

const STATUS_BTNS = [
  { id: "approved",  label: "Approve",   color: "var(--viability-excellent)" },
  { id: "reviewing", label: "Reviewing", color: "var(--viability-strong)" },
  { id: "flagged",   label: "Flag",      color: "var(--viability-low)" },
];

export function CaseDrawer({ caseObj, homeCountry, onClose, onSetStatus, onSetNote, onTogglePin }) {
  if (!caseObj) return null;
  const c = caseObj;
  const g = c.headline;
  const vColor = `var(--viability-${g.viability})`;
  const stages = runFunnel(g, homeCountry);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, animation: "fadeIn var(--duration-fast) var(--ease-out)" }} />

      {/* Panel */}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(560px, 100vw)", zIndex: 201,
        background: "var(--surface-base)", borderLeft: "1px solid var(--surface-border)",
        overflowY: "auto", animation: "slideIn var(--duration-enter) var(--ease-out)",
        boxShadow: "-12px 0 48px rgba(0,0,0,0.5)",
      }} role="dialog" aria-label={`Business case: ${c.molecule}`}>

        {/* Header */}
        <div style={{ position: "sticky", top: 0, background: "var(--surface-base)", borderBottom: "1px solid var(--surface-border)", padding: "var(--space-5)", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: 0.5, marginBottom: 4 }}>
                #{c.rank} · {c.companyName} · {c.atc} · {c.ta}
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.05 }}>{c.molecule}</h2>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{c.moleculeClass}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <PTRSRing ptrs={g.ptrs.ptrs} color={vColor} size={56} />
              <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: "pointer", padding: "2px 8px", fontFamily: "var(--font-mono)", fontSize: 11 }}>✕ Esc</button>
            </div>
          </div>

          {/* Headline opportunity */}
          <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3)", background: "var(--surface-raised)", borderLeft: `3px solid ${vColor}`, borderRadius: "var(--radius-md)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Headline opportunity</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>{g.indication}</div>
            <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-3)" }}>
              <Metric label="Composite" value={`${g.scores.composite}/99`} color={vColor} />
              <Metric label="Viability" value={g.viabilityLabel} color={vColor} />
              <Metric label="Markets open" value={c.marketsOpen} />
              <Metric label="Total gaps" value={c.gapCount} />
            </div>
          </div>
        </div>

        <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Narrative */}
          <Section title="Why this is an opportunity">
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>{c.narrative}</p>
            <div style={{ marginTop: "var(--space-3)", padding: "var(--space-3)", background: "var(--brand-gold-mid)", border: "1px solid var(--brand-gold-dim)", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--brand-gold)", letterSpacing: 1, textTransform: "uppercase" }}>Recommended action · </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.action}</span>
            </div>
          </Section>

          {/* The 7 agents */}
          <Section title="How the 7 agents scored it">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {stages.map((s) => {
                const d = DEPARTMENT_BY_ID[s.dept];
                return (
                  <div key={s.dept} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", padding: "var(--space-2) var(--space-3)", background: "var(--surface-raised)", borderRadius: "var(--radius-md)", borderLeft: `2px solid ${d.color}` }}>
                    <span style={{ color: d.color, fontSize: 14, width: 18, textAlign: "center" }}>{d.glyph}</span>
                    <div style={{ minWidth: 92 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 0.5, textTransform: "uppercase" }}>{d.role}</div>
                    </div>
                    <div style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 11, color: s.ok ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.35 }}>
                      {s.ok && <span style={{ color: "var(--viability-excellent)" }}>✓ </span>}{s.found}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Score breakdown */}
          <Section title="7-factor score breakdown">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(DIM_LABELS).map(([k, label]) => {
                const raw = k === "ptrs" ? Math.round(g.ptrs.ptrs * 100) : g.scores[k];
                const color = getDimensionColor(k);
                return (
                  <div key={k}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-secondary)" }}>{label}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{raw}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--surface-border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(raw, 100)}%`, height: "100%", background: color, transition: "width 0.4s var(--ease-out)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Competitors */}
          {g.competitors.length > 0 ? (
            <Section title={`Competitors racing for this (${g.competitors.length})`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {g.competitors.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-2) var(--space-3)", background: "var(--surface-raised)", borderRadius: "var(--radius-md)" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{r.molecule}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", marginLeft: 6 }}>{r.company}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-secondary)" }}>{r.mechanism}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--brand-gold)" }}>{r.phase}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ) : (
            <Section title="Competition">
              <div style={{ padding: "var(--space-3)", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--viability-excellent)" }}>
                ✓ Open whitespace — no direct competitor program tracked for this indication.
              </div>
            </Section>
          )}

          {/* Supporting gaps */}
          {c.supporting.length > 0 && (
            <Section title={`Other gaps for ${c.molecule} (${c.supporting.length})`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {c.supporting.map(s => {
                  const sc = `var(--viability-${s.viability})`;
                  return (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-2) var(--space-3)", background: "var(--surface-raised)", borderRadius: "var(--radius-md)", borderLeft: `2px solid ${sc}` }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-primary)" }}>{s.indication}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: sc, fontVariantNumeric: "tabular-nums" }}>{s.scores.composite}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Co-work bar */}
          <Section title="Your review (optional — the swarm runs without it)">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "var(--space-3)" }}>
              {STATUS_BTNS.map(b => {
                const active = c.status === b.id;
                return (
                  <button key={b.id} onClick={() => onSetStatus(c.key, b.id)} style={{
                    background: active ? `${b.color}1e` : "transparent", border: `1px solid ${active ? b.color : "var(--surface-border)"}`,
                    borderRadius: "var(--radius-sm)", padding: "6px 12px", color: active ? b.color : "var(--text-secondary)",
                    fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all var(--duration-fast)",
                  }}>{active ? "✓ " : ""}{b.label}</button>
                );
              })}
              <button onClick={() => onTogglePin(c.key)} style={{
                background: c.pinned ? "var(--brand-gold-dim)" : "transparent", border: `1px solid ${c.pinned ? "var(--brand-gold)" : "var(--surface-border)"}`,
                borderRadius: "var(--radius-sm)", padding: "6px 12px", color: c.pinned ? "var(--brand-gold)" : "var(--text-secondary)",
                fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>⚲ {c.pinned ? "Pinned" : "Pin"}</button>
            </div>
            <textarea
              placeholder="Add a note for the team… (saved locally)"
              value={c.note}
              onChange={e => onSetNote(c.key, e.target.value)}
              rows={3}
              style={{ width: "100%", background: "var(--surface-raised)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 13, outline: "none", resize: "vertical" }}
            />
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>{title}</div>
      {children}
    </section>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: color || "var(--text-primary)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  );
}
