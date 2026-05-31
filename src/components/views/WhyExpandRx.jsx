"use client";
// ═══ WHY EXPANDRX — apples-to-apples vs the field ═══
// Feature + cost matrix against the real competitive set (see COMPETITORS.md).
// Honest: ExpandRx leads on the decision layer; incumbents lead on licensed data.

const GOLD = "var(--brand-gold)";
const YES = "var(--viability-excellent)";
const NO = "var(--viability-low)";
const PARTIAL = "var(--viability-strong)";

// Columns: ExpandRx + the comparators.
const COLS = [
  { key: "exp", name: "ExpandRx", us: true },
  { key: "cort", name: "Cortellis" },
  { key: "iqvia", name: "IQVIA" },
  { key: "cite", name: "Citeline" },
  { key: "eval", name: "Evaluate" },
  { key: "gd", name: "GlobalData" },
  { key: "dpw", name: "DrugPatentWatch" },
  { key: "okg", name: "Open KGs" },
];

// cell value: "y" full · "p" partial · "n" none · text = note
const ROWS = [
  { cap: "Ranked indication-expansion opportunities", exp: "y", cort: "p", iqvia: "n", cite: "p", eval: "n", gd: "p", dpw: "n", okg: "p" },
  { cap: "Per-opportunity rNPV valuation", exp: "y", cort: "n", iqvia: "n", cite: "n", eval: "p", gd: "n", dpw: "n", okg: "n" },
  { cap: "Sensitivity / tornado analysis", exp: "y", cort: "n", iqvia: "n", cite: "n", eval: "p", gd: "n", dpw: "n", okg: "n" },
  { cap: "Committee-ready business-case dossier", exp: "y", cort: "p", iqvia: "n", cite: "n", eval: "n", gd: "n", dpw: "n", okg: "n" },
  { cap: "Transparent, traceable scoring", exp: "y", cort: "p", iqvia: "n", cite: "p", eval: "p", gd: "p", dpw: "p", okg: "y" },
  { cap: "Global regulatory-gap mapping", exp: "y", cort: "y", iqvia: "y", cite: "p", eval: "p", gd: "y", dpw: "p", okg: "n" },
  { cap: "Competitive-pipeline intel", exp: "p", cort: "y", iqvia: "y", cite: "y", eval: "p", gd: "y", dpw: "p", okg: "n" },
  { cap: "Real licensed data at scale", exp: "p", cort: "y", iqvia: "y", cite: "y", eval: "y", gd: "y", dpw: "y", okg: "p" },
  { cap: "Source citations on every claim", exp: "p", cort: "y", iqvia: "y", cite: "y", eval: "y", gd: "y", dpw: "y", okg: "y" },
  { cap: "Outcome-feedback calibration (moat)", exp: "y", cort: "n", iqvia: "n", cite: "n", eval: "n", gd: "n", dpw: "n", okg: "n" },
  { cap: "Always-on monitoring engine", exp: "y", cort: "p", iqvia: "p", cite: "p", eval: "n", gd: "p", dpw: "n", okg: "n" },
];

const COST = { exp: "~$40–75k POC", cort: "six-figures/yr", iqvia: "$600k–1M+/yr", cite: "six-figures/yr", eval: "six-figures/yr", gd: "$30–80k/yr", dpw: "$3–8k/yr", okg: "free" };

function Mark({ v }) {
  if (v === "y") return <span style={{ color: YES, fontSize: 16, fontWeight: 700 }}>✓</span>;
  if (v === "p") return <span style={{ color: PARTIAL, fontSize: 14 }} title="partial">◐</span>;
  if (v === "n") return <span style={{ color: NO, fontSize: 14, opacity: 0.7 }}>✗</span>;
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-secondary)" }}>{v}</span>;
}

