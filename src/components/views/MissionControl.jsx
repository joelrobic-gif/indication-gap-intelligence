"use client";
// ═══ MISSION CONTROL ═══
// The assembly line, made transparent. One molecule enters at the top and is
// handed down through seven real pharmaceutical departments. Each stage shows:
//   • what it LOOKS FOR        • the DATA SOURCES it reads
//   • what it RECEIVES (live)  • the exact CONTENT it examined (live)
//   • what it FOUND (live)     • what it PASSES ON to the next team (live)
// A live verdict feed runs alongside. Click any verdict to open the full case.

import { memo } from "react";
import { DEPARTMENTS } from "../../lib/engine/departments";
import { CompanyLogo } from "../primitives/CompanyLogo";

function timeAgo(ts, now) {
  const s = Math.max(0, Math.floor(((now || ts) - ts) / 1000));
  if (s < 5) return "now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function MissionControl({ deptStats, feed, running, onOpenCase, now }) {
  // All departments examine the same molecule each tick — read it from any lane.
  const onLine = deptStats?.strategist?.current || deptStats?.scout?.current || null;

  return (
    <div style={{ padding: "var(--space-5)", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 330px", gap: "var(--space-5)", alignItems: "start" }}>
      {/* Pipeline */}
      <div>
        {/* Intro + what's on the line */}
        <div style={{ marginBottom: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-primary)" }}>The assembly line</h2>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: running ? "var(--viability-excellent)" : "var(--text-tertiary)", letterSpacing: 0.5 }}>
              {running ? "● live · departments working" : "paused"}
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, maxWidth: 680 }}>
            One molecule enters at the top and is handed down through seven departments. Each shows what it
            looks for, the exact data it examined, what it found, and what it passes to the next team.
          </p>

          {/* On the line now */}
          <div style={{
            marginTop: "var(--space-4)", padding: "var(--space-3) var(--space-4)",
            background: "var(--surface-raised)", border: "1px solid var(--surface-border)",
            borderLeft: "3px solid var(--brand-gold)", borderRadius: "var(--radius-md)",
            display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase" }}>On the line now</span>
            {onLine ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)" }}>
                <CompanyLogo companyId={onLine.companyId} companyName={onLine.company} size={18} showName />
                <span style={{ color: "var(--text-tertiary)" }}>·</span>
                <strong>{onLine.molecule}</strong>
                <span style={{ color: "var(--text-tertiary)" }}>· {onLine.indication}</span>
              </span>
            ) : (
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)" }}>warming up…</span>
            )}
          </div>
        </div>

        {/* The 7 stages */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {DEPARTMENTS.map((d, i) => (
            <StageRow key={d.id} dept={d} stat={deptStats[d.id]} running={running} isLast={i === DEPARTMENTS.length - 1} />
          ))}
        </div>
      </div>

      {/* Live feed */}
      <aside style={{ position: "sticky", top: 110 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)" }}>Verdict feed</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--brand-gold)" }}>★ Business Dev</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          {feed.length === 0 && (
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-tertiary)", padding: "var(--space-4)", textAlign: "center" }}>
              Warming up… verdicts appear here as the swarm scans.
            </div>
          )}
          {feed.map(ev => <FeedRow key={ev.id} ev={ev} now={now} onClick={() => onOpenCase(ev.moleculeKey)} />)}
        </div>
      </aside>
    </div>
  );
}

