"use client";
// ═══ CASE REPORT ═══
// A full, print-ready pharmaceutical indication-expansion business case — the
// kind of document a real Corporate Development / BD&L team would circulate.
// ~13 "pages": cover, 1-page executive summary, then structured sections with
// tables, infographics and charts (all dependency-free inline SVG). Light
// "paper" theme on a dark gutter; Print / Save-PDF paginates cleanly.

import { DEPARTMENT_BY_ID } from "../../lib/engine/departments";
import { runFunnel } from "../../lib/engine/funnel";
import { getCountry, getMarketValue, COUNTRIES } from "../../lib/data/countries";
import { PTRS_BASE_RATES, evidenceTierLabel } from "../../lib/data/ptrs";
import { WEIGHTS } from "../../lib/scoring";
import { ASSUMPTIONS } from "../../lib/engine/assumptions";
import { OUTCOMES, houseAdjustedPTRS } from "../../lib/engine/outcomes";
import { CompanyLogo } from "../primitives/CompanyLogo";

// ── Light report palette ──
const INK = "#12161f", SUB = "#525a6b", FAINT = "#8b92a3", LINE = "#e4e7ee";
const PAPER = "#ffffff", PAPER2 = "#f6f8fb", GOLD = "#a8792b", NAVY = "#15233b";
const V = { excellent: "#1a8f5f", strong: "#b7791f", moderate: "#2563a8", low: "#c0392b" };
const DIM = { evidence: "#2563a8", breadth: "#1a8f5f", regulatory: "#b85c1e", commercial: "#a14d7a", ptrs: "#2f7fb0", unmet: "#b7791f", competitive: "#6b8f1e" };

const fmtDate = (ts) => {
  const d = new Date(ts);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
};

// ════════════════════ SVG CHART PRIMITIVES ════════════════════
function polar(cx, cy, r, deg) { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
function arcPath(cx, cy, r, start, end) {
  const [x1, y1] = polar(cx, cy, r, start), [x2, y2] = polar(cx, cy, r, end);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

function Gauge({ value, color, sub }) {
  const v = Math.max(0, Math.min(100, value));
  const cx = 110, cy = 110, r = 88;
  return (
    <svg viewBox="0 0 220 140" width="100%" style={{ maxWidth: 240 }}>
      <path d={arcPath(cx, cy, r, -90, 90)} fill="none" stroke={LINE} strokeWidth="14" strokeLinecap="round" />
      <path d={arcPath(cx, cy, r, -90, -90 + (v / 100) * 180)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <text x={cx} y={cy - 6} textAnchor="middle" style={{ font: "700 38px var(--font-mono)", fill: INK }}>{Math.round(v)}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" style={{ font: "500 11px var(--font-mono)", fill: FAINT, letterSpacing: "1px" }}>{sub}</text>
    </svg>
  );
}

function Radar({ axes }) {
  const cx = 150, cy = 140, R = 105, n = axes.length;
  const ring = (f) => axes.map((_, i) => polar(cx, cy, R * f, (360 / n) * i).join(",")).join(" ");
  const pts = axes.map((a, i) => polar(cx, cy, R * (Math.min(100, a.value) / 100), (360 / n) * i));
  return (
    <svg viewBox="0 0 300 290" width="100%" style={{ maxWidth: 360 }}>
      {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={ring(f)} fill="none" stroke={LINE} strokeWidth="1" />)}
      {axes.map((a, i) => { const [x, y] = polar(cx, cy, R, (360 / n) * i); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={LINE} strokeWidth="1" />; })}
      <polygon points={pts.map(p => p.join(",")).join(" ")} fill={`${GOLD}33`} stroke={GOLD} strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={GOLD} />)}
      {axes.map((a, i) => {
        const [x, y] = polar(cx, cy, R + 18, (360 / n) * i);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{ font: "600 9px var(--font-mono)", fill: SUB }}>{a.label}</text>;
      })}
    </svg>
  );
}

function HBars({ items, height = 22 }) {
  const max = Math.max(...items.map(i => i.value), 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 38px", alignItems: "center", gap: 10 }}>
          <span style={{ font: "500 11px var(--font-body)", color: SUB }}>{it.label}</span>
          <div style={{ height, background: PAPER2, borderRadius: 4, overflow: "hidden", border: `1px solid ${LINE}` }}>
            <div style={{ width: `${(it.value / max) * 100}%`, height: "100%", background: it.color || NAVY, borderRadius: 4 }} />
          </div>
          <span style={{ font: "700 12px var(--font-mono)", color: INK, textAlign: "right" }}>{it.display ?? it.value}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ value, total, color, label }) {
  const cx = 70, cy = 70, r = 54, C = 2 * Math.PI * r;
  const f = total ? value / total : 0;
  return (
    <svg viewBox="0 0 140 140" width="120" height="120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={LINE} strokeWidth="14" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${C * f} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 2} textAnchor="middle" style={{ font: "700 26px var(--font-mono)", fill: INK }}>{value}</text>
      <text x={cx} y={cy + 18} textAnchor="middle" style={{ font: "500 9px var(--font-mono)", fill: FAINT, letterSpacing: "1px" }}>{label}</text>
    </svg>
  );
}

function Timeline({ phase, months }) {
  const phases = ["Preclinical", "Phase I", "Phase II", "Phase III", "Filing", "Approved"];
  const idx = { Preclinical: 0, "Phase I": 1, "Phase II": 2, "Phase III": 3, Filing: 4, Approved: 5 }[phase] ?? 3;
  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>
        {phases.map((p, i) => (
          <div key={p} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 8, borderRadius: 4, background: i <= idx ? GOLD : LINE }} />
            <div style={{ font: "600 8px var(--font-mono)", color: i === idx ? INK : FAINT, marginTop: 4, letterSpacing: "0.3px" }}>{p}</div>
          </div>
        ))}
      </div>
      <div style={{ font: "500 11px var(--font-body)", color: SUB, marginTop: 10 }}>
        Current stage: <strong style={{ color: INK }}>{phase}</strong> · estimated <strong style={{ color: INK }}>~{months} months</strong> to approval at this market.
      </div>
    </div>
  );
}

