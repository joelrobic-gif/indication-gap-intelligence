"use client";
// ═══ LANDING — "Who we are / What we do" ═══
// Marketing-forward entry surface. Theme: CLARITY OF SIGNAL. Communicates who it's
// for, the value, how it works, and how it innovates vs the industry. Honest:
// frames capability truthfully (models the global approval map; decision-ready
// cases) and carries an illustrative-dataset note — no live-regulator overclaim.

import { useEffect, useState } from "react";

const GOLD = "var(--brand-gold)";

function Stat({ n, label }) {
  return (
    <div style={{ textAlign: "center", minWidth: 110 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{n}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1.5, color: "var(--text-tertiary)", textTransform: "uppercase", marginTop: 8 }}>{label}</div>
    </div>
  );
}

function Section({ kicker, title, children, id }) {
  return (
    <section id={id} style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--space-12) var(--space-6)" }}>
      {kicker && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 2.5, color: GOLD, textTransform: "uppercase", marginBottom: "var(--space-3)" }}>{kicker}</div>}
      {title && <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.08, marginBottom: "var(--space-6)", maxWidth: 760 }}>{title}</h2>}
      {children}
    </section>
  );
}

export function Landing({ onEnter }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = document.getElementById("landing-scroll");
    if (!el) return;
    const f = () => setScrolled(el.scrollTop > 40);
    el.addEventListener("scroll", f);
    return () => el.removeEventListener("scroll", f);
  }, []);

  const audiences = [
    { icon: "◈", title: "Business Development & Licensing", body: "Find the next in-licensing or label-expansion play and walk into the committee with the case already built." },
    { icon: "▲", title: "Portfolio & Pipeline Strategy", body: "Rank every asset's untapped indications by risk-adjusted value — see where the portfolio's hidden upside actually sits." },
    { icon: "✚", title: "Regulatory & Medical Affairs", body: "Spot uses approved abroad but open at home, and the bridging pathway to file them faster and cheaper." },
    { icon: "◎", title: "Generic & Specialty manufacturers", body: "Turn a repurposing mandate into a ranked work-list — established molecules, new indications, lower development risk." },
  ];

  const steps = [
    { n: "01", t: "Scan the world", d: "Model every drug across the portfolio against the global approval map — 20 regulators, 40 manufacturers, 1,700+ molecules." },
    { n: "02", t: "Find the gap", d: "Surface the uses approved somewhere but missing at home. Approved abroad + open at home = the opportunity." },
    { n: "03", t: "Score & value", d: "A transparent 7-factor model and a full risk-adjusted NPV (rNPV) with sensitivity — every input visible." },
    { n: "04", t: "Decide", d: "Not a dashboard to interpret — a ranked, one-page business case, print-ready for the investment committee." },
  ];

  const pillars = [
    { t: "Signal over noise", d: "Tens of thousands of drug × disease combinations, filtered to the handful of high-conviction plays and ranked. You start at the answer, not the spreadsheet." },
    { t: "Traceable, not black-box", d: "Every score and every dollar of rNPV shows its inputs, weights, and assumptions. Clarity of signal means you can see exactly why an opportunity ranks where it does." },
    { t: "Decision-ready", d: "The output isn't a data export — it's a costed, sourced business case with a recommended action. Built for the moment of decision, not the months before it." },
  ];

  const vs = [
    ["Raw data feeds — you build the case", "A ranked opportunity with the case already written"],
    ["Hand-built rNPV in Excel, one analyst at a time", "Instant, consistent rNPV + sensitivity on every opportunity"],
    ["Point estimates, no confidence", "Probability-of-success with confidence intervals and a tornado"],
    ["Static quarterly refresh", "Always-on engine that re-scores as the science moves"],
    ["A dashboard you interpret", "A decision you act on"],
  ];

  return (
    <div id="landing-scroll" style={{ height: "100vh", overflowY: "auto", background: "var(--surface-base)", color: "var(--text-primary)" }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", gap: "var(--space-5)",
        padding: "14px var(--space-6)", backdropFilter: "blur(12px)",
        background: scrolled ? "rgba(8,8,13,0.82)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--surface-border)" : "1px solid transparent",
        transition: "background var(--duration-standard), border-color var(--duration-standard)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: GOLD, letterSpacing: "-0.01em" }}>ExpandRx</span>
        <div style={{ flex: 1 }} />
        <a href="#how" style={navLink}>How it works</a>
        <a href="#why" style={navLink}>Why ExpandRx</a>
        <a href="#who" style={navLink}>Who it's for</a>
        <button onClick={onEnter} style={ctaSm}>Enter the platform →</button>
      </nav>

      {/* Hero */}
      <header style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--surface-border-subtle)" }}>
        <HeroBackdrop />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--space-12) var(--space-6) var(--space-10)", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 20, border: `1px solid ${GOLD}`, background: "var(--brand-gold-dim)", marginBottom: "var(--space-6)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, animation: "pulse 1.8s var(--ease-standard) infinite" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.5, color: GOLD, textTransform: "uppercase" }}>Indication-expansion intelligence</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.02em", maxWidth: 900, marginBottom: "var(--space-6)" }}>
            Every medicine approved <span style={{ color: GOLD }}>somewhere</span> is a medicine you can bring <span style={{ color: GOLD }}>home</span>.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-lg)", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 660, marginBottom: "var(--space-8)" }}>
            ExpandRx turns the world&apos;s fragmented drug-approval map into a ranked, costed, decision-ready set of
            indication-expansion opportunities — so the right molecule for the right disease never slips through the gap.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={onEnter} style={ctaLg}>Enter the platform →</button>
            <a href="#how" style={ctaGhost}>See how it works</a>
          </div>
          <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", marginTop: "var(--space-12)", paddingTop: "var(--space-8)", borderTop: "1px solid var(--surface-border-subtle)" }}>
            <Stat n="1,700+" label="Molecules modelled" />
            <Stat n="40" label="Manufacturer portfolios" />
            <Stat n="20" label="Global regulators" />
            <Stat n="7-factor" label="rNPV scoring" />
          </div>
        </div>
      </header>

      {/* What we do */}
      <Section kicker="What we do" title="We find the opportunities hiding in plain sight — and hand you the decision.">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-lg)", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 760 }}>
          A drug&apos;s biology doesn&apos;t change at a border — but its approvals do. The same molecule is cleared for a new
          disease in one market years before another. That lag is real, repeatable value, and today it&apos;s found by hand,
          one analyst and one spreadsheet at a time. ExpandRx does it continuously, across the whole portfolio, and
          turns each find into a business case you can act on.
        </p>
      </Section>

      {/* How it works */}
      <Section id="how" kicker="How it works" title="From the global approval map to a committee-ready case — in four moves.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "var(--space-4)" }}>
          {steps.map(s => (
            <div key={s.n} style={{ background: "var(--surface-raised)", border: "1px solid var(--surface-border)", borderTop: `2px solid ${GOLD}`, borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xl)", fontWeight: 700, color: GOLD, opacity: 0.5 }}>{s.n}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 600, margin: "var(--space-2) 0" }}>{s.t}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.55 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Why — clarity of signal */}
      <section id="why" style={{ background: "var(--surface-raised)", borderTop: "1px solid var(--surface-border-subtle)", borderBottom: "1px solid var(--surface-border-subtle)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--space-12) var(--space-6)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 2.5, color: GOLD, textTransform: "uppercase", marginBottom: "var(--space-3)" }}>Why ExpandRx · clarity of signal</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, lineHeight: 1.08, marginBottom: "var(--space-4)", maxWidth: 820 }}>
            The industry hands you data. ExpandRx hands you a decision.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-lg)", color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 760, marginBottom: "var(--space-8)" }}>
            Everyone has access to the same approvals, trials and pipelines. The edge isn&apos;t more data — it&apos;s
            <strong style={{ color: "var(--text-primary)" }}> clarity of signal</strong>: cutting the noise down to the few
            opportunities that matter, showing exactly why they matter, and packaging them so a decision can actually be made.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
            {pillars.map((p, i) => (
              <div key={i} style={{ background: "var(--surface-base)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: GOLD, letterSpacing: 1 }}>0{i + 1}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, margin: "var(--space-2) 0 var(--space-3)" }}>{p.t}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* vs industry */}
      <Section kicker="How it innovates" title="More than a data feed. A decision engine.">
        <div style={{ border: "1px solid var(--surface-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--surface-overlay)" }}>
            <div style={{ padding: "var(--space-3) var(--space-5)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--text-tertiary)", textTransform: "uppercase" }}>The industry</div>
            <div style={{ padding: "var(--space-3) var(--space-5)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.5, color: GOLD, textTransform: "uppercase", borderLeft: "1px solid var(--surface-border)" }}>ExpandRx</div>
          </div>
          {vs.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--surface-border)" }}>
              <div style={{ padding: "var(--space-4) var(--space-5)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>{row[0]}</div>
              <div style={{ padding: "var(--space-4) var(--space-5)", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-primary)", borderLeft: "1px solid var(--surface-border)", background: "var(--brand-gold-mid)" }}>
                <span style={{ color: GOLD, marginRight: 8 }}>✓</span>{row[1]}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Who it's for */}
      <Section id="who" kicker="Who it's for" title="Built for the people who decide which molecule moves next.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-4)" }}>
          {audiences.map((a, i) => (
            <div key={i} style={{ background: "var(--surface-raised)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
              <div style={{ fontSize: 22, color: GOLD, marginBottom: "var(--space-3)" }}>{a.icon}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--space-2)" }}>{a.title}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>{a.body}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section style={{ borderTop: "1px solid var(--surface-border-subtle)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-12) var(--space-6)", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, lineHeight: 1.1, marginBottom: "var(--space-5)" }}>
            See the opportunities your portfolio is already sitting on.
          </h2>
          <button onClick={onEnter} style={ctaLg}>Enter the platform →</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--surface-border)", padding: "var(--space-6)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: GOLD }}>ExpandRx</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)", maxWidth: 540, textAlign: "right", lineHeight: 1.5 }}>
            Demonstration platform — figures shown use an illustrative dataset for evaluation, not sourced regulatory records.
            Not for investment or clinical decisions.
          </span>
        </div>
      </footer>
    </div>
  );
}

function HeroBackdrop() {
  // converging "funnel" lines — clarity-of-signal motif
  return (
    <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
      <defs>
        <radialGradient id="hg" cx="78%" cy="30%" r="60%">
          <stop offset="0" stopColor="rgba(212,168,83,0.18)" />
          <stop offset="1" stopColor="rgba(212,168,83,0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="520" fill="url(#hg)" />
      {Array.from({ length: 22 }).map((_, i) => {
        const y0 = (i / 21) * 520;
        return <line key={i} x1="0" y1={y0} x2="980" y2="260" stroke="rgba(212,168,83,0.10)" strokeWidth="1" />;
      })}
      <circle cx="980" cy="260" r="5" fill="var(--brand-gold)" />
      <circle cx="980" cy="260" r="14" fill="none" stroke="rgba(212,168,83,0.5)" strokeWidth="1" />
    </svg>
  );
}

const navLink = { fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--text-secondary)", textDecoration: "none" };
const ctaLg = { background: GOLD, border: "none", borderRadius: "var(--radius-md)", padding: "13px 24px", color: "var(--text-inverse)", fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: 700, cursor: "pointer" };
const ctaSm = { background: "transparent", border: `1px solid ${GOLD}`, borderRadius: "var(--radius-sm)", padding: "7px 14px", color: GOLD, fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer" };
const ctaGhost = { background: "transparent", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-md)", padding: "13px 22px", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "var(--text-base)", fontWeight: 600, cursor: "pointer", textDecoration: "none" };