const StageRow = memo(function StageRow({ dept, stat, running, isLast }) {
  const cur = stat?.current;
  const active = running && cur;
  const examined = cur?.examined || [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", columnGap: "var(--space-3)" }}>
      {/* Rail: number + connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "var(--surface-raised)", border: `2px solid ${dept.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: dept.color, fontSize: 16,
          boxShadow: active ? `0 0 0 4px ${dept.colorHex}22` : "none",
          transition: "box-shadow var(--duration-standard)",
        }}>{dept.glyph}</div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 24, background: "var(--surface-border)", marginTop: 2 }} />}
      </div>

      {/* Card */}
      <section style={{
        background: "var(--surface-raised)", border: "1px solid var(--surface-border)",
        borderRadius: "var(--radius-lg)", padding: "var(--space-4)", marginBottom: "var(--space-4)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)", letterSpacing: 1 }}>STAGE {dept.n}/7</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: dept.color, border: `1px solid ${dept.colorHex}55`, borderRadius: 2, padding: "1px 5px", letterSpacing: 0.5 }}>{dept.callsign}</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.15, marginTop: 3 }}>{dept.name}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{dept.role}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: dept.color, fontVariantNumeric: "tabular-nums" }}>{(stat?.processed || 0).toLocaleString()}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--text-tertiary)", letterSpacing: 1, textTransform: "uppercase" }}>analyzed</div>
          </div>
        </div>

        {/* Looks for */}
        <FieldRow label="Looks for">
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-primary)" }}>{dept.looksFor}</span>
        </FieldRow>

        {/* Data sources */}
        <FieldRow label="Data sources">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {dept.reads.map((r, i) => (
              <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-secondary)", background: "var(--surface-base)", border: "1px solid var(--surface-border)", borderRadius: "var(--radius-sm)", padding: "2px 6px" }}>{r}</span>
            ))}
          </div>
        </FieldRow>

        {/* Live work box */}
        <div style={{
          marginTop: "var(--space-3)", padding: "var(--space-3)", borderRadius: "var(--radius-md)",
          background: "var(--surface-base)", border: `1px solid ${active ? dept.colorHex + "55" : "var(--surface-border)"}`,
          transition: "border-color var(--duration-standard)",
        }}>
          {/* Receives */}
          <Handoff dir="in" label="Receives" text={dept.handoffIn} color={dept.color} />

          {/* Examining */}
          <div style={{ margin: "var(--space-3) 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? dept.color : "var(--text-tertiary)", animation: active ? "pulse 1.4s var(--ease-standard) infinite" : "none" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase" }}>{active ? "Examining now" : "Idle — awaiting molecule"}</span>
            </div>
            {examined.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "var(--space-3)", rowGap: 4 }}>
                {examined.map(([k, v], i) => (
                  <Row key={i} k={k} v={v} />
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-tertiary)" }}>—</div>
            )}
          </div>

          {/* Found */}
          <div style={{ marginBottom: "var(--space-3)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 3 }}>Found</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: cur ? (cur.ok ? "var(--viability-excellent)" : "var(--text-primary)") : "var(--text-tertiary)", lineHeight: 1.4 }}>
              {cur ? `${cur.ok ? "✓ " : "· "}${cur.found}` : "awaiting first scan…"}
            </div>
          </div>

          {/* Passes on */}
          <Handoff dir="out" label="Passes on" text={cur?.handoff || dept.handoffOut} color={dept.color} highlight />
        </div>
      </section>
    </div>
  );
});

function Row({ k, v }) {
  return (
    <>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-tertiary)", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{k}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-primary)", wordBreak: "break-word" }}>{v}</span>
    </>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-2)", alignItems: "baseline" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase", width: 76, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function Handoff({ dir, label, text, color, highlight }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color, fontSize: 13, flexShrink: 0 }}>{dir === "in" ? "↳" : "→"}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 1, color: "var(--text-tertiary)", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: highlight ? color : "var(--text-secondary)", fontWeight: highlight ? 600 : 400, lineHeight: 1.3 }}>{text}</span>
    </div>
  );
}

const FeedRow = memo(function FeedRow({ ev, now, onClick }) {
  const vColor = `var(--viability-${ev.viability})`;
  return (
    <button onClick={onClick} style={{
      textAlign: "left", background: "var(--surface-raised)", border: "1px solid var(--surface-border)",
      borderLeft: `3px solid ${vColor}`, borderRadius: "var(--radius-md)", padding: "var(--space-3)",
      cursor: "pointer", animation: "slideIn var(--duration-standard) var(--ease-out) both", width: "100%",
      display: "flex", flexDirection: "column", gap: 3,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{ev.molecule}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: vColor, fontVariantNumeric: "tabular-nums" }}>{ev.composite}</span>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.3 }}>{ev.indication}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-tertiary)" }}>{ev.action}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
        <CompanyLogo companyId={ev.companyId} companyName={ev.company} size={13} showName />
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {ev.whitespace && <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "var(--viability-excellent)", border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", padding: "1px 4px", borderRadius: 2, letterSpacing: 0.5 }}>WHITESPACE</span>}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-tertiary)" }}>{timeAgo(ev.ts, now)}</span>
        </div>
      </div>
    </button>
  );
});