function CountryGrid({ approvedSet, home }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {COUNTRIES.map(c => {
        const isHome = c.code === home, ok = approvedSet.has(c.code);
        const bg = isHome ? "#fde7e7" : ok ? "#e6f4ee" : PAPER2;
        const bd = isHome ? V.low : ok ? V.excellent : LINE;
        const tx = isHome ? V.low : ok ? V.excellent : FAINT;
        return (
          <div key={c.code} title={`${c.name} — ${isHome ? "HOME (open)" : ok ? "approved" : "not approved"}`}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 6, background: bg, border: `1px solid ${bd}` }}>
            <span style={{ fontSize: 13 }}>{c.flag}</span>
            <span style={{ font: "600 10px var(--font-mono)", color: tx }}>{c.code}</span>
            <span style={{ font: "600 8px var(--font-mono)", color: tx }}>{isHome ? "◎ TARGET" : ok ? "✓" : "·"}</span>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════ LAYOUT HELPERS ════════════════════
function Page({ n, total, molecule, children, label, companyId, companyName }) {
  return (
    <section className="report-page" style={{
      background: PAPER, width: "100%", maxWidth: 820, margin: "0 auto 28px", padding: "48px 56px 40px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.35)", position: "relative", minHeight: 1040,
      display: "flex", flexDirection: "column", color: INK,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${LINE}`, paddingBottom: 8, marginBottom: 24 }}>
        <span style={{ font: "600 9px var(--font-mono)", color: FAINT, letterSpacing: "1.5px", textTransform: "uppercase" }}>{molecule} · Indication Expansion Business Case</span>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <CompanyLogo companyId={companyId} companyName={companyName} size={15} showName light />
          <span style={{ font: "600 9px var(--font-mono)", color: FAINT, letterSpacing: "1px" }}>CONFIDENTIAL</span>
        </span>
      </div>
      {label && <SectionTitle>{label}</SectionTitle>}
      <div style={{ flex: 1 }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${LINE}`, paddingTop: 8, marginTop: 24 }}>
        <span style={{ font: "500 9px var(--font-mono)", color: FAINT }}>ExpandRx</span>
        <span style={{ font: "600 9px var(--font-mono)", color: FAINT }}>{n} / {total}</span>
      </div>
    </section>
  );
}

function SectionTitle({ children, kicker }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {kicker && <div style={{ font: "700 10px var(--font-mono)", color: GOLD, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>{kicker}</div>}
      <h2 style={{ font: "600 24px var(--font-display)", color: NAVY, lineHeight: 1.1 }}>{children}</h2>
    </div>
  );
}

function H3({ children }) { return <h3 style={{ font: "700 12px var(--font-mono)", color: GOLD, letterSpacing: "1.5px", textTransform: "uppercase", margin: "22px 0 10px" }}>{children}</h3>; }
function P({ children }) { return <p style={{ font: "400 13.5px var(--font-body)", color: SUB, lineHeight: 1.7, marginBottom: 12 }}>{children}</p>; }

function Table({ head, rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", margin: "8px 0 14px" }}>
      <thead>
        <tr>{head.map((h, i) => <th key={i} style={{ font: "700 9px var(--font-mono)", color: NAVY, letterSpacing: "0.8px", textTransform: "uppercase", textAlign: i === 0 ? "left" : "right", padding: "7px 10px", borderBottom: `2px solid ${NAVY}`, background: PAPER2 }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri} style={{ background: ri % 2 ? PAPER2 : PAPER }}>
            {r.map((c, ci) => <td key={ci} style={{ font: ci === 0 ? "500 12px var(--font-body)" : "600 12px var(--font-mono)", color: ci === 0 ? INK : SUB, textAlign: ci === 0 ? "left" : "right", padding: "7px 10px", borderBottom: `1px solid ${LINE}`, verticalAlign: "top" }}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ flex: 1, minWidth: 120, padding: "14px 16px", background: PAPER2, border: `1px solid ${LINE}`, borderTop: `3px solid ${color || GOLD}`, borderRadius: 8 }}>
      <div style={{ font: "700 28px var(--font-mono)", color: INK, lineHeight: 1 }}>{value}</div>
      <div style={{ font: "700 9px var(--font-mono)", color: FAINT, letterSpacing: "1px", textTransform: "uppercase", marginTop: 6 }}>{label}</div>
      {sub && <div style={{ font: "400 11px var(--font-body)", color: SUB, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ════════════════════ FINANCIAL CHARTS ════════════════════
function money(n) {
  const a = Math.abs(n), s = n < 0 ? "-" : "";
  if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(0)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(0)}K`;
  return `${s}$${Math.round(a)}`;
}

function RevenueBars({ rows }) {
  const max = Math.max(...rows.map(r => r.revenue), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 170, padding: "0 4px" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
          <span style={{ font: "600 8px var(--font-mono)", color: SUB, marginBottom: 3 }}>{money(r.revenue)}</span>
          <div title={`Year +${r.t}: ${money(r.revenue)}`} style={{ width: "100%", maxWidth: 38, height: `${(r.revenue / max) * 130}px`, background: NAVY, borderRadius: "3px 3px 0 0" }} />
          <span style={{ font: "600 8px var(--font-mono)", color: FAINT, marginTop: 4 }}>Y+{r.t}</span>
        </div>
      ))}
    </div>
  );
}

function Waterfall({ steps }) {
  const max = Math.max(...steps.map(s => Math.abs(s.value)), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 90px", alignItems: "center", gap: 10 }}>
          <span style={{ font: `${s.bold ? 700 : 500} 11px var(--font-body)`, color: s.bold ? INK : SUB }}>{s.label}</span>
          <div style={{ height: 20, background: PAPER2, borderRadius: 4, border: `1px solid ${LINE}`, overflow: "hidden" }}>
            <div style={{ width: `${(Math.abs(s.value) / max) * 100}%`, height: "100%", background: s.color, borderRadius: 4 }} />
          </div>
          <span style={{ font: "700 12px var(--font-mono)", color: s.value < 0 ? V.low : INK, textAlign: "right" }}>{money(s.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Tornado({ sensitivity, base }) {
  const all = sensitivity.flatMap(s => [s.low, s.high, base]);
  const lo = Math.min(...all), hi = Math.max(...all), span = (hi - lo) || 1;
  const x = (v) => ((v - lo) / span) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sensitivity.map((s, i) => {
        const a = x(Math.min(s.low, s.high)), b = x(Math.max(s.low, s.high));
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 10 }}>
            <span style={{ font: "500 11px var(--font-body)", color: SUB }}>{s.driver}</span>
            <div style={{ position: "relative", height: 22, background: PAPER2, borderRadius: 4, border: `1px solid ${LINE}` }}>
              <div style={{ position: "absolute", left: `${a}%`, width: `${b - a}%`, top: 0, bottom: 0, background: `${GOLD}cc`, borderRadius: 4 }} />
              <div style={{ position: "absolute", left: `${x(base)}%`, top: -3, bottom: -3, width: 2, background: NAVY }} />
            </div>
          </div>
        );
      })}
      <div style={{ font: "500 9px var(--font-mono)", color: FAINT, textAlign: "right" }}>▏ vertical line = base-case rNPV {money(base)}</div>
    </div>
  );
}

// ════════════════════ MAIN REPORT ════════════════════
export function CaseReport({ caseObj, homeCountry, now, onClose, onSetStatus, onSetNote, onTogglePin, onSetOutcome, outcomeStats }) {
  if (!caseObj) return null;
  const c = caseObj;
  const g = c.headline;
  const vc = V[g.viability] || GOLD;
  const homeName = getCountry(homeCountry).name;
  const approvedSet = new Set(g.approvedIn);
  const ptrsPct = Math.round(g.ptrs.ptrs * 100);
  const ci = g.ptrs.ci80 ? `${Math.round(g.ptrs.ci80[0] * 100)}–${Math.round(g.ptrs.ci80[1] * 100)}%` : "—";
  const rates = PTRS_BASE_RATES[g.ta] || PTRS_BASE_RATES.inflammation;
  const stages = runFunnel(g, homeCountry);
  const unmet = g.unmetNeed || null;
  const allGaps = [g, ...c.supporting];
  const fin = c.financials;

  const mkts = [...g.approvedIn.map(code => ({ code, value: getMarketValue(code), approved: true })),
    { code: homeCountry, value: getMarketValue(homeCountry), approved: false }]
    .sort((a, b) => b.value - a.value).slice(0, 9)
    .map(m => ({ label: `${getCountry(m.code).flag} ${getCountry(m.code).name}`, value: m.value, color: m.approved ? NAVY : V.low, display: m.value }));

  const scoreAxes = [
    { label: "Evidence", value: g.scores.evidence },
    { label: "Breadth", value: g.scores.breadth },
    { label: "Reg.", value: g.scores.regulatory },
    { label: "Commercial", value: g.scores.commercial },
    { label: "PTRS", value: ptrsPct },
    { label: "Unmet", value: g.scores.unmet },
    { label: "Whitespace", value: g.scores.competitive },
  ];
  const weightRows = [
    ["Evidence quality", g.scores.evidence, WEIGHTS.evidence],
    ["Global breadth", g.scores.breadth, WEIGHTS.breadth],
    ["Regulatory precedent", g.scores.regulatory, WEIGHTS.regulatory],
    ["Commercial", g.scores.commercial, WEIGHTS.commercial],
    ["PTRS", ptrsPct, WEIGHTS.ptrs],
    ["Unmet need", g.scores.unmet, WEIGHTS.unmet],
    ["Competitive whitespace", g.scores.competitive, WEIGHTS.competitive],
  ].map(([k, s, w]) => [k, s, `${(w * 100).toFixed(0)}%`, (s * w).toFixed(1)]);

  const risks = [];
  if (g.ptrs.ptrs < 0.35) risks.push(["Technical / regulatory", "High", `Modelled probability of success is ${ptrsPct}% — below the comfort threshold.`, "Pursue a bridging / bibliographic filing leveraging foreign approval dossiers; align endpoints with the home regulator pre-submission."]);
  else risks.push(["Technical / regulatory", "Moderate", `PTRS of ${ptrsPct}% at ${g.ptrs.phase}; foreign precedent de-risks the pathway.`, "Confirm the foreign dossier is transferable; secure a pre-submission meeting."]);
  if (g.competitors.length >= 3) risks.push(["Competitive", "High", `${g.competitors.length} rival programs are active in this indication.`, "Differentiate on formulation, label or price; prioritise speed-to-file."]);
  else if (g.competitors.length === 0) risks.push(["Category / first-mover", "Moderate", "No precedent competitor — endpoint acceptance may be untested with the home regulator.", "Engage the regulator early on acceptable endpoints; cite foreign approvals."]);
  else risks.push(["Competitive", "Low", `${g.competitors.length} tracked program(s); manageable field.`, "Monitor competitor filings quarterly."]);
  if (g.patientPop === "N/A") risks.push(["Commercial sizing", "Moderate", "Addressable population not yet sized.", "Commission an HEOR / epidemiology study before committing capital."]);
  risks.push(["Data provenance", "Advisory", "This model blends curated and AI-generated intelligence.", "Validate all approval, trial and competitor claims against primary sources (regulator databases, ClinicalTrials.gov) before any investment decision."]);

  const plan = c.bestComposite >= 75
    ? [["0–3 mo", "Commission the regulatory gap dossier; confirm transferability of the foreign approval package."],
       ["3–6 mo", "Pre-submission meeting with the home regulator; lock the filing strategy (bridging / bibliographic)."],
       ["6–12 mo", "Compile and submit the dossier; finalise CMC and labelling."],
       ["12–18 mo", "Review cycle management; build launch & market-access readiness."]]
    : c.bestComposite >= 60
    ? [["0–2 mo", "Feasibility & evidence review; confirm the gap and data quality."],
       ["2–5 mo", "Scope a bridging study and regulatory pathway; size the investment."],
       ["5–8 mo", "Go / no-go gate with full business case and HEOR inputs."],
       ["8+ mo", "If go: initiate the regulatory program."]]
    : [["0–1 mo", "Add to the active watchlist."],
       ["Quarterly", "Track competitor filings and evidence maturation."],
       ["Trigger", "Re-evaluate when a Phase III readout or competitor approval changes the calculus."]];

  const TOTAL = 16;
  const statusBtns = [["approved", "Approve", V.excellent], ["reviewing", "Reviewing", V.strong], ["flagged", "Flag", V.low]];

  return (
    <div id="case-report" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "#202329", overflowY: "auto", padding: "0 0 60px" }}>

      {/* Toolbar */}
      <div className="report-toolbar" style={{
        position: "sticky", top: 0, zIndex: 5, background: "#15171c", borderBottom: "1px solid #2a2d35",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <button onClick={onClose} style={tbtn(false)}>← Back</button>
        <button onClick={() => window.print()} style={tbtn(true)}>⎙ Print / Save PDF</button>
        <span style={{ flex: 1 }} />
        {statusBtns.map(([id, label, col]) => (
          <button key={id} onClick={() => onSetStatus(c.key, id)} style={tbtn(c.status === id, col)}>{c.status === id ? "✓ " : ""}{label}</button>
        ))}
        <button onClick={() => onTogglePin(c.key)} style={tbtn(c.pinned, GOLD)}>⚲ {c.pinned ? "Pinned" : "Pin"}</button>
        {onSetOutcome && (
          <>
            <span style={{ width: 1, height: 18, background: "#2a2d35", margin: "0 2px" }} />
            <span style={{ font: "600 9px var(--font-mono)", color: "#7a8194", letterSpacing: "1px" }}>OUTCOME</span>
            {OUTCOMES.map(o => (
              <button key={o.id} onClick={() => onSetOutcome(c.key, o.id)} style={tbtn(c.outcome === o.id, o.color)}>
                {c.outcome === o.id ? "✓ " : ""}{o.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Per-case provenance banner — accurate, not alarmist; visible on screen + print */}
      {g.provenance?.confidence === "verified" ? (
        <div className="report-synthetic-banner" style={{
          background: "#103024", borderBottom: "1px solid #1c7a52", color: "#cfeede",
          font: "600 11px var(--font-mono)", letterSpacing: "0.5px", textAlign: "center", padding: "6px 16px",
        }}>
          ✓ SOURCE-VERIFIED — this opportunity is corroborated against a primary source ({g.provenance.source}{g.provenance.nctId ? " · " + g.provenance.nctId : ""}). Always confirm before an investment or clinical decision.
        </div>
      ) : (
        <div className="report-synthetic-banner" style={{
          background: "#3a2e12", borderBottom: "1px solid #5a4a1e", color: "#e8d9a8",
          font: "600 11px var(--font-mono)", letterSpacing: "0.5px", textAlign: "center", padding: "6px 16px",
        }}>
          MODELED ESTIMATE — this indication is not yet source-verified; validate against primary records (regulator label / ClinicalTrials.gov) before use.
        </div>
      )}

      <div style={{ padding: "32px 16px 0" }}>
        {/* ─── PAGE 1 · COVER ─── */}
        <section className="report-page" style={{ background: PAPER, width: "100%", maxWidth: 820, margin: "0 auto 28px", minHeight: 1040, boxShadow: "0 8px 40px rgba(0,0,0,0.35)", padding: 0, position: "relative", overflow: "hidden", color: INK }}>
          <div style={{ background: NAVY, padding: "56px 56px 40px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: "700 13px var(--font-display)", color: GOLD, letterSpacing: "0.5px" }}>ExpandRx</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 10px 5px 6px" }}>
                <CompanyLogo companyId={c.companyId} companyName={c.companyName} size={22} />
                <span style={{ font: "600 12px var(--font-body)", color: "#fff" }}>{c.companyName}</span>
              </span>
            </div>
          </div>
          <div style={{ padding: "60px 56px" }}>
            <div style={{ font: "700 11px var(--font-mono)", color: GOLD, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 14 }}>Indication Expansion Business Case</div>
            <h1 style={{ font: "600 46px var(--font-display)", color: NAVY, lineHeight: 1.05, marginBottom: 10 }}>{c.molecule}</h1>
            <div style={{ font: "400 22px var(--font-display)", color: SUB, marginBottom: 28 }}>for {g.indication}</div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 40 }}>
              {[["Sponsor portfolio", c.companyName], ["Drug class", c.moleculeClass], ["ATC code", c.atc], ["Therapy area", c.ta], ["Target market", homeName]].map(([k, v]) => (
                <div key={k}><div style={{ font: "700 9px var(--font-mono)", color: FAINT, letterSpacing: "1px", textTransform: "uppercase" }}>{k}</div><div style={{ font: "600 15px var(--font-body)", color: INK, marginTop: 3 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 40, padding: "24px 0", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ font: "700 56px var(--font-mono)", color: vc, lineHeight: 1 }}>{c.bestComposite}</div>
                <div style={{ font: "700 9px var(--font-mono)", color: FAINT, letterSpacing: "1px" }}>COMPOSITE / 99</div>
              </div>
              <div style={{ width: 1, height: 70, background: LINE }} />
              <div>
                <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: `${vc}1a`, border: `1.5px solid ${vc}`, color: vc, font: "700 13px var(--font-body)" }}>{g.viabilityLabel} viability</div>
                <div style={{ font: "600 14px var(--font-body)", color: INK, marginTop: 12 }}>{c.action}</div>
                <div style={{ font: "400 12px var(--font-body)", color: SUB, marginTop: 4 }}>Rank #{c.rank} of the active portfolio · {c.gapCount} indication gaps identified</div>
              </div>
              <div style={{ width: 1, height: 70, background: LINE }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ font: "700 30px var(--font-mono)", color: NAVY, lineHeight: 1 }}>{fin ? money(fin.rnpv) : "—"}</div>
                <div style={{ font: "700 9px var(--font-mono)", color: FAINT, letterSpacing: "1px", marginTop: 6 }}>rNPV (RISK-ADJ.)</div>
              </div>
            </div>
            <div style={{ font: "400 11px var(--font-mono)", color: FAINT, marginTop: 28 }}>Prepared by the autonomous swarm · {now ? fmtDate(now) : ""} · This document blends curated and model-generated intelligence and is for internal evaluation only.</div>
          </div>
        </section>

        {/* ─── PAGE 2 · EXECUTIVE SUMMARY ─── */}
        <Page n={2} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="Executive Summary">
          <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
            <StatCard label="Composite" value={`${c.bestComposite}/99`} color={vc} sub={g.viabilityLabel} />
            <StatCard label="PTRS" value={`${ptrsPct}%`} color={DIM.ptrs} sub={`80% CI ${ci}`} />
            <StatCard label="Approved abroad" value={g.approvedIn.length} color={DIM.regulatory} sub={`of 20 markets`} />
            <StatCard label="Competition" value={g.competitors.length === 0 ? "Open" : g.competitors.length} color={g.competitors.length === 0 ? V.excellent : DIM.commercial} sub={g.competitors.length === 0 ? "whitespace" : "rival programs"} />
            {fin && <StatCard label="rNPV" value={money(fin.rnpv)} color={fin.rnpv >= 0 ? V.excellent : V.low} sub="risk-adjusted" />}
            {fin && <StatCard label="Peak sales" value={money(fin.peakSales)} color={DIM.commercial} sub={`${homeName}, annual`} />}
          </div>
          <P><strong style={{ color: INK }}>The opportunity.</strong> {c.narrative}</P>
          <P><strong style={{ color: INK }}>Why it matters.</strong> {c.molecule} is an established molecule with a known safety profile already marketed within the {c.companyName} portfolio. Extending its label to <strong style={{ color: INK }}>{g.indication}</strong> in {homeName} leverages existing manufacturing, an existing safety database and {g.approvedIn.length} prior regulatory {g.approvedIn.length === 1 ? "approval" : "approvals"} abroad — substantially de-risking development versus a new chemical entity.</P>
          <P><strong style={{ color: INK }}>Recommendation.</strong> {c.action}. {c.bestComposite >= 75 ? "This is a top-tier, near-term opportunity and should be resourced now." : c.bestComposite >= 60 ? "This is an attractive opportunity warranting a formal feasibility and bridging-study assessment." : "This opportunity should be monitored and re-evaluated as the evidence base or competitive field evolves."}</P>
          <H3>Bottom line</H3>
          <div style={{ padding: "16px 20px", background: `${vc}0f`, borderLeft: `4px solid ${vc}`, borderRadius: 6 }}>
            <div style={{ font: "500 14px var(--font-body)", color: INK, lineHeight: 1.6 }}>
              A <strong>{g.viabilityLabel.toLowerCase()}</strong> indication-expansion opportunity scoring <strong>{c.bestComposite}/99</strong>, with a <strong>{ptrsPct}%</strong> modelled probability of regulatory success and {g.competitors.length === 0 ? "no direct competitor in the field" : `${g.competitors.length} tracked competitor program(s)`}. Recommended action: <strong>{c.action.replace(/ —.*/, "")}</strong>.
            </div>
          </div>
        </Page>

        {/* ─── PAGE 3 · THE OPPORTUNITY ─── */}
        <Page n={3} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="1. The Opportunity">
          <P>Around the world, the same medicine is approved for different diseases on different timelines. {c.molecule} is already approved for <strong style={{ color: INK }}>{g.indication}</strong> in <strong style={{ color: INK }}>{g.approvedIn.length}</strong> {g.approvedIn.length === 1 ? "market" : "markets"} — but <strong style={{ color: V.low }}>not in {homeName}</strong>. That delta is the opportunity this case quantifies.</P>
          <div style={{ display: "flex", gap: 24, alignItems: "center", margin: "18px 0" }}>
            <Donut value={g.approvedIn.length} total={20} color={DIM.regulatory} label="OF 20" />
            <div style={{ flex: 1 }}>
              <H3>Approval coverage</H3>
              <P>{g.indication} carries regulatory precedent in {g.approvedIn.length} of the 20 tracked markets. {homeName} is open — no approval on file — representing the addressable expansion target. Breadth of prior approval is a strong leading indicator that the home regulator will accept the existing evidence package.</P>
            </div>
          </div>
          <H3>Global approval map</H3>
          <CountryGrid approvedSet={approvedSet} home={homeCountry} />
          <div style={{ display: "flex", gap: 18, marginTop: 12, font: "500 10px var(--font-mono)", color: SUB }}>
            <span><span style={{ color: V.excellent }}>✓</span> Approved ({g.approvedIn.length})</span>
            <span><span style={{ color: V.low }}>◎</span> Target market — open ({homeName})</span>
            <span><span style={{ color: FAINT }}>·</span> Not approved</span>
          </div>
        </Page>

        {/* ─── PAGE 4 · REGULATORY LANDSCAPE ─── */}
        <Page n={4} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="2. Regulatory Landscape">
          <P>The following table maps {c.molecule}&apos;s approval status for {g.indication} across the tracked regulators, with each market&apos;s relative commercial value index. Markets already approved supply transferable dossiers; the target market is where the gap is monetised.</P>
          <Table
            head={["Market / Regulator", "Status", "Value idx"]}
            rows={COUNTRIES.slice().sort((a, b) => getMarketValue(b.code) - getMarketValue(a.code)).slice(0, 14).map(co => [
              `${co.flag} ${co.name} (${co.authority})`,
              co.code === homeCountry ? "◎ TARGET — open" : approvedSet.has(co.code) ? "✓ Approved" : "— Not approved",
              getMarketValue(co.code),
            ])}
          />
          <H3>Regulatory pathway</H3>
          <P>With {g.approvedIn.length} prior {g.approvedIn.length === 1 ? "approval" : "approvals"}, the recommended route is a <strong style={{ color: INK }}>bridging / bibliographic submission</strong> to {getCountry(homeCountry).authority} ({homeName}), citing the foreign approval packages and published evidence rather than repeating pivotal trials. Regulatory-precedent score: <strong style={{ color: INK }}>{g.scores.regulatory}/100</strong>; global-breadth score: <strong style={{ color: INK }}>{g.scores.breadth}/100</strong>.</P>
          {g.provenance?.confidence === "verified" ? (
            <div style={{ marginTop: 12, padding: "10px 14px", border: `1px solid ${V.excellent}`, background: "#e6f4ee", borderRadius: 8 }}>
              <div style={{ font: "700 9px var(--font-mono)", color: V.excellent, letterSpacing: "1px" }}>✓ SOURCE-VERIFIED</div>
              <div style={{ font: "400 12px var(--font-body)", color: INK, marginTop: 4 }}>
                This indication is corroborated against a primary source: <strong>{g.provenance.source}</strong>
                {g.provenance.asOf ? ` (${g.provenance.asOf})` : ""}{g.provenance.nctId ? ` · ${g.provenance.nctId}` : ""}.
                {g.provenance.sourceUrl ? <> <span style={{ color: SUB }}>{g.provenance.sourceUrl}</span></> : null}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12, padding: "8px 14px", border: `1px solid ${LINE}`, background: PAPER2, borderRadius: 8, font: "400 11px var(--font-body)", color: FAINT }}>
              Illustrative record — not yet verified against a primary regulatory/clinical source.
            </div>
          )}
        </Page>

        {/* ─── PAGE 5 · CLINICAL EVIDENCE & PTRS ─── */}
        <Page n={5} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="3. Clinical Evidence & Probability of Success">
          <div style={{ display: "flex", gap: 28, alignItems: "center", marginBottom: 10 }}>
            <div style={{ textAlign: "center" }}>
              <Gauge value={ptrsPct} color={DIM.ptrs} sub={`PTRS · ${g.ptrs.phase}`} />
              <div style={{ font: "500 10px var(--font-mono)", color: SUB, marginTop: 4 }}>80% CI {ci}</div>
            </div>
            <div style={{ flex: 1 }}>
              <H3>Evidence grade</H3>
              <P>Highest evidence tier: <strong style={{ color: INK }}>{evidenceTierLabel(g.evidence)}</strong> ({g.evidence}). The probability of technical and regulatory success (PTRS) is modelled from BIO/QLS phase-transition base rates for the <strong style={{ color: INK }}>{g.ta}</strong> therapeutic area (overall likelihood of approval {Math.round(rates.overall_loa * 100)}% from Phase I), conditioned on the current phase.</P>
              {(() => {
                const adj = houseAdjustedPTRS(g.ptrs.ptrs, g.ta, outcomeStats);
                if (!adj) return null;
                return (
                  <div style={{ marginTop: 10, padding: "10px 14px", border: `1px solid ${GOLD}`, background: "#fbf3e1", borderRadius: 8 }}>
                    <div style={{ font: "700 9px var(--font-mono)", color: GOLD, letterSpacing: "1px" }}>★ HOUSE-ADJUSTED PTRS</div>
                    <div style={{ font: "400 12px var(--font-body)", color: INK, marginTop: 4 }}>
                      Blending the model prior with this desk&apos;s realized {g.ta} outcomes ({adj.n} decided, {(adj.observed * 100).toFixed(0)}% approved):
                      <strong> {(adj.value * 100).toFixed(0)}%</strong> (model {ptrsPct}%). This is the compounding edge — the more outcomes recorded, the more the platform reflects your real-world hit rate.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <H3>Phase progression & timeline</H3>
          <Timeline phase={g.ptrs.phase} months={g.ptrs.remaining} />
          <H3>Phase-transition base rates · {g.ta}</H3>
          <Table head={["Transition", "Probability"]} rows={[
            ["Phase I → Phase II", `${Math.round(rates.p1_p2 * 100)}%`],
            ["Phase II → Phase III", `${Math.round(rates.p2_p3 * 100)}%`],
            ["Phase III → Filing", `${Math.round(rates.p3_nda * 100)}%`],
            ["Filing → Approval", `${Math.round(rates.nda_appr * 100)}%`],
            ["Overall (Ph I → approval)", `${Math.round(rates.overall_loa * 100)}%`],
          ]} />
        </Page>

        {/* ─── PAGE 6 · COMPETITIVE LANDSCAPE ─── */}
        <Page n={6} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="4. Competitive Landscape">
          {g.competitors.length > 0 ? (
            <>
              <P>{g.competitors.length} competitor program{g.competitors.length > 1 ? "s are" : " is"} tracked for {g.indication}. Whitespace score: <strong style={{ color: INK }}>{g.scores.competitive}/100</strong> (higher = less crowded).</P>
              <Table head={["Company", "Asset", "Mechanism", "Phase"]} rows={g.competitors.map(r => [r.company, r.molecule, r.mechanism, r.phase])} />
              <H3>Positioning</H3>
              <P>{c.molecule} competes as a {c.moleculeClass} with an established safety profile and existing manufacturing — a differentiated, lower-cost position versus novel mechanisms in development. Speed-to-file is the principal lever to capture share ahead of pipeline entrants.</P>
            </>
          ) : (
            <>
              <div style={{ padding: "20px 24px", background: "#e6f4ee", border: `1px solid ${V.excellent}`, borderRadius: 8, marginBottom: 16 }}>
                <div style={{ font: "600 18px var(--font-display)", color: V.excellent }}>Open whitespace</div>
                <div style={{ font: "400 13px var(--font-body)", color: SUB, marginTop: 6 }}>No direct competitor program is currently tracked for {g.indication}. {c.molecule} would hold a first-mover position in {homeName}.</div>
              </div>
              <H3>Implication</H3>
              <P>Whitespace is the maximum competitive score ({g.scores.competitive}/100). The principal risk shifts from competition to category creation: the home regulator&apos;s acceptance of endpoints for this indication should be confirmed early, citing the foreign approvals as precedent.</P>
            </>
          )}
        </Page>

        {/* ─── PAGE 7 · COMMERCIAL ASSESSMENT ─── */}
        <Page n={7} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="5. Commercial Assessment">
          <div style={{ display: "flex", gap: 18, marginBottom: 16, flexWrap: "wrap" }}>
            <StatCard label="Patient population" value={g.patientPop !== "N/A" ? g.patientPop : "TBD"} color={DIM.commercial} sub="global, indication-wide" />
            <StatCard label="Commercial score" value={`${g.scores.commercial}`} color={DIM.commercial} sub="/ 100" />
            <StatCard label="Unmet need" value={`${g.scores.unmet}`} color={DIM.unmet} sub="/ 100" />
          </div>
          <H3>Market value by jurisdiction</H3>
          <P>Relative commercial value index of the markets where {g.indication} is already approved (navy) plus the target market {homeName} (red). The target market&apos;s index sizes the prize being unlocked.</P>
          <HBars items={mkts} />
        </Page>

        {/* ─── PAGES 8-10 · COMMERCIAL FINANCIALS (rNPV) ─── */}
        {fin && (
          <>
            <Page n={8} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="6. Commercial Financial Model">
              <P>The model sizes the {homeName} opportunity bottom-up from the global indication population, then builds a risk-adjusted revenue forecast on the finance panel&apos;s indication-expansion benchmarks.{fin.popEstimated ? " The patient population for this indication was not directly available, so a therapy-area default is used (flagged below)." : ""}</P>
              <H3>Market build</H3>
              <Table head={["Driver", "Value"]} rows={[
                ["Global addressable population", fin.popEstimated ? `~${Math.round(fin.globalPop).toLocaleString()} (est.)` : g.patientPop],
                [`Home share — ${homeName} (value-weighted)`, `${fin.homeSharePct.toFixed(1)}%`],
                ["Home addressable population", Math.round(fin.homeAddressable).toLocaleString()],
                [`Peak penetration (${g.ta})`, `${fin.peakPenetrationPct}%`],
                ["Treated patients at peak", Math.round(fin.treatedPeak).toLocaleString()],
                ["Net price / patient / year", money(fin.annualPrice)],
                ["Peak annual net sales", money(fin.peakSales)],
              ]} />
              <H3>Risk-adjusted revenue build</H3>
              <P>Launch in ~{fin.launchYears} year{fin.launchYears > 1 ? "s" : ""}; ramp to peak over {fin.rampYears} year{fin.rampYears > 1 ? "s" : ""}; a {fin.window}-year commercial-advantage window, then generic erosion (≈{ASSUMPTIONS.erosionAtLoEPct}% of peak retained per year). Bars show modelled annual net sales by year from today.</P>
              <RevenueBars rows={fin.revenueByYear} />
            </Page>

            <Page n={9} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="7. rNPV Valuation">
              <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap" }}>
                <StatCard label="rNPV" value={money(fin.rnpv)} color={fin.rnpv >= 0 ? V.excellent : V.low} sub="risk-adjusted NPV" />
                <StatCard label="Unrisked NPV" value={money(fin.npv)} color={NAVY} sub="if approval certain" />
                <StatCard label="Peak sales" value={money(fin.peakSales)} color={DIM.commercial} sub="annual, at peak" />
                <StatCard label="Payback" value={fin.paybackYear ? `Y+${fin.paybackYear}` : "—"} color={DIM.ptrs} sub="from today" />
              </div>
              <H3>Valuation bridge</H3>
              <Waterfall steps={[
                { label: "Gross revenue (NPV)", value: fin.revenueNPV, color: NAVY },
                { label: `Net of COGS + SG&A (${fin.netMarginPct}% margin)`, value: fin.commercialNPV, color: DIM.commercial },
                { label: `Risk-adjusted × PTRS ${fin.ptrsPct}%`, value: fin.commercialNPV * (fin.ptrsPct / 100), color: DIM.ptrs },
                { label: "Less remaining dev + filing", value: -(ASSUMPTIONS.costIncurrenceProb * fin.devNPV), color: V.low },
                { label: "rNPV", value: fin.rnpv, color: GOLD, bold: true },
              ]} />
              <H3>Build</H3>
              <Table head={["Line item", "NPV"]} rows={[
                ["Gross revenue", money(fin.revenueNPV)],
                [`COGS (${fin.cogsPct}%) + SG&A (${fin.sgaPct}%)`, `−${money(fin.revenueNPV - fin.commercialNPV)}`],
                ["Commercial NPV (net)", money(fin.commercialNPV)],
                [`× PTRS (${fin.ptrsPct}%)`, money(fin.commercialNPV * (fin.ptrsPct / 100))],
                [`Less dev + filing × ${Math.round(ASSUMPTIONS.costIncurrenceProb * 100)}% incurrence`, `−${money(ASSUMPTIONS.costIncurrenceProb * fin.devNPV)}`],
                ["rNPV", money(fin.rnpv)],
              ]} />
              <H3>Method</H3>
              <P>{ASSUMPTIONS.rnpvMethod} Discount rate (WACC): {fin.wacc}%.</P>
            </Page>

            <Page n={10} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="8. Sensitivity Analysis">
              <P>Tornado of rNPV to ± swings in each key driver, holding the others at base. <strong style={{ color: INK }}>{fin.sensitivity[0].driver.replace(/ \(.*/, "")}</strong> is the dominant value driver. The vertical line is the base-case rNPV of {money(fin.rnpv)}.</P>
              <Tornado sensitivity={fin.sensitivity} base={fin.rnpv} />
              <H3>Driver ranges</H3>
              <Table head={["Driver", "Bear case", "Bull case"]} rows={fin.sensitivity.map(s => [s.driver, money(Math.min(s.low, s.high)), money(Math.max(s.low, s.high))])} />
              <P>Per the panel, WACC is held as pure cost-of-capital and is <em>not</em> inflated for program risk — that risk is already carried by PTRS, so inflating both would double-count. The technical-failure mode is largely retired for an already-approved molecule, so PTRS swings a narrower band than penetration or price.</P>
            </Page>
          </>
        )}

        {/* ─── PAGE 11 · UNMET NEED ─── */}
        <Page n={11} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="9. Unmet Need & Standard of Care">
          {unmet ? (
            <>
              <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 14 }}>
                <Gauge value={unmet.score} color={DIM.unmet} sub="UNMET NEED" />
                <div style={{ flex: 1 }}>
                  <H3>Current standard of care</H3>
                  <P>{unmet.currentSoC}</P>
                </div>
              </div>
              <H3>Gaps in current treatment</H3>
              <P>{unmet.gaps}</P>
            </>
          ) : (
            <>
              <P>Unmet-need score for {g.indication}: <strong style={{ color: INK }}>{g.scores.unmet}/100</strong>. A formal HEOR / epidemiology assessment is recommended to characterise the current standard of care and quantify the treatment gap in {homeName}.</P>
              <Gauge value={g.scores.unmet} color={DIM.unmet} sub="UNMET NEED" />
            </>
          )}
        </Page>

        {/* ─── PAGE 9 · SCORING ─── */}
        <Page n={12} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="10. Seven-Factor Scoring">
          <P>The composite viability score weights seven independent factors. The radar shows the profile; the table shows each factor&apos;s raw score, weight and weighted contribution.</P>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Radar axes={scoreAxes} />
            <div style={{ flex: 1, minWidth: 280 }}>
              <Table head={["Factor", "Score", "Weight", "Contrib."]} rows={weightRows} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: NAVY, borderRadius: 6 }}>
                <span style={{ font: "700 11px var(--font-mono)", color: "#fff", letterSpacing: "1px" }}>COMPOSITE</span>
                <span style={{ font: "700 16px var(--font-mono)", color: GOLD }}>{g.scores.composite} / 99</span>
              </div>
            </div>
          </div>
        </Page>

        {/* ─── PAGE 10 · ANALYTICAL TRAIL ─── */}
        <Page n={13} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="11. Analytical Trail">
          <P>Every opportunity is assessed by seven specialist functions in sequence. Each examines specific data, reaches a finding, and hands its conclusion to the next. The full chain for this case:</P>
          {stages.map((s, i) => {
            const d = DEPARTMENT_BY_ID[s.dept];
            return (
              <div key={s.dept} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: `2px solid ${d.colorHex}`, color: d.colorHex, display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px var(--font-mono)" }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "600 13px var(--font-body)", color: INK }}>{d.name} <span style={{ font: "500 10px var(--font-mono)", color: FAINT }}>· {d.callsign}</span></div>
                  <div style={{ font: "400 12px var(--font-body)", color: SUB, marginTop: 2 }}>{s.ok ? "✓ " : "· "}{s.found}</div>
                </div>
              </div>
            );
          })}
        </Page>

        {/* ─── PAGE 11 · RISK ─── */}
        <Page n={14} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="12. Risk Assessment">
          <P>Key risks to realising this opportunity, with recommended mitigations.</P>
          <Table head={["Risk", "Level", "Description / mitigation"]} rows={risks.map(r => [r[0], r[1], <span key="x"><span style={{ color: INK }}>{r[2]}</span><br /><span style={{ color: GOLD, fontStyle: "italic" }}>Mitigation: {r[3]}</span></span>])} />
        </Page>

        {/* ─── PAGE 12 · SUPPORTING PORTFOLIO ─── */}
        <Page n={15} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="13. Supporting Indication Portfolio">
          <P>Beyond the headline opportunity, {c.molecule} carries <strong style={{ color: INK }}>{c.gapCount}</strong> total indication {c.gapCount === 1 ? "gap" : "gaps"} in {homeName}. Each represents an additional, independent expansion option that compounds the value of the asset.</P>
          <Table head={["Indication", "Evidence", "Markets", "PTRS", "Composite"]} rows={allGaps.map(x => [
            x.indication, evidenceTierLabel(x.evidence), x.approvedIn.length, `${Math.round(x.ptrs.ptrs * 100)}%`, x.scores.composite,
          ])} />
        </Page>

        {/* ─── PAGE 13 · RECOMMENDATION ─── */}
        <Page n={16} total={TOTAL} molecule={c.molecule} companyId={c.companyId} companyName={c.companyName} label="14. Recommendation & Next Steps">
          <div style={{ padding: "18px 22px", background: `${vc}0f`, borderLeft: `4px solid ${vc}`, borderRadius: 6, marginBottom: 18 }}>
            <div style={{ font: "700 10px var(--font-mono)", color: GOLD, letterSpacing: "1.5px" }}>RECOMMENDED ACTION</div>
            <div style={{ font: "600 18px var(--font-display)", color: NAVY, marginTop: 4 }}>{c.action}</div>
          </div>
          <H3>Phased plan</H3>
          <Table head={["Horizon", "Activity"]} rows={plan} />
          <H3>Methodology & data provenance</H3>
          <P>Scores derive from a transparent 7-factor model (evidence, global breadth, regulatory precedent, commercial, PTRS, unmet need, competitive whitespace) over an illustrative dataset of 1,700+ molecules across 20 regulatory jurisdictions. PTRS uses BIO/QLS therapeutic-area phase-transition base rates. <strong style={{ color: INK }}>All factual claims — approvals, trials, competitors, populations — must be validated against primary sources before any investment decision.</strong></P>
        </Page>
      </div>
    </div>
  );
}

function tbtn(active, col = "#d4a853") {
  return {
    background: active ? `${col}22` : "transparent",
    border: `1px solid ${active ? col : "#3a3d45"}`,
    borderRadius: 6, padding: "6px 13px", color: active ? col : "#c7ccd6",
    font: "600 12px var(--font-body)", cursor: "pointer",
  };
}