export function WhyExpandRx() {
  return (
    <div style={{ padding: "var(--space-8) var(--space-5)", maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 2, color: GOLD, textTransform: "uppercase", marginBottom: "var(--space-3)" }}>Why ExpandRx · apples to apples</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, lineHeight: 1.1, marginBottom: "var(--space-4)", maxWidth: 820 }}>
        The field sells data. ExpandRx delivers the decision.
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-lg)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 760, marginBottom: "var(--space-8)" }}>
        Everyone has the approvals, trials and pipelines. The gap is what you do with them. Below: how ExpandRx
        stacks against the incumbents on the things that actually drive an indication-expansion decision — and at what cost.
      </p>

      {/* Matrix */}
      <div style={{ overflowX: "auto", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-lg)" }}>
        <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "var(--space-3) var(--space-4)", position: "sticky", left: 0, background: "var(--surface-raised)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase", borderBottom: "2px solid var(--surface-border)" }}>Capability</th>
              {COLS.map(c => (
                <th key={c.key} style={{
                  padding: "var(--space-3) var(--space-2)", borderBottom: "2px solid var(--surface-border)",
                  background: c.us ? "var(--brand-gold-mid)" : "var(--surface-raised)",
                  fontFamily: c.us ? "var(--font-display)" : "var(--font-mono)",
                  fontSize: c.us ? 13 : 10, fontWeight: c.us ? 700 : 500,
                  color: c.us ? GOLD : "var(--text-secondary)", letterSpacing: c.us ? 0 : 0.5, whiteSpace: "nowrap",
                }}>{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? "var(--surface-base)" : "var(--surface-raised)" }}>
                <td style={{ padding: "10px var(--space-4)", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)", position: "sticky", left: 0, background: "inherit", borderBottom: "1px solid var(--surface-border-subtle)" }}>{r.cap}</td>
                {COLS.map(c => (
                  <td key={c.key} style={{ textAlign: "center", padding: "10px var(--space-2)", borderBottom: "1px solid var(--surface-border-subtle)", background: c.us ? "var(--brand-gold-mid)" : "transparent" }}>
                    <Mark v={r[c.key]} />
                  </td>
                ))}
              </tr>
            ))}
            {/* cost row */}
            <tr>
              <td style={{ padding: "12px var(--space-4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0.5, color: GOLD, textTransform: "uppercase", position: "sticky", left: 0, background: "var(--surface-overlay)", borderTop: "2px solid var(--surface-border)" }}>Cost (est.)</td>
              {COLS.map(c => (
                <td key={c.key} style={{ textAlign: "center", padding: "12px 6px", borderTop: "2px solid var(--surface-border)", background: c.us ? "var(--brand-gold-dim)" : "var(--surface-overlay)", fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: c.us ? 700 : 400, color: c.us ? GOLD : "var(--text-secondary)" }}>{COST[c.key]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-4)", flexWrap: "wrap", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)" }}>
        <span><span style={{ color: YES }}>✓</span> full</span>
        <span><span style={{ color: PARTIAL }}>◐</span> partial / adjacent</span>
        <span><span style={{ color: NO }}>✗</span> not offered</span>
        <span style={{ marginLeft: "auto" }}>Costs are research estimates (vendors keep pricing confidential); DrugPatentWatch is publicly listed. See COMPETITORS.md.</span>
      </div>

      {/* Win cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)", marginTop: "var(--space-8)" }}>
        {[
          { t: "Decision, not data", d: "Incumbents hand you feeds; your analyst still builds the rNPV case in Excel. ExpandRx outputs the ranked, costed, committee-ready dossier directly." },
          { t: "A fraction of the cost", d: "A full incumbent stack runs $200k–$1M+/yr. ExpandRx is a focused tool priced for the generics/specialty tier that's otherwise locked out." },
          { t: "An edge they don't have", d: "The outcome-feedback loop tunes probabilities to your desk's real hit rate over time — proprietary signal no data feed provides." },
        ].map((c, i) => (
          <div key={i} style={{ background: "var(--surface-raised)", border: "1px solid var(--surface-border)", borderTop: `2px solid ${GOLD}`, borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-2)" }}>{c.t}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.d}</div>
          </div>
        ))}
      </div>

      {/* honest line */}
      <div style={{ marginTop: "var(--space-6)", padding: "var(--space-4)", background: "var(--surface-raised)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--text-secondary)" }}>Where the incumbents win, honestly:</strong> real, licensed, citation-backed data at global scale — that's their moat and ExpandRx's
        build-out priority (a verified, source-cited dataset is rolling out therapy-area by therapy-area). The strongest position
        is ExpandRx&apos;s decision layer riding a golden data source, not replacing it.
      </div>
    </div>
  );
}
